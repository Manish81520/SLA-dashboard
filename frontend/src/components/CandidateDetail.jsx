import {
    ArrowLeft, MapPin, Tag, ShieldCheck, Layers,
    CheckCircle2, Clock, AlertTriangle, TrendingUp, TrendingDown, Info,
} from 'lucide-react'
import CandidateStageTrendChart from './CandidateStageTrendChart'

// Short x-axis labels for the trend chart only — the full labels (from
// STAGE_CONFIG on the backend) are still used everywhere else on this page.
const STAGE_SHORT_LABELS = {
    'Resource Fulfilment': 'Res.',
    'BGV Completion': 'BGV',
    'FINRA Initiation Gap': 'FINRA Init.',
    'FINRA Start to Courier End': 'FINRA End',
    'Onboarding Docs Submission': 'Docs Sub.',
    'Magnit Documentation': 'Magnit',
    'Docs Submission to PID': 'PID',
    'MAC Setup': 'MAC Setup',
}

function initials(name) {
    if (!name) return '?'
    return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')
}

function round1(n) {
    return Math.round(n)
}

function formatStageDeviationLabel(deviation) {
    const rounded = Math.round(deviation)
    if (rounded === 0) {
        return { label: 'On Track', tone: 'neutral' }
    }
    if (rounded > 0) {
        return { label: `Ahead by ${rounded}d`, tone: 'ahead' }
    }
    return { label: `Behind by ${Math.abs(rounded)}d`, tone: 'behind' }
}

function MetaPill({ icon: Icon, label }) {
    return (
        <span className="flex items-center gap-1.5 text-caption text-gray-600">
            <Icon size={13} className="text-gray-400" />
            {label}
        </span>
    )
}

function StatusBanner({ isCompleted, completionDate, totalDays, status }) {
    if (isCompleted) {
        return (
            <div className="flex items-start gap-3 bg-success/10 border border-success/20 rounded-card px-5 py-4 min-w-[260px]">
                <CheckCircle2 size={20} className="text-success mt-0.5 shrink-0" />
                <div>
                    <p className="text-small font-semibold text-success m-0">Successfully Onboarded</p>
                    <p className="text-caption text-gray-600 mt-1 m-0">Onboarded on {completionDate}</p>
                    {totalDays != null && (
                        <p className="text-caption text-gray-600 m-0">Total Onboarding Days: {totalDays} days</p>
                    )}
                </div>
            </div>
        )
    }
    return (
        <div className="flex items-start gap-3 bg-primary-light/10 border border-primary-light/20 rounded-card px-5 py-4 min-w-[260px]">
            <Clock size={20} className="text-primary mt-0.5 shrink-0" />
            <div>
                <p className="text-small font-semibold text-primary m-0">Onboarding In Progress</p>
                <p className="text-caption text-gray-600 mt-1 m-0">Current status: {status ?? 'Unspecified'}</p>
            </div>
        </div>
    )
}

