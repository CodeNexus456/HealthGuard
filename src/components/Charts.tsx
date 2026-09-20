import React from 'react';

interface ChartProps {
  data: number[];
  color: string;
  height?: number;
  labels?: string[];
}

export const Sparkline: React.FC<ChartProps> = ({ data, color, height = 64 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 280;

  const points = data
    .map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 16) + 8;
      const y = height - 10 - ((val - min) / range) * (height - 24);
      return `${x},${y}`;
    })
    .join(' ');

  const lastPoint = points.split(' ').pop()?.split(',') || [0, 0];

  return (
    <div className="w-full relative overflow-hidden py-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={lastPoint[0]}
          cy={lastPoint[1]}
          r="4"
          fill={color}
          className="transition-all duration-300"
        />
      </svg>
    </div>
  );
};

export const AreaChart: React.FC<ChartProps> = ({ data, color, height = 64 }) => {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 280;
  const gradientId = `grad-${color.replace('#', '')}-${Math.random().toString(36).substring(2, 7)}`;

  const pts = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 16) + 8;
    const y = height - 10 - ((val - min) / range) * (height - 24);
    return [x, y];
  });

  const lineStr = pts.map((p) => p.join(',')).join(' ');
  const areaPath = `M${pts[0][0]},${height} L${pts.map((p) => p.join(',')).join(' L')} L${pts[pts.length - 1][0]},${height} Z`;

  return (
    <div className="w-full relative overflow-hidden py-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <polyline
          points={lineStr}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={pts[pts.length - 1][0]}
          cy={pts[pts.length - 1][1]}
          r="3.5"
          fill={color}
        />
      </svg>
    </div>
  );
};

export const BarsChart: React.FC<ChartProps> = ({ data, color, height = 64 }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data) || 1;
  const width = 280;
  const barWidth = (width / data.length) * 0.52;
  const gap = width / data.length;

  return (
    <div className="w-full relative overflow-hidden py-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
      >
        {data.map((val, idx) => {
          const barHeight = Math.max(4, (val / max) * (height - 18));
          const x = idx * gap + (gap - barWidth) / 2;
          const y = height - 4 - barHeight;
          return (
            <rect
              key={idx}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx="3"
              fill={color}
              className="opacity-90 hover:opacity-100 transition-opacity"
            />
          );
        })}
      </svg>
    </div>
  );
};
