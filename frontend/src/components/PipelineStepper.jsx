import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function PipelineStepper({ stages }) {
  if (!stages || stages.length === 0) return null

  return (
    <div className="bg-surface border border-border rounded-card shadow-card px-6 py-6">
      <p className="text-caption uppercase tracking-wider text-gray-600 font-semibold mb-4">
        Onboarding Pipeline · Global Avg. Days per Stage
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
        {stages.map((stage) => {
          const hasAnomalies = stage.anomalyCount > 0
          return (
            <div
              key={stage.column}
              className={`rounded-button border px-3 py-2.5 ${hasAnomalies ? 'border-accent-red/20 bg-accent-red/5' : 'border-border bg-surface'
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-baseline gap-1.5">
                  <span className={`text-xl font-bold leading-none ${hasAnomalies ? 'text-accent-red' : 'text-gray-900'}`}>
                    {stage.average ?? '—'}
                  </span>
                  <span className="text-[10px] text-gray-500">Avg. Days</span>
                </div>
                {hasAnomalies && (
                  <span className="flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-accent-red text-white text-[10px] font-bold rounded-full shrink-0">
                    {stage.anomalyCount}
                  </span>
                )}
              </div>

              <p className="text-caption font-medium text-gray-900 leading-tight mt-1.5 mb-1.5 truncate" title={stage.label}>
                {stage.label}
              </p>

              <div className="flex items-center gap-1">
                {hasAnomalies ? (
                  <>
                    <AlertTriangle size={10} className="text-accent-red shrink-0" />
                    <span className="text-[10px] font-medium text-accent-red">
                      Anomaly: &gt;{stage.anomalyCutoff ?? '—'}d
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={10} className="text-success shrink-0" />
                    <span className="text-[10px] font-medium text-success">No anomalies</span>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-caption text-gray-600 mt-4 pt-3 border-t border-border">
        Anomaly = More than 1 standard deviation above this stage's own average across all candidates.
      </p>
    </div>
  )
}
