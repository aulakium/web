import { CalendarView } from "@/components/calendar/CalendarView";
import { getCalendar, getMyCourses } from "@/lib/calendar";

export default async function CalendarioPage() {
  const [events, courses] = await Promise.all([getCalendar(), getMyCourses()]);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <CalendarView events={events} courses={courses} />
    </main>
  );
}
