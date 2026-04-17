"use client";

import { AxisScores } from "@/lib/warroom/types";
import { AxisKey } from "@/lib/warroom/labels";

interface RadarChartProps {
  candidate: AxisScores;
  opponent: AxisScores;
  labels: Record<AxisKey, string>;
  size?: number;
}

const AXIS_ORDER: AxisKey[] = [
  "ground",
  "numbers",
  "narrative",
  "organisation",
  "momentum",
  "resources",
];

export default function RadarChart({
  candidate,
  opponent,
  labels,
  size = 420,
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 70;
  const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
  const n = AXIS_ORDER.length;

  function point(i: number, value: number): [number, number] {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius * (value / 100);
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  }

  function labelPoint(i: number): [number, number] {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const r = radius + 28;
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  }

  const candidatePoints = AXIS_ORDER.map((k, i) => point(i, candidate[k])).map(
    ([x, y]) => `${x},${y}`
  ).join(" ");

  const opponentPoints = AXIS_ORDER.map((k, i) => point(i, opponent[k])).map(
    ([x, y]) => `${x},${y}`
  ).join(" ");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${size} ${size}`}
      style={{ maxWidth: size, height: "auto", display: "block" }}
    >
      {/* Concentric polygons as grid */}
      {levels.map((level) => {
        const pts = AXIS_ORDER.map((_, i) => {
          const [x, y] = point(i, level * 100);
          return `${x},${y}`;
        }).join(" ");
        return (
          <polygon
            key={level}
            points={pts}
            fill="none"
            stroke="#2A2A2A"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines */}
      {AXIS_ORDER.map((_, i) => {
        const [x, y] = point(i, 100);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="#2A2A2A"
            strokeWidth={1}
          />
        );
      })}

      {/* Opponent polygon */}
      <polygon
        points={opponentPoints}
        fill="#C0392B"
        fillOpacity={0.15}
        stroke="#C0392B"
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {/* Candidate polygon */}
      <polygon
        points={candidatePoints}
        fill="#F5A623"
        fillOpacity={0.25}
        stroke="#F5A623"
        strokeWidth={2}
      />

      {/* Vertex dots — candidate */}
      {AXIS_ORDER.map((k, i) => {
        const [x, y] = point(i, candidate[k]);
        return <circle key={`c-${i}`} cx={x} cy={y} r={3} fill="#F5A623" />;
      })}

      {/* Axis labels */}
      {AXIS_ORDER.map((k, i) => {
        const [x, y] = labelPoint(i);
        return (
          <g key={`l-${i}`}>
            <text
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#9CA3AF"
              fontSize="12"
              fontWeight="500"
            >
              {labels[k]}
            </text>
            <text
              x={x}
              y={y + 14}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#F5A623"
              fontSize="10"
              fontWeight="600"
            >
              {Math.round(candidate[k])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
