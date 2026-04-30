"use client";

import Image from "next/image";
import { useState } from "react";

interface MaintenanceScreenProps {
  companyName?: string;
}

export function MaintenanceScreen({ companyName = "Şimşekoğlu Grup" }: MaintenanceScreenProps) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden premium-gradient px-4 py-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_12%,rgba(216,177,106,0.24),transparent_35%),linear-gradient(180deg,rgba(4,15,31,0.2)_0%,rgba(4,15,31,0.58)_100%)]" />

      <section className="relative z-10 w-full max-w-3xl rounded-3xl border border-white/30 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-md sm:p-12">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-gold-300/70 bg-white/12">
          {logoFailed ? (
            <span className="text-2xl font-bold text-white" aria-hidden>
              ŞG
            </span>
          ) : (
            <Image
              src="/images/general/logo.png"
              alt={`${companyName} logo`}
              width={72}
              height={72}
              className="object-contain"
              onError={() => setLogoFailed(true)}
            />
          )}
        </div>

        <p className="text-base font-bold uppercase tracking-[0.12em] text-gold-200">Bakım Modu</p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight text-white sm:text-5xl">{companyName}</h1>

        <p className="mt-6 text-lg leading-8 text-white/95">
          Web sitemiz kısa süreli bakım çalışması nedeniyle geçici olarak hizmet dışıdır.
        </p>
        <p className="mt-3 text-lg leading-8 text-white/90">Lütfen daha sonra tekrar ziyaret ediniz.</p>
      </section>
    </main>
  );
}
