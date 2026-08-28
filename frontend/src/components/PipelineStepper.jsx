import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, FileText, ClipboardList, Maximize2, Minimize2 } from 'lucide-react'

// One icon per major stage, in order.
const GROUP_ICONS = [FileText, ClipboardList, CheckCircle2]

export default function PipelineStepper({ stageGroups }) {
  const [expanded, setExpanded] = useState(() => new Set())

  if (!stageGroups || stageGroups.length === 0) return null

  const allExpanded = stageGroups.every((g) => expanded.has(g.name))

  const toggleGroup = (name) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const toggleAll = () => {
    setExpanded(allExpanded ? new Set() : new Set(stageGroups.map((g) => g.name)))
  }

  return (
    <div className="bg-surface border border-border rounded-card shadow-card px-6 py-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <p className="text-caption uppercase tracking-wider text-gray-600 font-semibold m-0">
          Onboarding Pipeline · Global Avg. Days per Stage
        </p>
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-caption font-medium text-primary border border-border-dark bg-white rounded-button px-3 py-1.5 shrink-0 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          {allExpanded ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          {allExpanded ? 'Collapse view' : 'Expanded view'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0 mt-5">
        {stageGroups.map((group, i) => {
          const isLast = i === stageGroups.length - 1
          const isExpanded = expanded.has(group.name)
          const hasAnomalies = group.anomalyCount > 0
          const Icon = GROUP_ICONS[i % GROUP_ICONS.length]

          return (
            <div key={group.name} className="flex items-stretch flex-1 lg:min-w-0">
              <div className="flex-1 rounded-button border border-border bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.name)}
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${group.name} sub-stages`}
                  className="w-full text-left px-4 py-3.5"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="flex items-center justify-center w-8 h-8 rounded-button bg-primary/10 shrink-0">
                      <Icon size={15} className="text-primary" />
                    </span>
                    <p className="text-small font-semibold text-gray-900 m-0 truncate">{group.name}</p>
                  </div>

                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-bold leading-none text-gray-900">
                      {group.average ?? '—'}
                    </span>
                    <span className="text-[10px] text-gray-500">avg days</span>
                  </div>

                  <div className="flex items-center gap-1 mt-1.5">
                    {hasAnomalies ? (
                      <>
                        <AlertTriangle size={10} className="text-accent-red shrink-0" />
                        <span className="text-[10px] font-medium text-accent-red">
                          {group.anomalyCount} anomal{group.anomalyCount === 1 ? 'y' : 'ies'}
                        </span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={10} className="text-success shrink-0" />
                        <span className="text-[10px] font-medium text-success">No anomalies</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-border/70">
                    <span className="text-[11px] font-medium text-gray-600">
                      {group.subStages.length} sub-stage{group.subStages.length === 1 ? '' : 's'}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-white/60">
                    <table className="w-full text-caption">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                          <th className="text-left font-semibold px-4 py-2">Sub-stage</th>
                          <th className="text-right font-semibold px-3 py-2">Avg. Days</th>
                          <th className="text-right font-semibold px-4 py-2">Anomalies</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.subStages.map((s) => (
                          <tr key={s.column} className="border-t border-border/70">
                            <td className="px-4 py-2 text-gray-800 font-medium">{s.label}</td>
                            <td className="px-3 py-2 text-right text-gray-900 font-semibold whitespace-nowrap">
                              {s.average ?? '—'}
                            </td>
                            <td className="px-4 py-2 text-right whitespace-nowrap">
                              {s.anomalyCount > 0 ? (
                                <span className="text-accent-red font-semibold">{s.anomalyCount}</span>
                              ) : (
                                <span className="text-success">0</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Connector between major stages (desktop only), mirrors the
                  flow: Resource Req to Identification -> Identification to
                  Onboarding -> PID to Billing. */}
              {!isLast && (
                <div className="hidden lg:flex items-start pt-8 px-2 shrink-0" aria-hidden="true">
                  <div className="h-[2px] w-6 bg-border mt-2.5" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
