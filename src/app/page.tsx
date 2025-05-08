import { createClient } from "@/utils/supabase/server";
import getUserRole from "./actions/userRole";
import AdminDashboard from "./dashboard/adminDash";
import MarketingDashboard from "./dashboard/marketingDash";
import { notFound } from "next/navigation";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError) {
    console.error(
      "Dashboard Page: Error fetching auth user:-",
      authError.message
    );
    notFound();
  }
  if (!authUser) {
    notFound();
  }
  const role = await getUserRole(supabase);
  if (role === "admin") {
    return <AdminDashboard />;
  } else if (role === "marketing") {
    return <MarketingDashboard />;
  } else {
    notFound();
    return null;
  }
}
