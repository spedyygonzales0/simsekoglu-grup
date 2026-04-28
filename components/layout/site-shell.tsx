"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useSiteData } from "@/components/providers/site-data-provider";
import { FloatingWhatsAppButton } from "@/components/shared/floating-whatsapp-button";

const QuoteRequestModal = dynamic(
  () => import("@/components/shared/quote-request-modal").then((mod) => mod.QuoteRequestModal),
  { ssr: false }
);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isHydrated } = useSiteData();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud-50">
        <p className="text-sm text-navy-900/60">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main key={pathname} className="page-transition">
        {children}
      </main>
      <Footer />
      <FloatingWhatsAppButton />
      <QuoteRequestModal />
    </div>
  );
}
