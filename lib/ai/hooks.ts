'use client';

import { useState, useCallback, useRef } from 'react';
import { getToken, ensureTrial } from '@/lib/quota';
import { usePaywall } from '@/lib/paywall-store';
import { useBalance } from '@/lib/balance-store';

function newRequestId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return `r_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface UseAIStreamOptions {
  onStart?: () => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
}

interface UseAIStreamReturn {
  stream: (prompt: string, options?: { systemPrompt?: string; endpoint?: string }) => Promise<void>;
  isLoading: boolean;
  isStreaming: boolean;
  text: string;
  error: Error | null;
  abort: () => void;
  reset: () => void;
}

export function useAIStream(options: UseAIStreamOptions = {}): UseAIStreamReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const fullTextRef = useRef('');

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    abort();
    setText('');
    setError(null);
    fullTextRef.current = '';
  }, [abort]);

  const stream = useCallback(async (
    prompt: string,
    streamOptions: { systemPrompt?: string; endpoint?: string } = {}
  ) => {
    // Reset state
    setText('');
    setError(null);
    fullTextRef.current = '';

    setIsLoading(true);
    setIsStreaming(false);

    // 确保持有有效的 entitlement token（供 middleware 放行 + 服务端识别用户）。
    // 注意：真正的剩余次数以服务端数据库为准，前端不再本地记账。
    let token = getToken();
    if (!token) {
      await ensureTrial();
      token = getToken();
    }

    options.onStart?.();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const endpoint = streamOptions.endpoint || '/api/ai/stream';
      const request_id = newRequestId();

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-entitlement': token || '',
        },
        body: JSON.stringify({
          prompt,
          systemPrompt: streamOptions.systemPrompt,
          request_id,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // 余额不足 / 无凭证：弹付费墙，并把服务端提示（如"还差 X 次"）透传给 UI
        if (response.status === 402) {
          usePaywall.getState().openPaywall();
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      setIsLoading(false);
      setIsStreaming(true);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullTextRef.current += chunk;
        setText(fullTextRef.current);
      }

      setIsStreaming(false);
      abortControllerRef.current = null;
      // 以服务端余额为准，刷新显示
      useBalance.getState().refresh();
      options.onComplete?.(fullTextRef.current);

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      // Don't report abort errors as actual errors
      if (error.name === 'AbortError') {
        setIsStreaming(false);
        setIsLoading(false);
        return;
      }

      setError(error);
      setIsStreaming(false);
      setIsLoading(false);
      abortControllerRef.current = null;
      options.onError?.(error);
    }
  }, [options, abort]);

  return {
    stream,
    isLoading,
    isStreaming,
    text,
    error,
    abort,
    reset,
  };
}

// Hook for non-streaming completion
interface UseAICompleteReturn {
  complete: (prompt: string, options?: { systemPrompt?: string; endpoint?: string }) => Promise<string>;
  isLoading: boolean;
  error: Error | null;
  reset: () => void;
}

export function useAIComplete(): UseAICompleteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const complete = useCallback(async (
    prompt: string,
    completeOptions: { systemPrompt?: string; endpoint?: string } = {}
  ): Promise<string> => {
    setIsLoading(true);
    setError(null);

    // 确保持有有效的 entitlement token（真正余额以服务端为准）
    let token = getToken();
    if (!token) {
      await ensureTrial();
      token = getToken();
    }

    try {
      const endpoint = completeOptions.endpoint || '/api/ai/complete';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-entitlement': token || '',
        },
        body: JSON.stringify({
          prompt,
          systemPrompt: completeOptions.systemPrompt,
          request_id: newRequestId(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 402) {
          usePaywall.getState().openPaywall();
        }
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      useBalance.getState().refresh();
      setIsLoading(false);
      return data.text || '';

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsLoading(false);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    complete,
    isLoading,
    error,
    reset,
  };
}
