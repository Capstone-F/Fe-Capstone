import { Navbar } from "@/shared/components/layout/navbar";
import { Footer } from "@/shared/components/layout/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background relative min-h-screen overflow-x-hidden">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
