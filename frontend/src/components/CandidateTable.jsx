import { useState } from 'react'
import { Search, ChevronDown } from 'lucide-react'
import { theme } from '../theme'

const DISPLAY_COLUMNS = [
  'Name',
  'Project Details',
  'Location',
  'Status',
  'BGV Status',
  'CGI/External',
]

export default function CandidateTable({ rows, stageLabels, onSelectCandidate }) {
  const [query, setQuery] = useState('')
  const [expanded, setExpanded] = useState(false)

  if (!rows) return null

  const filtered = rows.filter((row) => {
    if (!query) return true
    const haystack = `${row.Name ?? ''} ${row['Project Details'] ?? ''} ${row.Location ?? ''}`.toLowerCase()
    return haystack.includes(query.toLowerCase())
  })

  return (
    <div className="bg-surface border border-border rounded-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gray-50">
        <p className="text-caption uppercase tracking-wider text-gray-700 font-semibold">
          Candidate Detail ({filtered.length})
        </p>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-input px-3 py-1.5 w-64">
            <Search size={14} className="text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or project..."
              className="bg-transparent text-small outline-none w-full placeholder:text-gray-400 text-gray-900"
            />
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Hide candidate list' : 'Show candidate list'}
            className="flex items-center justify-center w-8 h-8 shrink-0 bg-white border border-gray-300 rounded-input text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <ChevronDown
              size={15}
              className={`transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-small">
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                {DISPLAY_COLUMNS.map((col) => (
                  <th
                    key={col}
                    className="text-left px-4 py-3 text-caption uppercase tracking-wider text-gray-700 font-semibold whitespace-nowrap border-b border-gray-300"
                  >
                    {col}
                  </th>
                ))}
                {stageLabels.map((label) => (
                  <th
                    key={label}
                    className="text-right px-3 py-3 text-caption uppercase tracking-wider text-gray-700 font-semibold whitespace-nowrap border-b border-gray-300"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => onSelectCandidate?.(row)}
                  className={`group border-t border-border transition-colors ${onSelectCandidate ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  {DISPLAY_COLUMNS.map((col) => (
                    <td
                      key={col}
                      className={`px-4 py-3 whitespace-nowrap text-gray-900 ${col === 'Name' && onSelectCandidate ? 'group-hover:text-primary group-hover:underline' : ''}`}
                    >
                      {row[col] ?? '—'}
                    </td>
                  ))}
                  {stageLabels.map((label) => {
                    const isAnomaly = row._anomalies?.[label]
                    const value = row._stageValues?.[label]
                    return (
                      <td
                        key={label}
                        className={`px-3 py-3 text-right whitespace-nowrap ${isAnomaly === true
                          ? 'bg-gray-100 text-error font-semibold'
                          : isAnomaly === false
                            ? 'text-success'
                            : 'text-gray-500'
                          }`}
                      >
                        {value ?? '—'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}