import { ReactNode } from "react";

interface SectionTitleProps {
  eyebrow?: string;
  title: string;
  description?: string;
  rightSlot?: ReactNode;
}

export function SectionTitle({ eyebrow, title, description, rightSlot }: SectionTitleProps) {
  return (
    <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="max-w-2xl space-y-3">
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.2em] text-gold-500">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-3xl font-semibold text-navy-900 sm:text-4xl">{title}</h2>
        {description && <p className="text-navy-900/70">{description}</p>}
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
