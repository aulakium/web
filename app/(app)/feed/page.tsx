import { MuroView } from "@/components/feed/MuroView";
import { getFeed, FEED_PAGE_SIZE } from "@/lib/posts";
import { getIdentity } from "@/lib/identity";
import { getAudienceOptions } from "@/lib/audiences";
import { getActiveChildGroup } from "@/lib/child-filter";
import type { RoleKey } from "@/lib/domain";

/** Roles que pueden publicar avisos (coincide con la RLS de 0022). */
const PUBLISHERS: RoleKey[] = [
  "principal", "coordinator", "support_staff", "board", "manager", "department_head", "teacher",
];

/** Muro: feed real filtrado por audiencia/rol (+ filtro global por hijo). */
export default async function MuroPage() {
  const child = await getActiveChildGroup();
  const [posts, me] = await Promise.all([getFeed(FEED_PAGE_SIZE, 0, child), getIdentity()]);
  const canPublish = !!me?.roleKey && PUBLISHERS.includes(me.roleKey);
  const audiences = canPublish ? await getAudienceOptions(me?.roleKey ?? null) : undefined;
  return <MuroView posts={posts} canPublish={canPublish} audiences={audiences} />;
}
