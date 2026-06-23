/**
 * PageShell Component
 * Consistent page layout structure with premium atmosphere
 * Used by all pages in the platform
 */

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
  showBackgroundLayers?: boolean;
  useDiscoverFrame?: boolean;
}

export function PageShell({
  children,
  className = '',
  showBackgroundLayers = true,
  useDiscoverFrame = true,
}: PageShellProps) {
  return (
    <div className={`page-shell ${className}`}>
      {/* Global background layers are mounted once in RootLayout to avoid duplicates. */}
      <div className="content-layer">
        <div className={useDiscoverFrame ? 'discover-page-frame' : ''}>{children}</div>
      </div>
    </div>
  );
}

export default PageShell;
