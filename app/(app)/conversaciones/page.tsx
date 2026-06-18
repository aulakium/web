import { ConversationsView } from "@/components/conversaciones/ConversationsView";
import { getConversations } from "@/lib/conversations";

export default async function ConversacionesPage() {
  const conversations = await getConversations();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <ConversationsView conversations={conversations} />
    </main>
  );
}
