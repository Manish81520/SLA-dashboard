import { Users, TrendingDown, TrendingUp, Clock, ShieldAlert } from 'lucide-react'

function Card({ icon: Icon, label, value, tone = 'default' }) {
  const toneColors = {
    default: 'text-primary',
    breach: 'text-accent-red',
    ontrack: 'text-success',
  }
  return (
    <div className="bg-surface border border-border rounded-card shadow-card px-6 py-4 flex-1 min-w-[180px] transition-shadow hover:shadow-card-hover">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <Icon size={16} className="text-primary-light" />
        <span className="text-caption uppercase tracking-wider font-semibold">{label}</span>
      </div>
      <p className={`text-3xl font-bold ${toneColors[tone]}`}>{value}</p>
    </div>
  )
}

export default function KpiCards({ kpis }) {
  if (!kpis) return null
  return (
    <div className="flex gap-4 flex-wrap">
      <Card icon={Users} label="Partners Onboarded" value={kpis.totalCandidates} />
      <Card icon={TrendingDown} label="Min Days for Onboarding" value={kpis.minTotalOnboardingDays ?? '—'} />
      <Card icon={TrendingUp} label="Max Days for Onboarding" value={kpis.maxTotalOnboardingDays ?? '—'} />
      <Card icon={Clock} label="Avg. Total Onboarding Days" value={kpis.avgTotalOnboardingDays ?? '—'} />
      {kpis.dataQualityIssues > 0 && (
        <Card
          icon={ShieldAlert}
          label="Rows Excluded (Bad Data)"
          value={kpis.dataQualityIssues}
          tone="breach"
        />
      )}
    </div>
  )
}
