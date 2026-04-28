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
          <p className="text-sm font-semibold uppercase tracking-[0.1em] text-gold-500">
            {eyebrow}
          </p>
        )}
        <h2 className="section-title">{title}</h2>
        {description && <p className="body-text muted-text">{description}</p>}
      </div>
      {rightSlot ? <div>{rightSlot}</div> : null}
    </div>
  );
}
