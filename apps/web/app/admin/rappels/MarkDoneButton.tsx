"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markCallbackDone } from "@/app/admin/actions";

export function MarkDoneButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const res = await markCallbackDone(id);
          setPending(false);
          if ("error" in res) setError(res.error);
          else router.refresh();
        }}
        className="rounded-field border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-paper-2 disabled:opacity-40"
      >
        {pending ? "…" : "Marquer rappelé"}
      </button>
      {error ? <p className="mt-1 text-xs text-stamp">{error}</p> : null}
    </div>
  );
}
