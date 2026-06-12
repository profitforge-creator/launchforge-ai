import { redirect } from "next/navigation";

// Account page has been replaced by the full Settings experience.
export default function AccountPage() {
  redirect("/dashboard/settings");
}
