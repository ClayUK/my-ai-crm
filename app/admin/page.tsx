export const dynamic = "force-dynamic"
import { redirect } from "next/navigation";

/** Legacy product admin removed — Creative Brain lives at /memory */
export default function AdminPage() {
    redirect("/memory");
}
