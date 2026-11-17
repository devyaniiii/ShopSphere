import { useEffect, useState } from 'react'

type SearchBarProps = {
  value: string
  onSearch: (value: string | undefined) => void
}

const SearchBar = ({ value, onSearch }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = inputValue.trim()
      if (trimmed !== value) {
        onSearch(trimmed || undefined)
      }
    }, 400)

    return () => window.clearTimeout(timer)
  }, [inputValue, onSearch, value])

  return (
    <label className="block w-full">
      <span className="sr-only">Search products</span>

      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
        <svg
          aria-hidden="true"
          className="h-5 w-5 text-slate-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>

        <input
          type="search"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Search products by name or description..."
          maxLength={100}
          className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />

        {inputValue && (
          <button
            type="button"
            onClick={() => setInputValue('')}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900"
          >
            Clear
          </button>
        )}
      </div>
    </label>
  )
}

export default SearchBar
