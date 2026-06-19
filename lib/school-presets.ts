/**
 * Plantillas de estructura académica por país. Son un PUNTO DE PARTIDA:
 * el colegio aplica una y después agrega/quita/renombra niveles y grados, y
 * define sus salones (que varían por grado, por eso no se generan acá).
 */
export interface SchoolPreset {
  id: string;
  country: string; // ISO-2
  label: string;
  description: string;
  levels: { name: string; grades: string[] }[];
}

const PRIMARIA_6 = ["1°", "2°", "3°", "4°", "5°", "6°"];

export const SCHOOL_PRESETS: SchoolPreset[] = [
  {
    id: "mx",
    country: "MX",
    label: "México",
    description: "Kínder · Primaria · Secundaria · Preparatoria",
    levels: [
      { name: "Kínder", grades: ["1°", "2°", "3°"] },
      { name: "Primaria", grades: PRIMARIA_6 },
      { name: "Secundaria", grades: ["1°", "2°", "3°"] },
      { name: "Preparatoria", grades: ["1°", "2°", "3°"] },
    ],
  },
  {
    id: "ar",
    country: "AR",
    label: "Argentina",
    description: "Nivel Inicial · Primaria · Secundaria (5 años)",
    levels: [
      { name: "Nivel Inicial", grades: ["Sala de 3", "Sala de 4", "Sala de 5"] },
      { name: "Primaria", grades: PRIMARIA_6 },
      { name: "Secundaria", grades: ["1°", "2°", "3°", "4°", "5°"] },
    ],
  },
  {
    id: "mx_prefirst",
    country: "MX",
    label: "México con Pre-First",
    description: "Kínder · Pre-First · Primaria · Secundaria · Preparatoria",
    levels: [
      { name: "Kínder", grades: ["1°", "2°", "3°"] },
      { name: "Pre-First", grades: ["Pre-First"] },
      { name: "Primaria", grades: PRIMARIA_6 },
      { name: "Secundaria", grades: ["1°", "2°", "3°"] },
      { name: "Preparatoria", grades: ["1°", "2°", "3°"] },
    ],
  },
];

export function getPreset(id: string): SchoolPreset | undefined {
  return SCHOOL_PRESETS.find((p) => p.id === id);
}
