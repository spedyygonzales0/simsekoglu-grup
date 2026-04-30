"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useSiteData } from "@/components/providers/site-data-provider";
import { MaintenanceScreen } from "@/components/shared/maintenance-screen";
import { FloatingWhatsAppButton } from "@/components/shared/floating-whatsapp-button";

const QuoteRequestModal = dynamic(
  () => import("@/components/shared/quote-request-modal").then((mod) => mod.QuoteRequestModal),
  { ssr: false }
);

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isHydrated, content } = useSiteData();
  const isAdminRoute = pathname.startsWith("/admin");
  const isHomeRoute = pathname === "/";
  const maintenanceMode = content.settings?.maintenanceMode;

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

  if (maintenanceMode) {
    return <MaintenanceScreen companyName="Şimşekoğlu Grup" />;
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main key={pathname} className="page-transition">
        {children}
      </main>
      {!isHomeRoute ? <Footer /> : null}
      <FloatingWhatsAppButton />
      <QuoteRequestModal />
    </div>
  );
}
