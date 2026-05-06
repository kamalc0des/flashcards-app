import { Navbar } from "@/components/layout/Navbar";

export default function DecksLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}
