// app/page.js
import { redirect } from "next/navigation";

export default function Home() {
  // Root URL (/) redirects to /dashboard
  // Middleware will then redirect to /login if not authenticated
  redirect("/dashboard");
}
