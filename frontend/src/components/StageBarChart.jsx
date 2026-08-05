import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { theme } from '../theme'

const ONTRACK = theme.colors.primary
const ANOMALY = theme.colors.accentRed

// Custom pill-style label for the average reference line, used only in the
// "embedded" (Graph Section) variant to match the CGI dashboard reference.
function AverageLabel({ viewBox, value }) {
  if (!viewBox) return null
  const width = 124
  const height = 34
  const x = viewBox.x + viewBox.width - width
  const y = viewBox.y - height / 2

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={8}
        fill={theme.colors.gray100}
        stroke={theme.colors.border}
      />
      <text
        x={x + 12}
        y={y + height / 2 - 4}
        fontSize="9"
        fontFamily={theme.typography.fontFamily}
        fill={theme.colors.gray600}
      >
        Average
      </text>
      <text
        x={x + 12}
        y={y + height / 2 + 11}
        fontSize="12"
        fontWeight="700"
        fontFamily={theme.typography.fontFamily}
        fill={theme.colors.primary}
      >
        {value} Days
      </text>
    </g>
  )
}

/**
 * variant="card" (default): the original self-contained mini card used by
 * the grid layout below — unchanged behavior, including anomaly (red)
 * bar coloring.
 *
 * variant="embedded": used by GraphSection, which now provides its own
 * card/header chrome. Bars use a single brand color with value labels,
 * matching the reference dashboard design.
 */
export function MiniStageChart({ stage, byGroup, variant = 'card' }) {
  const embedded = variant === 'embedded'

  const data = byGroup.map((g) => ({
    group: g.group,
    value: g[stage.label],
    vsAvg: g[`${stage.label}__vsAvg`],
  }))

  const chart = (
    <div>
      {embedded && (
        <p className="text-caption text-gray-500 font-medium mb-2">Days</p>
      )}
      <ResponsiveContainer width="100%" height={embedded ? 320 : 160}>
        <BarChart
          data={data}
          margin={embedded ? { top: 28, right: 16, left: 0, bottom: 0 } : { top: 8, right: 8, left: -18, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
          <XAxis
            dataKey="group"
            tick={{ fontSize: embedded ? 12 : 10, fill: theme.colors.gray700, fontWeight: embedded ? 600 : 400 }}
            axisLine={{ stroke: theme.colors.borderDark }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: embedded ? 11 : 10, fill: theme.colors.gray600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${theme.colors.border}`,
              fontSize: 11,
              fontFamily: theme.typography.fontFamily,
            }}
            formatter={(val, name, props) => [
              `${val} days (${props.payload.vsAvg > 0 ? '+' : ''}${props.payload.vsAvg} vs avg)`,
              'Team avg',
            ]}
          />
          {stage.average != null && (
            <ReferenceLine
              y={stage.average}
              stroke={embedded ? theme.colors.primaryLight : theme.colors.gray500}
              strokeDasharray={embedded ? '5 5' : '4 4'}
              label={
                embedded
                  ? <AverageLabel value={stage.average} />
                  : {
                    value: 'global avg',
                    position: 'insideTopRight',
                    fontSize: 9,
                    fill: theme.colors.gray600,
                  }
              }
            />
          )}
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            fill={embedded ? theme.colors.primary : undefined}
            maxBarSize={embedded ? 64 : undefined}
          >
            {embedded ? (
              <LabelList
                dataKey="value"
                position="top"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  fill: theme.colors.gray900,
                  fontFamily: theme.typography.fontFamily,
                }}
              />
            ) : (
              data.map((entry, i) => (
                <Cell key={i} fill={entry.vsAvg > 0 ? ANOMALY : ONTRACK} />
              ))
            )}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  if (embedded) return chart

  return (
    <div className="bg-surface border border-border rounded-card shadow-card px-4 py-4">
      <div className="flex items-baseline justify-between mb-1">
        <p className="text-small font-semibold text-gray-900">{stage.label}</p>
        <p className="text-caption text-gray-500">avg {stage.average ?? '—'}</p>
      </div>
      {chart}
    </div>
  )
}

export default function StageBarChart({ byGroup, stages, embedded = false }) {
  if (!byGroup || byGroup.length === 0 || !stages) return null

  return (
    <div>
      {!embedded && (
        <p className="text-caption uppercase tracking-wider text-gray-600 font-semibold mb-3">
          Team Performance vs. Global Average, per Stage
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stages.map((stage) => (
          <MiniStageChart key={stage.column} stage={stage} byGroup={byGroup} />
        ))}
      </div>
    </div>
  )
}