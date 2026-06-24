/**
 * Pure-CSS animated blobs that bring the page to life behind glass cards.
 * Pointer-events:none so they never interfere with UI.
 */
export default function BackgroundBlobs() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full bg-cyan-500/20 blur-3xl animate-blob" />
      <div
        className="absolute -bottom-40 -right-32 h-[40rem] w-[40rem] rounded-full bg-violet-500/25 blur-3xl animate-blob"
        style={{ animationDelay: "-6s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink-500/10 blur-3xl animate-blob"
        style={{ animationDelay: "-12s" }}
      />
    </div>
  );
}
