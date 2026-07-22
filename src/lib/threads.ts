import { db } from "./db";
import { slugify } from "./slug";

function tokenSet(s: string): Set<string> {
  return new Set(slugify(s).split("-").filter(Boolean));
}

function similarity(a: string, b: string): number {
  const setA = tokenSet(a);
  const setB = tokenSet(b);
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const t of setA) if (setB.has(t)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return intersection / union;
}

// A new development attaches to an existing thread when its proposed
// threadTitle overlaps enough with an existing one; otherwise it starts a
// new thread. This is a token-overlap heuristic, not semantic matching —
// good enough at single-user scale (dozens to low hundreds of threads).
const SIMILARITY_THRESHOLD = 0.5;

export async function findOrCreateThread(
  threadTitle: string
): Promise<{ id: string; isNew: boolean }> {
  const threads = await db.thread.findMany({ select: { id: true, title: true } });

  let best: { id: string; score: number } | null = null;
  for (const t of threads) {
    const score = similarity(threadTitle, t.title);
    if (score >= SIMILARITY_THRESHOLD && (!best || score > best.score)) {
      best = { id: t.id, score };
    }
  }
  if (best) return { id: best.id, isNew: false };

  const created = await db.thread.create({ data: { title: threadTitle } });
  return { id: created.id, isNew: true };
}
