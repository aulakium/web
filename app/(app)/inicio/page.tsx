import { HomeView } from "@/components/inicio/HomeView";
import { getFeed } from "@/lib/posts";
import { getCalendar } from "@/lib/calendar";

export default async function InicioPage() {
  const [posts, events] = await Promise.all([getFeed(), getCalendar()]);
  const unreadPosts = posts.filter((p) => p.unread).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeView unreadPosts={unreadPosts} events={events} />
    </main>
  );
}
