import { loadOwnedDossier } from "@/lib/espace/dossier-context";
import { MessageThread } from "@/components/espace/MessageThread";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ params }: { params: Promise<{ dossierId: string }> }) {
  const { dossierId } = await params;
  const { messages } = await loadOwnedDossier(dossierId);
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-2xl font-extrabold tracking-display">Messages</h1>
      <MessageThread
        dossierId={dossierId}
        messages={messages.map((m) => ({ id: m.id, sender: m.sender, body: m.body, created_at: m.created_at }))}
      />
    </div>
  );
}
