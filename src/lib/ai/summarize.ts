export async function generateFinchSummary(_: {
  title: string;
  transcript?: string | null;
}): Promise<{ summary: string; model: string }> {
  // Placeholder deterministic summary; swap with real model call via env
  const t = (_?.transcript || '').slice(0, 2000);
  const summary = t
    ? `Summary:\n- ${t.substring(0, 400)}${t.length > 400 ? '…' : ''}`
    : `Summary:\n- ${_.title}`;
  return { summary, model: 'finch-local-stub' };
}
