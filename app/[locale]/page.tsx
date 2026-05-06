import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getLocale } from "next-intl/server";

export default async function LocaleRootPage() {
  const session = await auth();
  const locale = await getLocale();
  if (session) redirect(`/${locale}/dashboard`);
  redirect(`/${locale}/auth/signin`);
}
