// app/api/plan/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const deficits: Array<{ system: string; concept: string; score?: number }> = body.deficits ?? [];
  const days = Number(body.days ?? 7);

  const today = new Date();
  const out = [];
  for (let d = 0; d < days; d++) {
    const date = new Date(today);
    date.setDate(today.getDate() + d);
    out.push({ date: date.toISOString().slice(0, 10), sessions: [] as any[] });
  }

  for (const def of deficits.slice(0, 3)) {
    // schedule: day 0, day 1–2, day 6–7
    const slots = [0, 1, 6].filter(i => i < days);
    for (const i of slots) {
      out[i].sessions.push({
        system: def.system,
        concept: def.concept,
        action: i === 0 ? "10-Q retrieval block"
              : i === 1 ? "5-min teach-back + 5 Qs"
              : "Mini-block (8–10 Qs) + quick recall",
        duration_min: i === 0 ? 20 : 10,
      });
    }
  }

  return NextResponse.json({ days: out });
}

