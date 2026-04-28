interface PageHeroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="premium-gradient py-16 sm:py-24">
      <div className="container-wide">
        <p className="mb-4 text-xs uppercase tracking-[0.22em] text-gold-300">{eyebrow}</p>
        <h1 className="max-w-4xl font-display text-4xl font-semibold leading-tight text-white sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 max-w-3xl text-base text-white/75 sm:text-lg">{description}</p>
      </div>
    </section>
  );
}
