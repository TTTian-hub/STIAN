export interface AIProvider {
  /**
   * Stream completion from the AI model
   * @param prompt - The prompt to send to the AI
   * @param options - Optional configuration
   * @returns A readable stream of the AI response
   */
  streamCompletion(prompt: string, options?: AIOptions): Promise<ReadableStream>;

  /**
   * Get a single completion (non-streaming)
   * @param prompt - The prompt to send to the AI
   * @param options - Optional configuration
   * @returns The complete response string
   */
  complete(prompt: string, options?: AIOptions): Promise<string>;
}

export interface AIOptions {
  /** Maximum tokens to generate */
  maxTokens?: number;

  /** Temperature for sampling (0-2) */
  temperature?: number;

  /** System prompt to set context */
  systemPrompt?: string;

  /** Model to use (provider-specific) */
  model?: string;
}

export interface AIConfig {
  provider: 'kimi' | 'glm' | 'codebuddy' | string;
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
}
