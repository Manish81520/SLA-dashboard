import { useEffect, useMemo, useState, useCallback } from 'react'
import { Download, Loader2, AlertCircle, ShieldAlert, Activity } from 'lucide-react'
import { fetchSummary, fetchCandidates, exportUrl } from './api'

import PipelineStepper from './components/PipelineStepper'
import FilterBar from './components/FilterBar'
import FileUpload from './components/Fileupload'
import KpiCards from './components/KpiCards'
import GraphSection from './components/GraphSection'
import FocusAreas from './components/FocusAreas'
import AnomalyWatchlist from './components/Anomalywatchlist'
import CandidateTable from './components/CandidateTable'
import CandidateSearchBar from './components/CandidateSearchBar'
import CandidateDetail from './components/CandidateDetail'

export default function App() {
  const [summary, setSummary] = useState(null)
  const [candidates, setCandidates] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeFilters, setActiveFilters] = useState({})

  // 'dashboard' (filters + KPIs + table) or 'detail' (single candidate).
  const [view, setView] = useState('dashboard')
  const [selectedCandidate, setSelectedCandidate] = useState(null)

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

  // Resolves the current URL's ?candidate= param against the loaded rows so
  // deep links and the browser back/forward buttons both work.
  const applyCandidateFromUrl = useCallback((rows) => {
    const params = new URLSearchParams(window.location.search)
    const name = params.get('candidate')
    if (name && rows) {
      const match = rows.find((r) => r.Name === name)
      if (match) {
        setSelectedCandidate(match)
        setView('detail')
        return
      }
    }
    setSelectedCandidate(null)
    setView('dashboard')
  }, [])

  useEffect(() => {
    if (candidates) applyCandidateFromUrl(candidates)
  }, [candidates, applyCandidateFromUrl])

  useEffect(() => {
    const onPopState = () => applyCandidateFromUrl(candidates)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [candidates, applyCandidateFromUrl])

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate)
    setView('detail')
    const params = new URLSearchParams(window.location.search)
    params.set('candidate', candidate.Name)
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
  }

  const handleBackToSearch = () => {
    setSelectedCandidate(null)
    setView('dashboard')
    const params = new URLSearchParams(window.location.search)
    params.delete('candidate')
    const query = params.toString()
    window.history.pushState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`)
  }

  const stageLabels = useMemo(() => summary?.stages.map((s) => s.label) ?? [], [summary])
  const hasManyTeams = useMemo(() => (summary?.byGroup?.length ?? 0) > 6, [summary])

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
          <FileUpload
            dataset={summary?.dataset}
            onUploaded={() => {
              handleBackToSearch()
              loadData(activeFilters)
            }}
          />
          <a
            href={exportUrl}
            className="hidden sm:flex items-center gap-2 bg-primary text-white text-small font-medium px-4 py-2.5 rounded-button no-underline shadow-subtle hover:bg-primary-hover transition-colors"
          >
            <Download size={15} />
            Export
          </a>
        </div>
      </header>

      {/* Filter/search section is dashboard-only, per spec. */}
      {summary?.filters && view === 'dashboard' && (
        <div className="px-4 sm:px-8 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3 flex-wrap">
            <FilterBar
              filters={summary.filters}
              activeFilters={activeFilters}
              onFilterChange={(key, val) => setActiveFilters((prev) => ({ ...prev, [key]: val }))}
              onClearFilters={() => setActiveFilters({})}
            />
            <CandidateSearchBar candidates={candidates} onSelectCandidate={handleSelectCandidate} />
          </div>
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
            {view === 'detail' && selectedCandidate ? (
              <CandidateDetail
                candidate={selectedCandidate}
                stages={summary.stages}
                kpis={summary.kpis}
                onBack={handleBackToSearch}
              />
            ) : (
              <>
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

                <FocusAreas
                  focusAreas={summary.focusAreas}
                  candidates={candidates}
                  onSelectCandidate={handleSelectCandidate}
                />

                <div className={`grid grid-cols-1 gap-5 items-stretch ${hasManyTeams ? '' : 'xl:grid-cols-[2fr_1fr]'}`}>
                  <GraphSection stages={summary.stages} byGroup={summary.byGroup} />

                  <div className={hasManyTeams ? 'min-h-[420px]' : 'min-h-[420px] xl:h-full'}>
                    <AnomalyWatchlist
                      watchlist={summary.anomalyWatchlist}
                      stages={summary.stages}
                      candidates={candidates}
                      onSelectCandidate={handleSelectCandidate}
                    />
                  </div>
                </div>

                <CandidateTable
                  rows={candidates ?? []}
                  stageLabels={stageLabels}
                  onSelectCandidate={handleSelectCandidate}
                />
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}