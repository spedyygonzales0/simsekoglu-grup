interface PlaceholderMediaProps {
  label: string;
  type?: "image" | "video";
  tone?: "construction" | "architecture" | "general";
  className?: string;
}

export function PlaceholderMedia({
  label,
  type = "image",
  tone = "general",
  className = ""
}: PlaceholderMediaProps) {
  const toneClass =
    tone === "construction"
      ? "from-navy-900 to-navy-700"
      : tone === "architecture"
        ? "from-[#10243f] to-[#1d385e]"
        : "from-navy-900 to-navy-700";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-navy-900/10 bg-gradient-to-br ${toneClass} p-8 text-white ${className}`}
    >
      {/* Replace this placeholder area with approved media assets for the related category */}
      <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_30%),radial-gradient(circle_at_80%_20%,rgba(216,177,106,0.45),transparent_25%)]" />
      <div className="relative z-10 space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-gold-300">
          {type === "video" ? "Video Placeholder" : "Image Placeholder"}
        </p>
        <p className="font-display text-2xl">{label}</p>
      </div>
    </div>
  );
}
