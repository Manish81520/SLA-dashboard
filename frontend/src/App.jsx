import { useEffect, useMemo, useState, useCallback } from 'react'
import { Download, Loader2, AlertCircle, ShieldAlert, Activity } from 'lucide-react'
import { fetchSummary, fetchCandidates, exportUrl } from './api'

import PipelineStepper from './components/PipelineStepper'
import FilterBar from './components/FilterBar'
import FileUpload from './components/Fileupload'
import KpiCards from './components/KpiCards'
import GraphSection from './components/GraphSection'
import AnomalyWatchlist from './components/Anomalywatchlist'
import CandidateTable from './components/CandidateTable'

export default function App() {
  const [summary, setSummary] = useState(null)
  const [candidates, setCandidates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})

  // Both the summary stats (KPIs, pipeline stepper, graphs, anomaly
  // watchlist) and the candidate rows are recomputed on the backend from
  // whatever filters are currently active, so the whole dashboard - not
  // just the table - reflects the selected filters.
  const loadData = useCallback((filters) => {
    setLoading(true)
    setError(null)
    Promise.all([fetchSummary(filters), fetchCandidates(filters)])
      .then(([summaryData, candidateData]) => {
        setSummary(summaryData)
        setCandidates(candidateData.rows)
      })
      .catch((err) => {
        setError(
          err.response?.status === 404
            ? 'No dataset loaded yet. Upload a CSV to get started.'
            : err.response
              ? `Backend responded with an error (${err.response.status}).`
              : 'Could not reach the backend API. Is it running on http://localhost:8000?'
        )
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadData(activeFilters)
  }, [loadData, activeFilters])

  const stageLabels = useMemo(() => summary?.stages.map((s) => s.label) ?? [], [summary])

  return (
    <div className="min-h-screen bg-canvas text-gray-900">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 py-4 border-b border-border bg-surface shadow-subtle sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-button bg-primary flex items-center justify-center shrink-0">
            <Activity size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="font-semibold text-title text-primary m-0 truncate">
            Onboarding SLA Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <FileUpload dataset={summary?.dataset} onUploaded={() => loadData(activeFilters)} />
          <a
            href={exportUrl}
            className="hidden sm:flex items-center gap-2 bg-primary text-white text-small font-medium px-4 py-2.5 rounded-button no-underline shadow-subtle hover:bg-primary-hover transition-colors"
          >
            <Download size={15} />
            Export
          </a>
        </div>
      </header>

      {summary?.filters && (
        <div className="px-4 sm:px-8 py-3 border-b border-border bg-surface">
          <FilterBar
            filters={summary.filters}
            activeFilters={activeFilters}
            onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
            onClearFilters={() => setActiveFilters({})}
          />
        </div>
      )}

      <main className="px-4 sm:px-8 py-6">
        {loading && (
          <div className="min-h-[60vh] flex items-center justify-center gap-2 text-gray-600">
            <Loader2 size={18} className="spin text-primary" />
            Loading onboarding data...
          </div>
        )}

        {!loading && error && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="max-w-[420px] text-center px-6">
              <AlertCircle className="mx-auto mb-3 text-accent-red" size={32} />
              <p className="font-semibold text-title text-gray-900 mb-1">
                Couldn't load the dashboard
              </p>
              <p className="text-small text-gray-600 mb-4">{error}</p>
              <div className="flex justify-center">
                <FileUpload dataset={summary?.dataset} onUploaded={() => loadData(activeFilters)} />
              </div>
            </div>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="flex flex-col gap-5 max-w-[1500px] mx-auto">
            {summary.kpis.dataQualityIssues > 0 && (
              <div className="flex items-start gap-2 bg-gray-100 border-l-4 border-accent-red text-accent-red text-small px-4 py-3.5 rounded-button">
                <ShieldAlert size={18} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold m-0">
                    {summary.kpis.dataQualityIssues} value(s) excluded from averages as bad data
                  </p>
                  <p className="text-caption text-gray-600 mt-0.5 m-0">
                    {Object.entries(summary.dataQuality)
                      .map(([label, count]) => `${label}: ${count}`)
                      .join(' · ')}
                    {' — negative or implausibly large values, likely a parsing issue in the source CSV.'}
                  </p>
                </div>
              </div>
            )}

            <KpiCards kpis={summary.kpis} />

            <PipelineStepper stages={summary.stages} />

            <GraphSection stages={summary.stages} byGroup={summary.byGroup} />

            <div className="h-[420px]">
              <AnomalyWatchlist watchlist={summary.anomalyWatchlist} />
            </div>

            <CandidateTable rows={candidates ?? []} stageLabels={stageLabels} />
          </div>
        )}
      </main>
    </div>
  )
}