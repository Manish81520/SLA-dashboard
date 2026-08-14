import { AlertTriangle, CheckCircle2 } from 'lucide-react'

export default function PipelineStepper({ stages }) {
  if (!stages || stages.length === 0) return null

  return (
    <div className="bg-surface border border-border rounded-card shadow-card px-6 py-5 overflow-x-auto">
      <p className="text-caption uppercase tracking-wider text-gray-600 font-semibold mb-4">
        Onboarding Pipeline · Global Avg. Days per Stage
      </p>

      <div className="flex items-start min-w-[900px]">
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1
          const hasAnomalies = stage.anomalyCount > 0

          return (
            <div key={stage.column} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1 relative">
                {hasAnomalies && (
                  <span className="absolute -top-2 left-1/2 translate-x-2 flex items-center justify-center min-w-[17px] h-[17px] px-1 bg-accent-red text-white text-[10px] font-bold rounded-full z-20">
                    {stage.anomalyCount}
                  </span>
                )}

                <div
                  className={`w-3.5 h-3.5 rounded-full ${hasAnomalies ? 'bg-accent-red' : 'bg-success'
                    } ring-4 ring-white shadow-sm z-10`}
                />

                <p className="text-2xl font-bold mt-2 text-primary">
                  {stage.average ?? '—'}
                </p>
                <p className="text-[10px] text-gray-500 mb-0.5">avg days</p>
                <p className="text-caption text-center text-gray-700 font-medium leading-tight px-1 max-w-[110px]">
                  {stage.label}
                </p>

                <span
                  className={`flex items-center gap-1 text-[10px] font-medium mt-1 ${hasAnomalies ? 'text-accent-red' : 'text-success'
                    }`}
                >
                  {hasAnomalies ? (
                    <>
                      <AlertTriangle size={10} className="shrink-0" />
                      anomaly &gt;{stage.anomalyCutoff ?? '—'}d
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={10} className="shrink-0" />
                      no anomalies
                    </>
                  )}
                </span>
              </div>

              {/* Connector always renders (invisible on the last stage) so every
                  stage's content box stays the same width — same fix used in
                  CandidateDetail's CandidateStageProgress. */}
              <div className={`h-4 flex items-center flex-1 -mx-1 mt-2 ${isLast ? 'invisible' : ''}`} aria-hidden="true">
                <div className="h-[2px] w-full bg-border" />
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