function CandidateStageProgress({ stageRows }) {
    return (
        <div className="bg-surface border border-border rounded-card shadow-card px-6 py-6 overflow-x-auto">
            <p className="text-title font-bold text-gray-900 m-0">Onboarding Progress</p>
            <p className="text-caption text-gray-500 mt-1 mb-5">
                This candidate's pace at each stage, benchmarked against the global average.
            </p>
            <div className="flex items-start min-w-[900px]">
                {stageRows.map((s, i) => {
                    const isLast = i === stageRows.length - 1
                    const hasValue = s.value != null
                    const isAnomaly = s.isAnomaly === true
                    const dotColor = !hasValue ? 'bg-gray-300' : isAnomaly ? 'bg-accent-red' : 'bg-success'
                    return (
                        <div key={s.label} className="flex items-start flex-1">
                            <div className="flex flex-col items-center flex-1 relative">
                                <div className={`w-3.5 h-3.5 rounded-full ${dotColor} ring-4 ring-white shadow-sm z-10`} />
                                <p className="text-2xl font-bold mt-3 text-gray-900">{s.value ?? '—'}</p>
                                <p className="text-[10px] text-gray-500 mb-1">days</p>
                                <p className="text-caption text-center text-gray-700 font-medium leading-tight px-1 max-w-[110px]">
                                    {s.label}
                                </p>
                                {s.deviation != null && (() => {
                                    const { label, tone } = formatStageDeviationLabel(s.deviation)
                                    const toneClass =
                                        tone === 'ahead'
                                            ? 'bg-success/10 text-success'
                                            : tone === 'behind'
                                                ? 'bg-gray-100 text-accent-red'
                                                : 'bg-gray-100 text-gray-600'
                                    return (
                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-small mt-1 ${toneClass}`}>
                                            {label}
                                        </span>
                                    )
                                })()}
                            </div>
                            {/* Connector always renders (invisible on the last stage) so every
                                stage's content box stays the same width — same fix as PipelineStepper. */}
                            <div className={`h-4 flex items-center flex-1 -mx-1 mt-2 ${isLast ? 'invisible' : ''}`} aria-hidden="true">
                                <div className="h-[2px] w-full bg-border" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function MetricRow({ icon: Icon, label, value, tone = 'default' }) {
    const toneColors = { default: 'text-gray-900', success: 'text-success', breach: 'text-accent-red' }
    return (
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
            <span className="flex items-center gap-2 text-small text-gray-600">
                <Icon size={15} className="text-gray-400" />
                {label}
            </span>
            <span className={`text-small font-bold ${toneColors[tone]}`}>{value}</span>
        </div>
    )
}

function KeyMetrics({ totalDays, avgDays, deviation, anomalyCount }) {
    return (
        <div className="bg-surface border border-border rounded-card shadow-card p-6 flex flex-col gap-4">
            <p className="text-title font-bold text-gray-900 m-0">Key Metrics Summary</p>
            <MetricRow icon={Clock} label="Total Onboarding Days" value={totalDays != null ? `${totalDays} days` : '—'} />
            <MetricRow icon={Layers} label="Team Average" value={avgDays != null ? `${avgDays} days` : '—'} />
            <MetricRow
                icon={deviation != null && deviation < 0 ? TrendingDown : TrendingUp}
                label="Deviation from Average"
                value={deviation != null ? `${deviation >= 0 ? '+' : ''}${deviation} days` : '—'}
                tone={deviation != null ? (deviation >= 0 ? 'success' : 'breach') : 'default'}
            />
            <MetricRow
                icon={AlertTriangle}
                label="Flagged Stages"
                value={anomalyCount}
                tone={anomalyCount > 0 ? 'breach' : 'success'}
            />
        </div>
    )
}

export default function CandidateDetail({ candidate, stages, kpis, onBack }) {
    if (!candidate) return null

    const name = candidate.Name || 'Unknown Candidate'
    const team = candidate['Project Details'] || 'Unspecified'
    const location = candidate.Location
    const status = candidate.Status
    const bgvStatus = candidate['BGV Status']
    const cgiExternal = candidate['CGI/External']
    const totalDays = candidate['Complete Onboarding'] ?? null
    const completionDateRaw = candidate['Onboarding Completion Date']
    const isCompleted = completionDateRaw != null && completionDateRaw !== ''
    const avgTotalDays = kpis?.avgTotalOnboardingDays ?? null
    const totalDeviation =
        totalDays != null && avgTotalDays != null ? round1(avgTotalDays - totalDays) : null

    const stageRows = (stages ?? []).map((stage) => {
        const value = candidate._stageValues?.[stage.label] ?? null
        const isAnomaly = candidate._anomalies?.[stage.label] ?? null
        const deviation =
            value != null && stage.average != null ? round1(stage.average - value) : null
        return {
            label: stage.label,
            shortLabel: STAGE_SHORT_LABELS[stage.label] ?? stage.label,
            value,
            average: stage.average,
            isAnomaly,
            deviation,
        }
    })

    const anomalyCount = stageRows.filter((s) => s.isAnomaly === true).length

    const summaryMessage =
        anomalyCount > 0
            ? `This candidate has ${anomalyCount} stage${anomalyCount > 1 ? 's' : ''} flagged as anomalies against the team average.`
            : totalDeviation != null && totalDeviation >= 0
                ? "This candidate has completed all tracked stages ahead of the team average."
                : "This candidate's onboarding metrics are in line with the team average."

    return (
        <div className="flex flex-col gap-5">
            <button
                type="button"
                onClick={onBack}
                className="flex items-center gap-1.5 text-small font-medium text-primary hover:underline self-start"
            >
                <ArrowLeft size={15} /> Back to all candidates
            </button>

            <div className="bg-surface border border-border rounded-card shadow-card px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-full bg-primary/10 text-primary text-title font-bold flex items-center justify-center shrink-0">
                        {initials(name)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-title font-bold text-gray-900 m-0 truncate">{name}</p>
                        <p className="text-small text-gray-500 mt-0.5 mb-2 truncate">{team}</p>
                        <div className="flex items-center gap-4 flex-wrap">
                            {location && <MetaPill icon={MapPin} label={location} />}
                            {status && <MetaPill icon={Tag} label={status} />}
                            {bgvStatus && <MetaPill icon={ShieldCheck} label={`BGV Status: ${bgvStatus}`} />}
                            {cgiExternal && <MetaPill icon={Layers} label={`CGI/External: ${cgiExternal}`} />}
                        </div>
                    </div>
                </div>

                <StatusBanner
                    isCompleted={isCompleted}
                    completionDate={completionDateRaw}
                    totalDays={totalDays}
                    status={status}
                />
            </div>

            <CandidateStageProgress stageRows={stageRows} />

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-5 items-start">
                <div className="bg-surface border border-border rounded-card shadow-card p-6">
                    <p className="text-title font-bold text-gray-900 m-0 mb-1">Stage Performance vs Average</p>
                    <p className="text-caption text-gray-500 mb-4">
                        Days per stage, this candidate vs the global average.
                    </p>
                    <CandidateStageTrendChart stageRows={stageRows} />
                </div>

                <KeyMetrics
                    totalDays={totalDays}
                    avgDays={avgTotalDays}
                    deviation={totalDeviation}
                    anomalyCount={anomalyCount}
                />
            </div>

            <div className="flex items-start gap-2 bg-gray-100 border-l-4 border-primary-light text-gray-700 text-small px-4 py-3.5 rounded-button">
                <Info size={18} className="text-primary mt-0.5 shrink-0" />
                <p className="m-0">{summaryMessage}</p>
            </div>
        </div>
    )
}