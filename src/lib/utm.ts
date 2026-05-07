// UTM utility — centralized tracking parameters for all AI platform links
// Used throughout the AiBI-Practitioner course for partnership attribution

const UTM_SOURCE = 'aibankinginstitute';
const UTM_MEDIUM = 'course';
const UTM_CAMPAIGN = 'aibi-p';

export const PLATFORM_URLS = {
  chatgpt:    `https://chatgpt.com/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`,
  claude:     `https://claude.ai/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`,
  copilot:    `https://copilot.microsoft.com/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`,
  gemini:     `https://gemini.google.com/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`,
  notebooklm: `https://notebooklm.google.com/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`,
  perplexity: `https://perplexity.ai/?utm_source=${UTM_SOURCE}&utm_medium=${UTM_MEDIUM}&utm_campaign=${UTM_CAMPAIGN}`,
} as const;

export type PlatformId = keyof typeof PLATFORM_URLS;

export function getPlatformUrl(platform: PlatformId, moduleNumber?: number): string {
  const base = PLATFORM_URLS[platform];
  if (moduleNumber) {
    return `${base}&utm_content=module-${moduleNumber}`;
  }
  return base;
}
