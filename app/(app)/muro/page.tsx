import { MuroView } from "@/components/muro/MuroView";
import { getFeed } from "@/lib/posts";
import { getIdentity } from "@/lib/identity";
import { getAudienceOptions } from "@/lib/audiences";
import type { RoleKey } from "@/lib/domain";

/** Roles de gestión que pueden publicar avisos (coincide con la RLS de 0012). */
const PUBLISHERS: RoleKey[] = [
  "principal", "coordinator", "support_staff", "board", "manager", "department_head",
];

/** Muro: feed real filtrado por audiencia/rol del usuario logueado. */
export default async function MuroPage() {
  const [posts, me] = await Promise.all([getFeed(), getIdentity()]);
  const canPublish = !!me?.roleKey && PUBLISHERS.includes(me.roleKey);
  const audiences = canPublish ? await getAudienceOptions() : undefined;
  return <MuroView posts={posts} canPublish={canPublish} audiences={audiences} />;
}
