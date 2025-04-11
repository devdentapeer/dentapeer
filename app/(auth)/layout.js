import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }) {
    const session = await auth();
    if(session) {
        if (session.user.role === "diş_kliniği") {
            return redirect("/clinic");
        } else if (session.user.role === "laboratuvar") {
            return redirect("/laboratory");
        }        
    }
    return (
        <div className="container mx-auto px-4 py-4">
            {children}
        </div>
    );
}
