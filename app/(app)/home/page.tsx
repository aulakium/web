import { HomeView } from "@/components/home/HomeView";
import { getFeed } from "@/lib/posts";
import { getCalendar } from "@/lib/calendar";
import { getConversations } from "@/lib/conversations";
import { getRequests } from "@/lib/requests";
import { getActiveChildGroup } from "@/lib/child-filter";

export default async function InicioPage() {
  const child = await getActiveChildGroup();
  const [postsAll, eventsAll, conversations, requests] = await Promise.all([
    getFeed(50, 0, child),
    getCalendar(),
    getConversations(),
    getRequests(),
  ]);
  // El calendario se filtra acá (el feed ya viene filtrado por la RPC).
  const posts = postsAll;
  const events = child ? eventsAll.filter((e) => !e.groupId || e.groupId === child) : eventsAll;
  const unreadPosts = posts.filter((p) => p.unread).length;
  const unreadMessages = conversations.reduce((s, c) => s + c.unread, 0);
  const pendingRequests = requests.filter((r) => r.status === "submitted").length;
  // Tareas pendientes = novedades tipo tarea que todavía no marqué como hechas.
  const pendingTasks = posts.filter((p) => p.kind === "task" && !p.taskDone).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeView
        unreadPosts={unreadPosts}
        events={events}
        unreadMessages={unreadMessages}
        pendingRequests={pendingRequests}
        pendingTasks={pendingTasks}
      />
    </main>
  );
}
