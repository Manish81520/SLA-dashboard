import { useState } from 'react'
import { AlertTriangle, ChevronRight, ChevronDown, ListChecks } from 'lucide-react'

export default function FocusAreas({ focusAreas, candidates, onSelectCandidate }) {
    const [expanded, setExpanded] = useState(false)
    const [activeStage, setActiveStage] = useState(null)

    if (!focusAreas) return null

    if (focusAreas.length === 0) {
        return (
            <div className="bg-surface border border-border rounded-card shadow-card px-6 py-5 flex items-center gap-3">
                <AlertTriangle size={18} className="text-success shrink-0" />
                <div>
                    <p className="text-small font-semibold text-gray-900 m-0">No focus areas right now</p>
                    <p className="text-caption text-gray-600 m-0">
                        No one currently in progress is approaching a stage's SLA average.
                    </p>
                </div>
            </div>
        )
    }

    // Count how many people are approaching the average, per stage, and
    // surface the worst four as quick-glance cards (matches the reference
    // "Focus Areas" strip design).
    const counts = {}
    focusAreas.forEach((f) => {
        counts[f.stage] = (counts[f.stage] || 0) + 1
    })
    const stageCards = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([stage, count]) => ({ stage, count }))

    const handleCardClick = (stage) => {
        if (stage === activeStage) {
            // Second click on the same card collapses the panel instead of
            // falling back to the unfiltered "all stages" list.
            setExpanded(false)
            setActiveStage(null)
            return
        }
        setActiveStage(stage)
        setExpanded(true)
    }

    const handleToggleAll = () => {
        setExpanded((e) => !e)
        setActiveStage(null)
    }

    const visibleList = activeStage ? focusAreas.filter((f) => f.stage === activeStage) : focusAreas

    const handleSelect = (candidateName) => {
        if (!onSelectCandidate || !candidates) return
        const match = candidates.find((c) => c.Name === candidateName)
        if (match) onSelectCandidate(match)
    }

    return (
        <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
                <div className="w-9 h-9 rounded-button bg-accent-red/10 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-accent-red" />
                </div>
                <div>
                    <p className="text-title font-bold text-gray-900 m-0 leading-tight">Focus Areas</p>
                    <p className="text-caption text-gray-500 m-0">Key areas that need immediate attention.</p>
                </div>
            </div>

            <div className="flex items-stretch gap-3 px-6 py-4 overflow-x-auto">
                {stageCards.map(({ stage, count }) => (
                    <button
                        key={stage}
                        type="button"
                        onClick={() => handleCardClick(stage)}
                        className={`flex items-center justify-between gap-3 min-w-[220px] text-left px-4 py-3 rounded-button border transition-colors ${activeStage === stage
                                ? 'border-primary bg-primary/5'
                                : 'border-accent-red/20 bg-accent-red/5 hover:bg-accent-red/10'
                            }`}
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <span className="text-title font-bold text-accent-red shrink-0">{count}</span>
                            <div className="min-w-0">
                                <p className="text-small font-semibold text-gray-900 m-0 truncate">{stage}</p>
                                <p className="text-caption text-gray-500 m-0">Approaching SLA breach</p>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-gray-400 shrink-0" />
                    </button>
                ))}

                <button
                    type="button"
                    onClick={handleToggleAll}
                    className="flex items-center justify-between gap-3 min-w-[180px] text-left px-4 py-3 rounded-button border border-primary bg-white hover:bg-primary/5 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <ListChecks size={16} className="text-primary shrink-0" />
                        <span className="text-small font-semibold text-primary leading-tight">
                            View All
                            <br />
                            Focus Areas
                        </span>
                    </div>
                    {expanded ? (
                        <ChevronDown size={16} className="text-primary shrink-0" />
                    ) : (
                        <ChevronRight size={16} className="text-primary shrink-0" />
                    )}
                </button>
            </div>

            {/* Full list only renders once the user taps to expand it. */}
            {expanded && (
                <div className="border-t border-border max-h-80 overflow-y-auto">
                    {visibleList.map((f, i) => {
                        const isClickable = Boolean(onSelectCandidate && candidates?.some((c) => c.Name === f.candidate))
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelect(f.candidate)}
                                disabled={!isClickable}
                                className={`group w-full px-6 py-3 flex items-center justify-between gap-3 text-left transition-colors ${i > 0 ? 'border-t border-border' : ''} ${isClickable ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'cursor-default'}`}
                            >
                                <div className="min-w-0">
                                    <p className={`text-small font-medium m-0 truncate ${isClickable ? 'text-gray-900 group-hover:text-primary group-hover:underline' : 'text-gray-900'}`}>
                                        {f.candidate}
                                    </p>
                                    <p className="text-caption text-gray-600 m-0 truncate">
                                        {f.team} · {f.stage}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-small font-bold text-accent-red m-0">
                                        {f.value}d / {f.average}d avg
                                    </p>
                                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-small inline-block mt-0.5 bg-gray-100 text-accent-red">
                                        {f.percentOfAverage}% of average
                                    </span>
                                </div>
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}