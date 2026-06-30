import { requireAdmin } from "@/lib/identity";
import { CsvImporter } from "@/components/settings/CsvImporter";

export default async function ImportarPage() {
  await requireAdmin();
  return <CsvImporter />;
}
