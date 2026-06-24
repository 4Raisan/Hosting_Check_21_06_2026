/**
 * Animated logo glyph: gradient sparkle with a subtle pulse.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-block h-7 w-7">
        <span className="absolute inset-0 rounded-lg bg-[linear-gradient(135deg,#22d3ee,#8b5cf6,#ec4899)] shadow-glow animate-float-slow" />
        <span className="absolute inset-[3px] rounded-md bg-ink-950/80 backdrop-blur" />
        <svg
          viewBox="0 0 24 24"
          className="absolute inset-1 h-5 w-5 text-cyan-300"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 3l1.6 4.5L18 9l-4.4 1.5L12 15l-1.6-4.5L6 9l4.4-1.5L12 3z" />
          <circle cx="18" cy="17" r="1" />
          <circle cx="6" cy="17" r="1" />
        </svg>
      </span>
      <span className="font-display text-lg font-bold tracking-tight neon-text">Sparkle</span>
    </span>
  );
}
