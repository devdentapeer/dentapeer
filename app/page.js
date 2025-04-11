import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role === "diş_kliniği") {
    return redirect("/clinic");
  } else if (session.user.role === "laboratuvar") {
    return redirect("/laboratory");
  }

  // Fallback in case no role matches
  return redirect("/login");
}
