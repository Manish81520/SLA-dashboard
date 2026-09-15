import { useEffect, useState } from 'react'
import {
    BookOpen, X, ChevronDown, Workflow, FileText,
    ClipboardList, CheckCircle2, BarChart3, AlertTriangle, Layers,
} from 'lucide-react'
import { PIPELINE_GLOSSARY, COMMON_TERMS } from '../glossary'

// Mirrors PipelineStepper's per-group icon order for visual consistency.
// PipelineStepper.jsx is locked, so this can't be imported/shared directly.
const GROUP_ICONS = [FileText, ClipboardList, CheckCircle2]

const METRIC_HELP = [
    { icon: BarChart3, label: 'Avg days', text: 'Average number of calendar days taken in this stage across all partners.' },
    { icon: AlertTriangle, label: 'Anomalies', text: 'Partners whose time in this stage is more than 1 standard deviation above the stage average.' },
    { icon: Layers, label: 'Sub-stage', text: 'A smaller step within this stage. Each sub-stage tracks its own average days and anomalies.' },
]

function StageAccordion({ stageGroups }) {
    const [expandedGroup, setExpandedGroup] = useState(stageGroups?.[0]?.name ?? null)

    return (
        <div className="flex flex-col gap-3">
            {stageGroups.map((group, i) => {
                const meta = PIPELINE_GLOSSARY[group.name]
                const isOpen = expandedGroup === group.name
                const Icon = GROUP_ICONS[i % GROUP_ICONS.length]

                return (
                    <div key={group.name} className="border border-border rounded-card overflow-hidden">
                        <button
                            type="button"
                            onClick={() => setExpandedGroup(isOpen ? null : group.name)}
                            aria-expanded={isOpen}
                            className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-caption font-bold shrink-0">
                                {i + 1}
                            </span>
                            <span className="flex-1 text-small font-semibold text-gray-900 truncate">
                                {group.name}
                            </span>
                            <ChevronDown
                                size={15}
                                className={`text-gray-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {isOpen && (
                            <div className="px-4 py-4 flex flex-col gap-4 bg-surface">
                                {meta?.definition && (
                                    <div className="flex gap-2.5">
                                        <Icon size={16} className="text-primary mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-caption font-semibold text-gray-900 m-0 mb-1">Definition</p>
                                            <p className="text-small text-gray-700 m-0 leading-relaxed">{meta.definition}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2.5 pt-1 border-t border-border">
                                    <p className="text-caption font-semibold text-gray-900 m-0 pt-3">Metrics in this stage</p>
                                    {METRIC_HELP.map((m) => (
                                        <div key={m.label} className="flex gap-2.5">
                                            <m.icon size={14} className="text-gray-400 mt-0.5 shrink-0" />
                                            <p className="text-caption text-gray-600 m-0">
                                                <span className="font-medium text-gray-800">{m.label}: </span>
                                                {m.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col gap-2 pt-3 border-t border-border">
                                    {group.subStages.map((s) => (
                                        <div key={s.label} className="flex flex-col gap-0.5">
                                            <p className="text-small font-medium text-gray-900 m-0">{s.label}</p>
                                            <p className="text-caption text-gray-600 m-0">
                                                {meta?.subStages?.[s.label] ?? 'No additional definition available for this sub-stage yet.'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {meta?.example && (
                                    <div className="flex gap-2.5 bg-primary-light/10 border border-primary-light/20 rounded-button px-4 py-3">
                                        <BookOpen size={15} className="text-primary mt-0.5 shrink-0" />
                                        <p className="text-caption text-gray-700 m-0">
                                            <span className="font-semibold text-primary">Example: </span>
                                            {meta.example}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}

function CommonTermsList() {
    return (
        <div className="flex flex-col">
            {COMMON_TERMS.map((t, i) => (
                <div key={t.term} className={`py-3.5 ${i > 0 ? 'border-t border-border' : ''}`}>
                    <p className="text-small font-semibold text-gray-900 m-0 mb-1">{t.term}</p>
                    <p className="text-caption text-gray-600 m-0 leading-relaxed">{t.definition}</p>
                </div>
            ))}
        </div>
    )
}

export default function GlossaryDrawer({ isOpen, onClose, stageGroups }) {
    const [activeTab, setActiveTab] = useState('stages')

    useEffect(() => {
        if (!isOpen) return
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [isOpen, onClose])

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
            )}

            <aside
                role="dialog"
                aria-modal="true"
                aria-label="Onboarding metric definitions"
                className={`fixed top-0 right-0 h-full w-full sm:w-[440px] bg-surface shadow-dropdown z-50 flex flex-col transform transition-transform duration-200 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-start justify-between gap-3 px-6 py-5 border-b border-border">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-button bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen size={18} className="text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-title font-bold text-gray-900 m-0 leading-tight">Metric Definitions</p>
                            <p className="text-caption text-gray-500 m-0 mt-0.5">
                                Understand what each metric and term means in the onboarding pipeline.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close definitions panel"
                        className="text-gray-400 hover:text-gray-700 shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex gap-2 px-6 py-4 border-b border-border">
                    <button
                        type="button"
                        onClick={() => setActiveTab('stages')}
                        className={`flex-1 flex items-center justify-center gap-2 text-caption font-semibold px-3 py-2.5 rounded-button border transition-colors ${activeTab === 'stages' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border-dark text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Workflow size={14} /> Pipeline Stages
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('terms')}
                        className={`flex-1 flex items-center justify-center gap-2 text-caption font-semibold px-3 py-2.5 rounded-button border transition-colors ${activeTab === 'terms' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-border-dark text-gray-600 hover:bg-gray-50'}`}
                    >
                        <FileText size={14} /> Common Terms
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
                    {activeTab === 'stages' ? (
                        stageGroups && stageGroups.length > 0 ? (
                            <StageAccordion stageGroups={stageGroups} />
                        ) : (
                            <p className="text-small text-gray-500">No pipeline data loaded yet.</p>
                        )
                    ) : (
                        <CommonTermsList />
                    )}
                </div>
            </aside>
        </>
    )
}