export default function PipelineStepper({ stages }) {
  if (!stages || stages.length === 0) return null

  return (
    <div className="bg-surface border border-border rounded-card shadow-card px-6 py-6 overflow-x-auto">
      <p className="text-caption uppercase tracking-wider text-gray-600 font-semibold mb-5">
        Onboarding Pipeline · Global Avg. Days per Stage
      </p>
      <div className="flex items-start min-w-[900px]">
        {stages.map((stage, i) => {
          const hasAnomalies = stage.anomalyCount > 0
          const dotColor = hasAnomalies ? 'bg-accent-red' : 'bg-primary'
          const textColor = hasAnomalies ? 'text-accent-red' : 'text-primary'
          return (
            <div key={stage.column} className="flex items-start flex-1">
              <div className="flex flex-col items-center flex-1 relative">
                {hasAnomalies && (
                  <span className="absolute -top-3 right-2 bg-accent-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {stage.anomalyCount}
                  </span>
                )}
                <div
                  className={`w-3.5 h-3.5 rounded-full ${dotColor} ring-4 ring-white shadow-sm z-10`}
                  title={`${stage.anomalyCount} candidate(s) statistically above normal`}
                />
                <p className="text-2xl font-bold mt-3 text-gray-900">
                  {stage.average ?? '—'}
                </p>
                <p className="text-[10px] text-gray-500 mb-1">avg days</p>
                <p className="text-caption text-center text-gray-700 font-medium leading-tight px-1 max-w-[110px]">
                  {stage.label}
                </p>
                <p className={`text-[10px] font-medium mt-1 ${textColor}`}>
                  anomaly &gt;{stage.anomalyCutoff ?? '—'}
                </p>
                {stage.excludedBadData > 0 && (
                  <p className="text-[9px] text-gray-400 mt-0.5">
                    {stage.excludedBadData} row(s) excluded
                  </p>
                )}
              </div>
              {i < stages.length - 1 && (
                <div className="h-4 flex items-center flex-1 -mx-1 mt-2">
                  <div className="h-[2px] w-full bg-border" />
                </div>
              )}
            </div>
          )
        })}
      </div>
      <p className="text-caption text-gray-600 mt-5 pt-4 border-t border-border">
        "Anomaly" = more than 1 standard deviation above this stage's own average across all candidates — not a fixed target. Recalculated fresh from the current dataset.
      </p>
    </div>
  )
}