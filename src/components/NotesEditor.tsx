"use client";

import { useState, useTransition } from "react";
import { updateNotes } from "@/lib/actions";

export function NotesEditor({
  savedItemId,
  initialNotes,
}: {
  savedItemId: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [isPending, startTransition] = useTransition();
  const [justSaved, setJustSaved] = useState(false);

  function handleBlur() {
    if (notes === initialNotes) return;
    startTransition(async () => {
      await updateNotes(savedItemId, notes);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 1500);
    });
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          Your notes
        </label>
        {(isPending || justSaved) && (
          <span className="text-xs text-accent">
            {isPending ? "Saving…" : "Saved"}
          </span>
        )}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={handleBlur}
        placeholder="Your own take — this becomes your personal knowledge base over time."
        rows={4}
        className="w-full resize-none rounded-lg border border-border bg-card p-3 text-sm text-ink placeholder:text-ink-muted/60 focus:border-accent focus:outline-none"
      />
    </div>
  );
}
