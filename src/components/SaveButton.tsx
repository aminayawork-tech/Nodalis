"use client";

import { useState, useTransition } from "react";
import { saveStory, unsaveStory, saveThread, unsaveThread } from "@/lib/actions";

export function SaveButton({
  id,
  type,
  initiallySaved,
}: {
  id: string;
  type: "story" | "thread";
  initiallySaved: boolean;
}) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      if (type === "story") {
        await (next ? saveStory(id) : unsaveStory(id));
      } else {
        await (next ? saveThread(id) : unsaveThread(id));
      }
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
        saved
          ? "border-accent bg-accent-soft text-accent"
          : "border-border text-ink-muted hover:border-accent hover:text-accent"
      }`}
    >
      {saved ? "Saved" : "Save"}
    </button>
  );
}
