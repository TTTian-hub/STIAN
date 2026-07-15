'use client';

import { useState, useCallback, useRef } from 'react';

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

    options.onStart?.();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const endpoint = streamOptions.endpoint || '/api/ai/stream';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: streamOptions.systemPrompt,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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

    try {
      const endpoint = completeOptions.endpoint || '/api/ai/complete';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          systemPrompt: completeOptions.systemPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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
