import { useState, useRef, useEffect, useMemo } from 'react'
import { Search } from 'lucide-react'

function initials(name) {
    if (!name) return '?'
    return name.split(' ').filter(Boolean).slice(0, 2).map((n) => n[0]?.toUpperCase()).join('')
}

export default function CandidateSearchBar({ candidates, onSelectCandidate }) {
    const [query, setQuery] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)
    const containerRef = useRef(null)

    const matches = useMemo(() => {
        if (!query.trim() || !candidates) return []
        const q = query.trim().toLowerCase()
        return candidates.filter((c) => (c.Name ?? '').toLowerCase().includes(q)).slice(0, 8)
    }, [query, candidates])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const selectCandidate = (candidate) => {
        onSelectCandidate(candidate)
        setQuery('')
        setIsOpen(false)
        setActiveIndex(-1)
    }

    const handleKeyDown = (e) => {
        if (!isOpen || matches.length === 0) return
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex((i) => (i + 1) % matches.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex((i) => (i - 1 + matches.length) % matches.length)
        } else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeIndex >= 0) selectCandidate(matches[activeIndex])
            else if (matches.length === 1) selectCandidate(matches[0])
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    return (
        <div ref={containerRef} className="relative w-full sm:w-72 sm:ml-auto">
            <div className="flex items-center gap-2 bg-white border border-border-dark rounded-input px-3 py-2 focus-within:outline focus-within:outline-2 focus-within:outline-primary">
                <Search size={14} className="text-gray-500 shrink-0" />
                <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); setActiveIndex(-1) }}
                    onFocus={() => query && setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by person or candidate..."
                    aria-label="Search by person or candidate"
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-controls="candidate-search-listbox"
                    className="bg-transparent text-small outline-none w-full placeholder:text-gray-400 text-gray-900"
                />
            </div>

            {isOpen && query.trim() && (
                <div
                    id="candidate-search-listbox"
                    role="listbox"
                    className="absolute right-0 mt-1.5 w-full sm:w-80 bg-white border border-border rounded-input shadow-dropdown z-20 overflow-hidden max-h-80 overflow-y-auto"
                >
                    {matches.length === 0 ? (
                        <p className="text-caption text-gray-500 px-4 py-3 m-0">
                            No candidates match "{query}"
                        </p>
                    ) : (
                        matches.map((c, i) => (
                            <button
                                key={`${c.Name}-${i}`}
                                type="button"
                                role="option"
                                aria-selected={i === activeIndex}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => selectCandidate(c)}
                                onMouseEnter={() => setActiveIndex(i)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${i === activeIndex ? 'bg-primary/5' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-caption font-bold flex items-center justify-center shrink-0">
                                    {initials(c.Name)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-small font-medium text-gray-900 m-0 truncate">
                                        {c.Name || 'Unnamed'}
                                    </p>
                                    <p className="text-caption text-gray-500 m-0 truncate">
                                        {c['Project Details'] || 'Unspecified'}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}