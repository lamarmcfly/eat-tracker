// app/api/priority/route.ts
import { NextResponse } from "next/server";

const store: { errors: any[] } = (global as any).__EAT_STORE__ ?? { errors: [] };
(global as any).__EAT_STORE__ = store;

export async function GET() {
  // naive aggregation by (system, key_concept)
  const now = Date.now();
  const buckets = new Map<string, { system: string; concept: string; freq: number; last: number }>();

  for (const e of store.errors) {
    const key = `${e.system}::${e.key_concept}`;
    const prev = buckets.get(key);
    const t = new Date(e.created_at).getTime();
    if (prev) {
      prev.freq += 1;
      prev.last = Math.max(prev.last, t);
    } else {
      buckets.set(key, { system: e.system, concept: e.key_concept, freq: 1, last: t });
    }
  }

  const ranked = [...buckets.values()]
    .map(b => {
      // toy score: freq weight + mild recency boost
      const days = (now - b.last) / (1000 * 60 * 60 * 24);
      const recency = Math.max(0, 21 - days) / 21; // 0..1
      const score = b.freq * 10 + recency * 5;
      const reasons = [
        { label: "Frequency", value: b.freq },
        { label: "Recency", value: Number(recency.toFixed(2)) },
      ];
      return { system: b.system, concept: b.concept, score: Math.round(score), reasons, last_error_at: new Date(b.last).toISOString() };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return NextResponse.json({ top: ranked });
}

