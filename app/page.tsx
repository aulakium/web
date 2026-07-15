// La landing pública = la home nueva (estilo Sociohub/Autoguru) que vive en /lab/home.
// Se reutiliza el mismo componente para no duplicar. /lab/home queda como referencia.
export { default } from "./lab/home/page";

export const metadata = {
  title: "Aulakium — La comunidad escolar, conectada",
  description:
    "Novedades, calendario, mensajes y solicitudes entre el colegio, las familias y los docentes.",
};
