"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { useSiteData } from "@/components/providers/site-data-provider";
import { t } from "@/lib/i18n";

export function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { locale } = useSiteData();

  const menu = useMemo(
    () => [
      { href: "/", label: t(locale, "home") },
      { href: "/about", label: t(locale, "about") },
      { href: "/construction", label: t(locale, "construction") },
      { href: "/architecture", label: t(locale, "architecture") },
      { href: "/fleet-rental", label: t(locale, "fleet") },
      { href: "/projects", label: t(locale, "projects") },
      { href: "/contact", label: t(locale, "contact") }
    ],
    [locale]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 premium-gradient">
      <div className="container-wide">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-gold-500/50 bg-white/10">
              {/* Replace with official company logo when ready */}
              <Image
                src="/images/general/logo.png"
                alt="Şimşekoğlu Grup Logo"
                fill
                sizes="44px"
                className="object-contain p-1"
              />
            </div>
            <div>
              <p className="font-display text-lg font-semibold text-white">Şimşekoğlu Grup</p>
              <p className="text-xs uppercase tracking-[0.16em] text-white/60">Corporate Group</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {menu.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition ${
                    isActive ? "text-gold-400" : "text-white/85 hover:text-gold-300"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <LanguageSwitcher />
          </nav>

          <button
            type="button"
            className="rounded-md border border-white/30 px-3 py-2 text-sm text-white lg:hidden"
            onClick={() => setIsOpen((prev) => !prev)}
          >
            Menu
          </button>
        </div>

        {isOpen && (
          <div className="space-y-3 border-t border-white/10 pb-4 pt-4 lg:hidden">
            {menu.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-md px-3 py-2 text-white/85 transition hover:bg-white/10"
              >
                {item.label}
              </Link>
            ))}
            <div className="px-2 pt-2">
              <LanguageSwitcher />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
