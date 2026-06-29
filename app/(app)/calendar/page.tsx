import { CalendarView } from "@/components/calendar/CalendarView";
import { getCalendar } from "@/lib/calendar";
import { getActiveChildGroup } from "@/lib/child-filter";

export default async function CalendarioPage() {
  const child = await getActiveChildGroup();
  const all = await getCalendar();
  // El filtro global "ver por hijo" deja el salón elegido + lo de toda la escuela.
  const events = child ? all.filter((e) => !e.groupId || e.groupId === child) : all;
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <CalendarView events={events} />
    </main>
  );
}
