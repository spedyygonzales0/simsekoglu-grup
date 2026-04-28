import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: "Admin Panel | Şimşekoğlu Grup",
    description: "Şimşekoğlu Grup içerik ve yönetim paneli.",
    path: "/admin"
  }),
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

