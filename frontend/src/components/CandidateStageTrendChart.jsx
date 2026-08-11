import {
    LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
} from 'recharts'
import { theme } from '../theme'

export default function CandidateStageTrendChart({ stageRows }) {
    if (!stageRows || stageRows.length === 0) return null

    const data = stageRows.map((s) => ({
        label: s.shortLabel ?? s.label,
        candidate: s.value,
        average: s.average,
    }))

    return (
        <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border} vertical={false} />
                <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: theme.colors.gray700 }}
                    axisLine={{ stroke: theme.colors.borderDark }}
                    tickLine={false}
                />
                <YAxis tick={{ fontSize: 11, fill: theme.colors.gray600 }} axisLine={false} tickLine={false} />
                <Tooltip
                    contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${theme.colors.border}`,
                        fontSize: 11,
                        fontFamily: theme.typography.fontFamily,
                    }}
                />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: theme.typography.fontFamily }} />
                <Line
                    type="monotone"
                    dataKey="candidate"
                    name="This Candidate"
                    stroke={theme.colors.primary}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    connectNulls
                />
                <Line
                    type="monotone"
                    dataKey="average"
                    name="Team Average"
                    stroke={theme.colors.gray400}
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    connectNulls
                />
            </LineChart>
        </ResponsiveContainer>
    )
}