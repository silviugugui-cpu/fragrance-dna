/**
 * PageShell Component
 * Consistent page layout structure with premium atmosphere
 * Used by all pages in the platform
 */

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  showBackgroundLayers?: boolean;
}

export function PageShell({
  children,
  className = '',
  showBackgroundLayers = true,
}: PageShellProps) {
  return (
    <div className={`page-shell ${className}`}>
      {showBackgroundLayers && (
        <>
          <div className="app-background-layer" />
          <div className="app-overlay-layer" />
          <div className="app-ambient-layer" />
        </>
      )}
      <div className="content-layer">{children}</div>
    </div>
  );
}

export default PageShell;
