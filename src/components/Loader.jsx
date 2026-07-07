/**
 * Meesho-style loading animation.
 *
 * variant="overlay" -> full-screen overlay loader (use for whole-page loads)
 * variant="inline"  -> loader that sits inside a section/card (default)
 */
export default function Loader({ text = "Loading", variant = "inline" }) {
  const wrapperClass =
    variant === "overlay" || variant === "dashboard"
      ? "meesho-loader-overlay"
      : "meesho-loader-inline";

  return (
    <div className={wrapperClass} role="status" aria-live="polite">
      <div className="w-loader-wrapper">
        <div className="w-loader-logo">W</div>
        <div className="w-loader-dots" aria-hidden="true">
          <span className="w-loader-dot" />
          <span className="w-loader-dot" />
          <span className="w-loader-dot" />
        </div>
        <p className="w-loader-brand">{text || 'well-store'}</p>
      </div>
      <span className="visually-hidden">Loading</span>
    </div>
  );
}
