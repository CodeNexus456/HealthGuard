import React from 'react';

interface RingGaugeProps {
  value: number;
  size?: number;
  stroke?: number;
  color: string;
  label?: string;
  big?: boolean;
}

export const RingGauge: React.FC<RingGaugeProps> = ({
  value,
  size = 78,
  stroke = 7,
  color,
  label,
  big = false,
}) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90 transform"
        style={{ transformOrigin: 'center' }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E1D1"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center font-mono pointer-events-none text-center">
        <span
          className={`font-semibold tracking-tight leading-none ${
            big ? 'text-2xl' : 'text-sm'
          }`}
          style={{ color: '#22271F' }}
        >
          {clamped}%
        </span>
        {label && (
          <span className="text-[9px] uppercase tracking-wider font-semibold text-[#8B8776] mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
