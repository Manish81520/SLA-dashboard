import { useState, useEffect } from 'react'
import { AlertTriangle, TrendingUp, ChevronDown } from 'lucide-react'

function severityStyle(zScore) {
    if (zScore == null) return { label: 'Flagged', className: 'bg-gray-100 text-accent-red' }
    if (zScore >= 2) return { label: 'Severe', className: 'bg-accent-red text-white' }
    return { label: 'Elevated', className: 'bg-gray-100 text-accent-red' }
}

export default function AnomalyWatchlist({ watchlist, stages, candidates, onSelectCandidate }) {
    const [activeStage, setActiveStage] = useState(stages?.[0]?.label ?? null)

    useEffect(() => {
        if (stages && stages.length > 0 && !stages.some((s) => s.label === activeStage)) {
            setActiveStage(stages[0].label)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stages])

    if (!watchlist || !stages || stages.length === 0) return null

    const filtered = watchlist.filter((a) => a.stage === activeStage)

    const handleSelect = (candidateName) => {
        if (!onSelectCandidate || !candidates) return
        const match = candidates.find((c) => c.Name === candidateName)
        if (match) onSelectCandidate(match)
    }

    return (
        <div className="bg-surface border border-border rounded-card shadow-card flex flex-col h-full overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-gray-50">
                <div className="flex items-center gap-2 min-w-0">
                    <AlertTriangle size={16} className="text-accent-red shrink-0" />
                    <p className="text-caption uppercase tracking-wider font-semibold text-gray-700 m-0 truncate">
                        Anomaly Watchlist ({filtered.length})
                    </p>
                </div>
                <div className="relative shrink-0 w-44">
                    <select
                        value={activeStage ?? ''}
                        onChange={(e) => setActiveStage(e.target.value)}
                        aria-label="Select stage to view anomalies for"
                        className="w-full appearance-none bg-white border border-border-dark text-caption text-gray-900 rounded-input pl-3 pr-7 py-1.5 font-medium cursor-pointer"
                    >
                        {stages.map((s) => (
                            <option key={s.label} value={s.label}>
                                {s.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        size={13}
                        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-600"
                    />
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                    <TrendingUp size={24} className="text-success mb-2.5" />
                    <p className="text-small font-medium text-gray-900 m-0">No anomalies for {activeStage}</p>
                    <p className="text-caption text-gray-600 mt-1 m-0">This stage is within 1σ of its own average.</p>
                </div>
            ) : (
                <div className="overflow-y-auto overscroll-contain flex-1 max-h-[384px]">
                    {filtered.map((a, i) => {
                        const sev = severityStyle(a.zScore)
                        const isClickable = Boolean(onSelectCandidate && candidates?.some((c) => c.Name === a.candidate))
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => handleSelect(a.candidate)}
                                disabled={!isClickable}
                                className={`group w-full px-5 py-3.5 flex items-center justify-between gap-3 text-left transition-colors ${i > 0 ? 'border-t border-border' : ''} ${isClickable ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'cursor-default'}`}
                            >
                                <div className="min-w-0">
                                    <p className={`text-small font-medium m-0 truncate ${isClickable ? 'text-gray-900 group-hover:text-primary group-hover:underline' : 'text-gray-900'}`}>
                                        {a.candidate}
                                    </p>
                                    <p className="text-caption text-gray-600 m-0 truncate">
                                        {a.team} · {a.stage}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-small font-bold text-accent-red m-0">+{a.deviation}d</p>
                                    <span
                                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded-small inline-block mt-0.5 ${sev.className}`}
                                    >
                                        {sev.label}
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