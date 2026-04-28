interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="premium-gradient py-16 sm:py-24">
      <div className="container-wide">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.11em] text-gold-300">{eyebrow}</p>
        <h1 className="page-title max-w-4xl text-white">
          {title}
        </h1>
        <p className="body-text mt-5 max-w-3xl text-white/80">{description}</p>
      </div>
    </section>
  );
}
