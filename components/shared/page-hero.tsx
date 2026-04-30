interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="premium-gradient relative overflow-hidden py-14 sm:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(216,177,106,0.26),transparent_34%),linear-gradient(180deg,rgba(4,15,31,0.24)_0%,rgba(4,15,31,0.56)_100%)]" />
      <div className="container-wide relative z-10">
        <p className="mb-4 text-[0.98rem] font-bold tracking-[0.12em] text-gold-200 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
          {eyebrow}
        </p>
        <h1 className="page-title max-w-4xl text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.45)]">
          {title}
        </h1>
        <p className="body-text mt-5 max-w-3xl text-white/95 drop-shadow-[0_8px_20px_rgba(0,0,0,0.44)]">
          {description}
        </p>
      </div>
    </section>
  );
}
