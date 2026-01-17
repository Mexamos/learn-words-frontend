import { useResponsive } from '../constants/breakpoints'

/**
 * Development tool to show current breakpoint
 * Only visible in development mode
 */
export default function BreakpointIndicator() {
  const { currentBreakpoint, width, isMobile, isTablet, isDesktop } = useResponsive()

  // Only show in development
  if (import.meta.env.PROD) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace',
        zIndex: 9999,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
        pointerEvents: 'none'
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        Breakpoint: {currentBreakpoint}
      </div>
      <div style={{ fontSize: '10px', color: '#aaa' }}>
        {width}px | {isMobile ? 'Mobile' : isTablet ? 'Tablet' : isDesktop ? 'Desktop' : 'Unknown'}
      </div>
    </div>
  )
}
