import { AIProvider, AIOptions } from '../types';

export class DeepSeekProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    // DeepSeek API endpoint
    const rawBaseUrl = baseUrl || process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';
    // Remove trailing slash to avoid double slash in URL
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
    this.defaultModel = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
    console.log('[DeepSeekProvider] Initialized with baseUrl:', this.baseUrl, 'model:', this.defaultModel);
  }

  async streamCompletion(prompt: string, options?: AIOptions): Promise<ReadableStream> {
    const url = `${this.baseUrl}/chat/completions`;
    console.log('[DeepSeekProvider] Request URL:', url);
    const FETCH_TIMEOUT = Number(process.env.DEEPSEEK_TIMEOUT_MS || 20000);
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature ?? 0.7,
        stream: true,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return this.parseStream(response.body!);
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
    const FETCH_TIMEOUT = Number(process.env.DEEPSEEK_TIMEOUT_MS || 20000);
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        messages: [
          ...(options?.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature ?? 0.7,
        stream: false,
      }),
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  private parseStream(body: ReadableStream<Uint8Array>): ReadableStream {
    const reader = body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();

          if (done) {
            controller.close();
            return;
          }

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                controller.close();
                return;
              }

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;

                if (content) {
                  controller.enqueue(content);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        } catch (error) {
          controller.error(error);
        }
      },

      cancel() {
        reader.releaseLock();
      }
    });
  }
}
