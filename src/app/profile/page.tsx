import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfileRootPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !currentUser.profileCode) {
    redirect("/auth/login?redirect=/profile");
  }

  redirect(`/profile/${currentUser.profileCode}`);
}
