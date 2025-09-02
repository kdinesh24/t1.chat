'use client';
import React from 'react';
import { useSidebar } from '@/components/ui/sidebar';

interface CornerDecorationProps {
  // Color customization props
  gradientColor?: string;
  borderColor?: string;
  // Size customization
  height?: number;
  width?: number;
  // Positioning
  className?: string;
  // Responsive behavior
  hideOnMobile?: boolean;
}

const CornerDecoration: React.FC<CornerDecorationProps> = ({
  borderColor = '#322028', // Back to original color for the border outline
  height = 64,
  width = 112,
  className = '',
  hideOnMobile = true,
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Generate CSS variables for the component
  return (
    <div
      className={`corner-decoration ${className}`}
      style={{
        // Main corner decoration styles
        position: 'fixed',
        right: '-13px',
        top: '-2px',
        zIndex: 20,
        height: `${height}px`,
        width: `${width}px`,
        clipPath: 'inset(0px 12px 0px 0px)',
        // Hide when sidebar is collapsed
        display: isCollapsed ? 'none' : 'block',
      }}
    >
      {/* Media query styles for responsive behavior */}
      <style>{`
        @media (max-width: 640px) {
          .corner-decoration {
            display: ${hideOnMobile ? 'none' : 'block'} !important;
          }
        }
      `}</style>

      <div
        className="decoration-group"
        style={{
          position: 'absolute',
          top: '13px',
          zIndex: 10,
          marginBottom: '-32px',
          height: '128px',
          width: '100%',
          transformOrigin: 'top',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: 'none',
        }}
        onMouseEnter={(e) => {
          // Hover effect - slightly scale up the decoration
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          // Reset hover effect to original scale
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <svg
          className="decoration-svg"
          style={{
            position: 'absolute',
            right: '-32px',
            height: '36px',
            transformOrigin: 'top left',
            transform: 'skewX(30deg)',
            overflow: 'visible',
          }}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 128 32"
          xmlSpace="preserve"
        >
          {/* Curved path with different stroke and fill colors */}
          <path
            stroke={borderColor} // Uses '#322028' for the border outline
            fill="#1a1419" // Dark fill color for the interior
            shapeRendering="optimizeQuality"
            strokeWidth="1px"
            strokeLinecap="round"
            strokeMiterlimit="10"
            vectorEffect="non-scaling-stroke"
            d="M0,0c5.9,0,10.7,4.8,10.7,10.7v10.7c0,5.9,4.8,10.7,10.7,10.7H128V0"
            style={{ transform: 'translateY(0.5px)' }}
          />
        </svg>
      </div>
    </div>
  );
};

export default CornerDecoration;
