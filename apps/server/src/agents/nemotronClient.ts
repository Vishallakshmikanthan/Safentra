/**
 * Shared client for calling NVIDIA's hosted Nemotron models through their
 * OpenAI-compatible NIM endpoint. Used by ORACLE, FORGE, and BLAZE instead of
 * (or in addition to) Anthropic, since NVIDIA issues free API keys at
 * https://build.nvidia.com with no credit card required.
 *
 * All three agents call `completeWithNemotron`, which returns `null` if
 * NEMOTRON_API_KEY is not configured or the request fails — callers are
 * expected to fall back to their existing deterministic template logic in
 * that case, so the platform degrades gracefully instead of breaking a demo.
 */

const NEMOTRON_BASE_URL = process.env.NEMOTRON_BASE_URL ?? 'https://integrate.api.nvidia.com/v1';
// nemotron-3-super is a strong general-purpose choice for citation-style answers (ORACLE) and
// structured extraction (FORGE, BLAZE). Swap via env var if you want a faster/cheaper model.
const NEMOTRON_MODEL = process.env.NEMOTRON_MODEL ?? 'nvidia/nemotron-3-super-120b-a12b';

export interface NemotronCompletionOptions {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
  /** If true, asks the model to enable extended reasoning before answering (slower, higher quality). */
  reasoning?: boolean;
}

export async function completeWithNemotron(options: NemotronCompletionOptions): Promise<string | null> {
  const apiKey = process.env.NEMOTRON_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(`${NEMOTRON_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: NEMOTRON_MODEL,
        messages: [
          { role: 'system', content: options.system },
          { role: 'user', content: options.user }
        ],
        max_tokens: options.maxTokens ?? 800,
        temperature: options.temperature ?? 0.3,
        top_p: 0.95,
        stream: false,
        ...(options.reasoning
          ? { extra_body: { chat_template_kwargs: { enable_thinking: true } } }
          : {})
      }),
      // NVIDIA's free tier can be slow under load; fail fast rather than hanging a request handler.
      signal: AbortSignal.timeout(20_000)
    });

    if (!response.ok) {
      console.error(`Nemotron API error: ${response.status} ${await response.text().catch(() => '')}`);
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    return data.choices?.[0]?.message?.content?.trim() ?? null;
  } catch (err) {
    console.error('Nemotron API call failed:', err instanceof Error ? err.message : err);
    return null;
  }
}

/** True when a Nemotron key is configured, so agents can report their live/fallback mode via API. */
export function isNemotronConfigured(): boolean {
  return Boolean(process.env.NEMOTRON_API_KEY);
}
