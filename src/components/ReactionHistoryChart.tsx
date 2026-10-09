import React from 'react';
import { ReactionRecord } from '../types/game';

interface ReactionHistoryChartProps {
  records: ReactionRecord[];
}

export const ReactionHistoryChart: React.FC<ReactionHistoryChartProps> = ({ records }) => {
  if (records.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
        No attempts recorded yet. Click the button to test your reaction speed!
      </div>
    );
  }

  // Display the last 15 attempts in chronological order (oldest to newest)
  const displayRecords = [...records].reverse().slice(-15);
  const validTimes = displayRecords.map((r) => r.timeMs);
  const minTime = Math.min(...validTimes, 150);
  const maxTime = Math.max(...validTimes, 450);
  const range = Math.max(maxTime - minTime, 100);

  const chartHeight = 140;
  const chartWidth = 520;
  const paddingX = 35;
  const paddingY = 25;

  const points = displayRecords.map((rec, index) => {
    const x =
      paddingX +
      (index / Math.max(displayRecords.length - 1, 1)) * (chartWidth - paddingX * 2);
    // Y-scale inverted
    const normalized = (rec.timeMs - minTime) / range;
    const y = chartHeight - paddingY - normalized * (chartHeight - paddingY * 2);
    return { x, y, record: rec };
  });

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Human baseline 250ms line
  const baselineNorm = (250 - minTime) / range;
  const baselineY = chartHeight - paddingY - Math.max(0, Math.min(1, baselineNorm)) * (chartHeight - paddingY * 2);

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
        <span className="font-semibold uppercase tracking-wider text-slate-300">
          Recent 15 Attempts Trend
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2.5 h-0.5 bg-dashed bg-emerald-500"></span>
            <span>250ms Human Average</span>
          </span>
        </div>
      </div>

      <div className="relative overflow-x-auto">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-36 overflow-visible"
        >
          {/* Subtle horizontal grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={chartWidth - paddingX}
            y2={paddingY}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeOpacity="0.4"
          />
          <text
            x={paddingX - 6}
            y={paddingY + 4}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {Math.round(maxTime)}
          </text>

          {/* 250ms reference line */}
          {baselineY >= paddingY && baselineY <= chartHeight - paddingY && (
            <>
              <line
                x1={paddingX}
                y1={baselineY}
                x2={chartWidth - paddingX}
                y2={baselineY}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth="1.2"
                strokeOpacity="0.8"
              />
              <text
                x={chartWidth - paddingX + 6}
                y={baselineY + 3}
                fill="#10b981"
                fontSize="9"
                fontFamily="monospace"
              >
                250ms
              </text>
            </>
          )}

          {/* Bottom baseline */}
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="#334155"
            strokeDasharray="3 3"
            strokeOpacity="0.4"
          />
          <text
            x={paddingX - 6}
            y={chartHeight - paddingY + 4}
            fill="#64748b"
            fontSize="9"
            textAnchor="end"
            fontFamily="monospace"
          >
            {Math.round(minTime)}
          </text>

          {/* Connecting line */}
          {points.length > 1 && (
            <polyline
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={polylineStr}
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => {
            const isSub200 = p.record.timeMs < 200;
            const isSub250 = p.record.timeMs <= 250;
            const fillColor = isSub200 ? '#f59e0b' : isSub250 ? '#10b981' : '#38bdf8';

            return (
              <g key={p.record.id || idx}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="5"
                  fill={fillColor}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all hover:scale-125"
                />
                <text
                  x={p.x}
                  y={p.y - 8}
                  fill="#94a3b8"
                  fontSize="8"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {p.record.timeMs}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
