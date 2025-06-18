import React from "react";

export function SuccessTickAnimation() {
  return (
    <div className="mb-6 flex items-center justify-center">
      <svg
        className="w-20 h-20"
        viewBox="0 0 80 80"
        data-testid="success-tick-animation"
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          stroke="#22c55e"
          strokeWidth="6"
          className="animate-success-circle"
        />
        <polyline
          points="24,44 36,56 56,32"
          fill="none"
          stroke="#22c55e"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-success-tick"
        />
      </svg>
      <style jsx>{`
        @keyframes drawCircle {
          0% {
            stroke-dasharray: 0 226;
          }
          100% {
            stroke-dasharray: 226 0;
          }
        }
        @keyframes drawTick {
          0% {
            stroke-dasharray: 0 48;
          }
          100% {
            stroke-dasharray: 48 0;
          }
        }
        .animate-success-circle {
          stroke-dasharray: 226;
          stroke-dashoffset: 0;
          animation: drawCircle 0.5s ease-out forwards;
        }
        .animate-success-tick {
          stroke-dasharray: 48;
          stroke-dashoffset: 0;
          animation: drawTick 0.4s 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
