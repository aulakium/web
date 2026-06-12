import { LocaleProvider } from "@/components/locale-context";
import { Sidebar } from "@/components/Sidebar";
import { BottomNav } from "@/components/BottomNav";

/**
 * Shell de la app (usuario logueado): sidebar navy a la izquierda con el perfil
 * abajo, contenido al centro, y bottom-nav en móvil. Responsive desde 375px.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LocaleProvider initial="es-AR">
      {/* Lienzo claro: sidebar y contenido flotan como paneles dentro del mismo espacio */}
      <div className="flex min-h-dvh lg:gap-4 lg:p-4">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          {children}
          <BottomNav />
        </div>
      </div>
    </LocaleProvider>
  );
}
