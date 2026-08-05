import { Activity, Filter, X } from 'lucide-react'

function FilterGroup({ label, options, selected, onChange }) {
  return (
    <div className="mb-6">
      <p className="text-caption uppercase tracking-wider text-gray-400 font-semibold mb-2">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {options.map((opt) => {
          const active = selected === opt
          return (
            <button
              key={opt}
              onClick={() => onChange(active ? null : opt)}
              className={`text-left text-small px-3 py-1.5 rounded-button transition-colors ${active
                ? 'bg-primary-light text-white font-medium'
                : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Sidebar({ filters, activeFilters, onFilterChange, onClearFilters, isOpen, onClose }) {
  const hasActiveFilters = Object.values(activeFilters).some(Boolean)

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`w-64 shrink-0 bg-primary text-white flex flex-col px-5 py-6 shadow-dropdown fixed lg:static inset-y-0 left-0 z-50 h-full lg:min-h-screen overflow-y-auto transform transition-transform duration-200 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-button bg-primary-light flex items-center justify-center">
              <Activity size={18} strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-lg">Pipeline</span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-300 hover:text-white"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>
        <p className="text-caption text-gray-400 mb-8 pl-11">Onboarding SLA Monitor</p>

        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Filter size={13} />
            <span className="text-caption uppercase tracking-wider font-semibold">Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-caption text-accent-red hover:underline"
            >
              <X size={11} /> Clear
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1 -mr-2 pr-2">
          {Object.entries(filters).map(([key, options]) => (
            <FilterGroup
              key={key}
              label={key}
              options={options}
              selected={activeFilters[key]}
              onChange={(val) => onFilterChange(key, val)}
            />
          ))}
        </div>

        <div className="pt-4 mt-auto border-t border-white/10 text-caption text-gray-400">
          Thresholds are configured targets, not contractual SLAs.
        </div>
      </aside>
    </>
  )
}