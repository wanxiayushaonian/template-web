import React from "react";

interface LoadingAnimationProps {
  isVisible: boolean;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="loader">
        {/* 渐变定义 */}
        <svg height="0" width="0" viewBox="0 0 64 64" className="absolute">
          <defs xmlns="http://www.w3.org/2000/svg">
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="b"
            >
              <stop stopColor="#973BED" />
              <stop stopColor="#007CFF" offset="1" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="0"
              x2="0"
              y1="64"
              x1="0"
              id="c"
            >
              <stop stopColor="#FFC800" />
              <stop stopColor="#F0F" offset="1" />
              <animateTransform
                repeatCount="indefinite"
                keySplines=".42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1;.42,0,.58,1"
                keyTimes="0; 0.125; 0.25; 0.375; 0.5; 0.625; 0.75; 0.875; 1"
                dur="8s"
                values="0 32 32;-270 32 32;-270 32 32;-540 32 32;-540 32 32;-810 32 32;-810 32 32;-1080 32 32;-1080 32 32"
                type="rotate"
                attributeName="gradientTransform"
              />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="d"
            >
              <stop stopColor="#00E0ED" />
              <stop stopColor="#00DA72" offset="1" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="e"
            >
              <stop stopColor="#FF6B6B" />
              <stop stopColor="#4ECDC4" offset="1" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="f"
            >
              <stop stopColor="#A8E6CF" />
              <stop stopColor="#88D8C0" offset="1" />
            </linearGradient>
            <linearGradient
              gradientUnits="userSpaceOnUse"
              y2="2"
              x2="0"
              y1="62"
              x1="0"
              id="g"
            >
              <stop stopColor="#FFD93D" />
              <stop stopColor="#FF6B6B" offset="1" />
            </linearGradient>
          </defs>
        </svg>

        {/* L */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#b)"
            d="M 12,8 L 12,52 L 44,52"
            className="dash"
            id="l"
            pathLength="360"
          />
        </svg>

        {/* I */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#c)"
            d="M 20,8 L 44,8 M 32,8 L 32,52 M 20,52 L 44,52"
            className="dash"
            id="i1"
            pathLength="360"
          />
        </svg>

        {/* U */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#d)"
            d="M 12,8 L 12,40 Q 12,52 24,52 L 40,52 Q 52,52 52,40 L 52,8"
            className="dash"
            id="u"
            pathLength="360"
          />
        </svg>

        {/* J */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#e)"
            d="M 36,8 L 36,40 Q 36,52 24,52 L 16,52 Q 8,52 8,44"
            className="dash"
            id="j"
            pathLength="360"
          />
        </svg>

        {/* I */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#f)"
            d="M 20,8 L 44,8 M 32,8 L 32,52 M 20,52 L 44,52"
            className="dash"
            id="i2"
            pathLength="360"
          />
        </svg>

        {/* N */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#g)"
            d="M 12,52 L 12,8 L 52,52 L 52,8"
            className="dash"
            id="n"
            pathLength="360"
          />
        </svg>

        {/* B */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#b)"
            d="M 12,8 L 12,52 M 12,8 L 36,8 Q 52,8 52,20 Q 52,32 36,32 L 12,32 M 12,32 L 40,32 Q 56,32 56,44 Q 56,52 40,52 L 12,52"
            className="dash"
            id="b"
            pathLength="360"
          />
        </svg>

        {/* A */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#c)"
            d="M 12,52 L 32,8 L 52,52 M 20,36 L 44,36"
            className="dash"
            id="a"
            pathLength="360"
          />
        </svg>

        {/* O */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 64 64"
          height="64"
          width="64"
          className="inline-block"
        >
          <path
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="8"
            stroke="url(#d)"
            d="M 32,8 Q 52,8 52,32 Q 52,52 32,52 Q 12,52 12,32 Q 12,8 32,8"
            className="dash"
            id="o"
            pathLength="360"
          />
        </svg>
      </div>

      <style jsx>{`
        .loader {
          display: flex;
          margin: 0.25em 0;
          gap: 0.2em;
        }

        .dash {
          animation: dashArray 2s ease-in-out infinite,
            dashOffset 2s linear infinite;
        }

        @keyframes dashArray {
          0% {
            stroke-dasharray: 0 1 359 0;
          }
          50% {
            stroke-dasharray: 0 359 1 0;
          }
          100% {
            stroke-dasharray: 359 1 0 0;
          }
        }

        @keyframes dashOffset {
          0% {
            stroke-dashoffset: 365;
          }
          100% {
            stroke-dashoffset: 5;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
