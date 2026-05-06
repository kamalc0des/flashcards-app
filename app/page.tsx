import { redirect } from "next/navigation";

// next-intl middleware handles locale routing, but root / needs a fallback
export default function RootPage() {
  redirect("/en");
}
