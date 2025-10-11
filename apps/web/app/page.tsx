import { redirect } from "next/navigation";

export default function HomePage() {
  // Rediriger vers le dashboard par défaut
  redirect("/dashboard");
}