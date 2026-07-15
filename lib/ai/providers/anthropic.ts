import { AIProvider, AIOptions } from '../types';

export class AnthropicProvider implements AIProvider {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl || process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1';
    this.defaultModel = process.env.ANTHROPIC_MODEL || 'claude-3-sonnet-20240229';
  }

  async streamCompletion(prompt: string, options?: AIOptions): Promise<ReadableStream> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature ?? 0.7,
        system: options?.systemPrompt || 'You are a helpful assistant.',
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return this.parseStream(response.body!);
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options?.model || this.defaultModel,
        max_tokens: options?.maxTokens || 2048,
        temperature: options?.temperature ?? 0.7,
        system: options?.systemPrompt || 'You are a helpful assistant.',
        messages: [
          { role: 'user', content: prompt }
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
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
                // Anthropic streaming format
                const content = parsed.delta?.text || parsed.content_block?.text;

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
