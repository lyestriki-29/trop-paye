"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postMessage } from "@/app/espace/[dossierId]/actions";
import { frenchDate } from "@/lib/format-date";

export interface MessageThreadProps {
  dossierId: string;
  messages: { id: string; sender: string; body: string; created_at: string }[];
}

const SENDER_LABEL: Record<string, string> = {
  client: "Vous",
  operator: "TropPayé",
  system: "Système",
};

export function MessageThread({ dossierId, messages }: MessageThreadProps) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    setPending(true);
    setError(null);
    const res = await postMessage(dossierId, body);
    setPending(false);
    if ("error" in res) {
      setError(res.error);
      return;
    }
    setBody("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="rounded-field bg-paper-2 px-4 py-2 text-xs text-ink/55">
        Échanges suivis par nos opérateurs. Information générale : ceci n'est pas un conseil
        juridique.
      </p>

      <ul className="space-y-3">
        {messages.length === 0 ? (
          <li className="text-sm text-ink/45">Aucun message pour le moment.</li>
        ) : (
          messages.map((m) => {
            const isClient = m.sender === "client";
            return (
              <li
                key={m.id}
                className={`max-w-[85%] rounded-card border px-4 py-2 text-sm${
                  isClient
                    ? " ml-auto border-transparent bg-ink/5"
                    : " border-line bg-paper-2"
                }`}
              >
                <p className="text-xs text-ink/50">
                  {SENDER_LABEL[m.sender] ?? m.sender}
                  {" · "}
                  {frenchDate(m.created_at)}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap">{m.body}</p>
              </li>
            );
          })
        )}
      </ul>

      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          placeholder="Une question sur votre dossier ?"
          className="flex-1 rounded-field border border-line bg-paper px-4 py-2 outline-none focus:border-ink focus:ring-2 focus:ring-ink/15"
        />
        <button
          type="button"
          onClick={send}
          disabled={pending || body.trim().length === 0}
          className="shrink-0 self-end rounded-field bg-ink px-5 py-2.5 text-sm font-medium text-paper disabled:opacity-40"
        >
          {pending ? "…" : "Envoyer"}
        </button>
      </div>

      {error !== null ? <p className="text-sm text-stamp">{error}</p> : null}
    </div>
  );
}
