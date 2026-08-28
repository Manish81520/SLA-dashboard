import { useState, useMemo } from 'react'
import { ChevronDown, BarChart3 } from 'lucide-react'
import { MiniStageChart } from './StageBarChart'

/**
 * Static graph registry — for graph types that AREN'T derived from
 * `stages` (e.g. a future trend line, funnel, etc). To add one,
 * just append an entry here: { id, label, icon, render(ctx) }.
 * `ctx` receives { stages, byGroup } same as the dynamic entries below.
 */
const STATIC_GRAPHS = []

export default function GraphSection({ stages, byGroup }) {
    // One registry entry per stage, reusing MiniStageChart directly —
    // this is what keeps each stage's chart shown one at a time instead
    // of all of them rendering together in a grid.
    const registry = useMemo(() => {
        const stageGraphs = (stages ?? []).map((stage) => ({
            id: `stage-${stage.column}`,
            label: stage.label,
            icon: BarChart3,
            average: stage.average,
            render: () => <MiniStageChart stage={stage} byGroup={byGroup} variant="embedded" />,
        }))
        return [...STATIC_GRAPHS, ...stageGraphs]
    }, [stages, byGroup])

    const [activeId, setActiveId] = useState(registry[0]?.id)
    const chartMinWidth = Math.max((byGroup?.length ?? 0) * 90, 100)

    if (registry.length === 0) return null

    const activeGraph = registry.find((g) => g.id === activeId) ?? registry[0]
    const Icon = activeGraph.icon

    return (
        <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-border">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-title font-bold text-gray-900 m-0 leading-tight truncate">
                            {activeGraph.label}
                        </p>
                        <p className="text-small text-gray-500 m-0">Average days by team</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="relative w-full sm:w-64">
                        <select
                            value={activeGraph.id}
                            onChange={(e) => setActiveId(e.target.value)}
                            aria-label="Select graph to display"
                            className="w-full appearance-none bg-white border border-border-dark text-small text-gray-900 rounded-input pl-3 pr-9 py-2.5 font-medium cursor-pointer focus-visible:outline-primary"
                        >
                            {registry.map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                        />
                    </div>

                    {activeGraph.average != null && (
                        <div className="hidden sm:flex flex-col items-center justify-center bg-primary-light/10 border border-primary-light/20 rounded-button px-4 py-1.5 leading-tight">
                            <span className="text-caption text-gray-500">Average</span>
                            <span className="text-small font-bold text-primary">{activeGraph.average} Days</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-6 py-6 overflow-x-auto overscroll-contain">
                <div style={{ minWidth: chartMinWidth }}>
                    {activeGraph.render()}
                </div>
            </div>
        </div>
    )
}