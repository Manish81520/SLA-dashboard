import { ChevronDown, X } from 'lucide-react'

export default function FilterBar({ filters, activeFilters, onFilterChange, onClearFilters }) {
    const hasActiveFilters = Object.values(activeFilters).some(Boolean)

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {Object.entries(filters).map(([key, options]) => {
                const selected = activeFilters[key]
                return (
                    <div key={key} className="relative">
                        <select
                            value={selected ?? ''}
                            onChange={(e) => onFilterChange(key, e.target.value || null)}
                            className={`appearance-none text-small rounded-input pl-3 pr-8 py-2 font-medium cursor-pointer border transition-colors ${selected
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-gray-900 border-border-dark'
                                }`}
                        >
                            <option value="">{key}: All</option>
                            {options.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <ChevronDown
                            size={14}
                            className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${selected ? 'text-white' : 'text-gray-600'
                                }`}
                        />
                    </div>
                )
            })}
            {hasActiveFilters && (
                <button
                    onClick={onClearFilters}
                    className="flex items-center gap-1 text-caption font-medium text-accent-red hover:underline px-2 py-2"
                >
                    <X size={12} /> Clear filters
                </button>
            )}
        </div>
    )
}