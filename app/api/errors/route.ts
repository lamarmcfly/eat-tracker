// app/api/errors/route.ts
import { NextResponse } from "next/server";

type ErrorEntry = {
  id: string;
  created_at: string;
  exam_source?: string | null;
  question_id?: string | null;
  system: string;
  error_type: "knowledge" | "reasoning" | "process" | "time";
  cognitive_bias?: string | null;
  key_concept: string;
  confidence: number;
  time_pressure: boolean;
  notes?: string;
  corrective_action: string;
};

const store: { errors: ErrorEntry[] } = (global as any).__EAT_STORE__ ?? { errors: [] };
(global as any).__EAT_STORE__ = store;

export async function GET() {
  return NextResponse.json({ errors: store.errors });
}

export async function POST(req: Request) {
  const body = await req.json();
  // Minimal validation; tighten later
  const entry: ErrorEntry = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    exam_source: body.exam_source ?? "other",
    question_id: body.question_id ?? null,
    system: body.system,
    error_type: body.error_type, // "knowledge" | "reasoning" | "process" | "time"
    cognitive_bias: body.cognitive_bias ?? null,
    key_concept: body.key_concept,
    confidence: Number(body.confidence ?? 0),
    time_pressure: Boolean(body.time_pressure),
    notes: body.notes ?? "",
    corrective_action: body.corrective_action || "Redo 10 targeted questions",
  };

  if (!entry.system || !entry.error_type || !entry.key_concept || !entry.corrective_action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  store.errors.unshift(entry);
  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}

