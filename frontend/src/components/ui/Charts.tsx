import React from 'react';
import { cn } from '@/lib/utils';

// Simple, lightweight chart components without external dependencies

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

// Bar Chart
interface BarChartProps {
  data: DataPoint[];
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 200,
  showLabels = true,
  showValues = true,
  orientation = 'vertical',
  className,
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  const defaultColors = [
    'bg-primary-500',
    'bg-violet-500',
    'bg-pink-500',
    'bg-amber-500',
    'bg-emerald-500',
    'bg-cyan-500',
  ];

  if (orientation === 'horizontal') {
    return (
      <div className={cn('space-y-3', className)}>
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.label}
              </span>
              {showValues && (
                <span className="text-slate-500 dark:text-slate-400">
                  {item.value}
                </span>
              )}
            </div>
            <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  item.color || defaultColors[index % defaultColors.length]
                )}
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex items-end justify-around gap-2', className)} style={{ height }}>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1 h-full">
          <div className="flex-1 flex items-end w-full">
            <div
              className={cn(
                'w-full rounded-t-lg transition-all duration-500 relative group',
                item.color || defaultColors[index % defaultColors.length]
              )}
              style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
            >
              {showValues && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.value}
                </span>
              )}
            </div>
          </div>
          {showLabels && (
            <span className="mt-2 text-xs text-slate-500 dark:text-slate-400 truncate max-w-full text-center">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// Donut Chart
interface DonutChartProps {
  data: DataPoint[];
  size?: number;
  strokeWidth?: number;
  showLegend?: boolean;
  centerLabel?: React.ReactNode;
  className?: string;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  size = 180,
  strokeWidth = 24,
  showLegend = true,
  centerLabel,
  className,
}) => {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const defaultColors = [
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // emerald
    '#06b6d4', // cyan
  ];

  let currentOffset = 0;

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Data segments */}
          {data.map((item, index) => {
            const percentage = item.value / total;
            const segmentLength = percentage * circumference;
            const offset = currentOffset;
            currentOffset += segmentLength;

            return (
              <circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={item.color || defaultColors[index % defaultColors.length]}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {centerLabel || (
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                {total}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Total
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap justify-center gap-4">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: item.color || defaultColors[index % defaultColors.length],
                }}
              />
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {item.label}
              </span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Sparkline Chart
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 120,
  height = 40,
  color = '#3b82f6',
  filled = true,
  className,
}) => {
  if (data.length < 2) return null;

  const padding = 2;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const minValue = Math.min(...data);
  const maxValue = Math.max(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * graphWidth;
    const y = padding + (1 - (value - minValue) / range) * graphHeight;
    return `${x},${y}`;
  });

  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L ${width - padding},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <svg width={width} height={height} className={className}>
      {filled && (
        <path d={areaPath} fill={color} opacity={0.1} />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={width - padding}
        cy={padding + (1 - (data[data.length - 1] - minValue) / range) * graphHeight}
        r={3}
        fill={color}
      />
    </svg>
  );
};

// Mini Progress
interface MiniProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md';
  color?: string;
  className?: string;
}

export const MiniProgress: React.FC<MiniProgressProps> = ({
  value,
  max = 100,
  size = 'sm',
  color = 'bg-primary-500',
  className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div
      className={cn(
        'w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden',
        size === 'sm' ? 'h-1' : 'h-2',
        className
      )}
    >
      <div
        className={cn('h-full rounded-full transition-all duration-300', color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
