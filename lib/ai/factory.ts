import { AIProvider, AIConfig } from './types';
import { KimiProvider } from './providers/kimi';
import { GLMProvider } from './providers/glm';
import { AnthropicProvider } from './providers/anthropic';
import { DeepSeekProvider } from './providers/deepseek';
import { CodeBuddyProvider } from './providers/codebuddy';
import { FallbackProvider } from './providers/fallback';

export function createAIProvider(config?: AIConfig): AIProvider {
  // Use environment variables if config not provided
  const provider = config?.provider || process.env.AI_PROVIDER || 'anthropic';

  let apiKey: string;
  let baseUrl: string | undefined;

  // Get configuration based on provider
  switch (provider.toLowerCase()) {
    case 'anthropic':
      apiKey = config?.apiKey || process.env.ANTHROPIC_AUTH_TOKEN || process.env.AI_API_KEY || '';
      baseUrl = config?.baseUrl || process.env.ANTHROPIC_BASE_URL || process.env.AI_BASE_URL;
      break;
    case 'kimi':
      apiKey = config?.apiKey || process.env.KIMI_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN || process.env.AI_API_KEY || '';
      baseUrl = config?.baseUrl || process.env.KIMI_BASE_URL || process.env.ANTHROPIC_BASE_URL || process.env.AI_BASE_URL;
      break;
    case 'glm':
      apiKey = config?.apiKey || process.env.GLM_API_KEY || process.env.AI_API_KEY || '';
      baseUrl = config?.baseUrl || process.env.GLM_BASE_URL || process.env.AI_BASE_URL;
      break;
    case 'deepseek':
      apiKey = config?.apiKey || process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY || '';
      baseUrl = config?.baseUrl || process.env.DEEPSEEK_BASE_URL || process.env.AI_BASE_URL;
      break;
    case 'codebuddy':
      apiKey = config?.apiKey || process.env.CODEBUDDY_API_KEY || process.env.AI_API_KEY || '';
      baseUrl = config?.baseUrl || process.env.CODEBUDDY_BASE_URL || process.env.AI_BASE_URL;
      break;
    default:
      apiKey = config?.apiKey || process.env.AI_API_KEY || '';
      baseUrl = config?.baseUrl || process.env.AI_BASE_URL;
  }

  if (!apiKey) {
    throw new Error(`AI API key is required for ${provider}. Set ${provider.toUpperCase()}_API_KEY or AI_API_KEY environment variable.`);
  }

  let providerInstance: AIProvider;
  switch (provider.toLowerCase()) {
    case 'anthropic':
      providerInstance = new AnthropicProvider(apiKey, baseUrl);
      break;
    case 'kimi':
      providerInstance = new KimiProvider(apiKey, baseUrl);
      break;
    case 'glm':
      providerInstance = new GLMProvider(apiKey, baseUrl);
      break;
    case 'deepseek':
      providerInstance = new DeepSeekProvider(apiKey, baseUrl);
      break;
    case 'codebuddy':
      providerInstance = new CodeBuddyProvider(apiKey, baseUrl);
      break;
    default:
      throw new Error(`Unknown AI provider: ${provider}. Supported: anthropic, kimi, glm, deepseek, codebuddy`);
  }

  // CodeBuddy 作为主 provider 时，若配置了「可用的」DeepSeek key，自动兜底：
  // 沙箱等连不上腾讯内网网关的环境会无缝切到 DeepSeek 公网直连（OpenAI 兼容）。
  if (provider.toLowerCase() === 'codebuddy') {
    const PLACEHOLDER = 'PLACEHOLDER_REPLACE_ME';
    const dsKey = process.env.DEEPSEEK_API_KEY || process.env.AI_API_KEY;
    const dsUrl = process.env.DEEPSEEK_BASE_URL;
    if (dsKey && dsKey !== PLACEHOLDER) {
      const ds = new DeepSeekProvider(dsKey, dsUrl);
      providerInstance = new FallbackProvider(providerInstance, ds, 'codebuddy→deepseek');
      console.log('[factory] CodeBuddy + DeepSeek 兜底已启用（沙箱/内网不可达时自动切换）');
    } else {
      console.log('[factory] 未配置可用 DEEPSEEK_API_KEY，CodeBuddy 失败后将直接报错（沙箱需配置 key 才会兜底）');
    }
  }

  return providerInstance;
}

// Singleton instance for server-side usage
let globalProvider: AIProvider | null = null;

export function getGlobalAIProvider(): AIProvider {
  if (!globalProvider) {
    globalProvider = createAIProvider();
  }
  return globalProvider;
}

export function resetGlobalAIProvider(): void {
  globalProvider = null;
}
