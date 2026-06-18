import { HomeView } from "@/components/inicio/HomeView";
import { getFeed } from "@/lib/posts";

export default async function InicioPage() {
  const posts = await getFeed();
  const unreadPosts = posts.filter((p) => p.unread).length;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <HomeView unreadPosts={unreadPosts} />
    </main>
  );
}
