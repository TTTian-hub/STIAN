import { AIProvider, AIOptions, StreamChunk } from '../types';

export class KimiProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    // Use environment variable or fallback to default
    const rawBaseUrl = baseUrl || process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1';
    // Remove trailing slash to avoid double slash in URL
    this.baseUrl = rawBaseUrl.replace(/\/$/, '');
    this.defaultModel = process.env.KIMI_MODEL || process.env.ANTHROPIC_MODEL || 'kimi-k2-5';
    console.log('[KimiProvider] Initialized with baseUrl:', this.baseUrl, 'model:', this.defaultModel);
  }

  async streamCompletion(prompt: string, options?: AIOptions): Promise<ReadableStream> {
    const url = `${this.baseUrl}/chat/completions`;
    console.log('[KimiProvider] Request URL:', url);
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
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
    }

    return this.parseStream(response.body!);
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
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
    });

    if (!response.ok) {
      throw new Error(`Kimi API error: ${response.status} ${response.statusText}`);
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
