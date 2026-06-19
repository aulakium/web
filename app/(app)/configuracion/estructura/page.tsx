import { getStructure } from "@/lib/structure";
import { SCHOOL_PRESETS } from "@/lib/school-presets";
import { StructureManager } from "@/components/configuracion/StructureManager";

export default async function EstructuraPage() {
  const structure = await getStructure();
  return <StructureManager structure={structure} presets={SCHOOL_PRESETS} />;
}
