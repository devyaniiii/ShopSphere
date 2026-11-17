import { useState } from 'react'
import type { ProductQuery, ProductSort } from '../hooks/useProductQuery'

type Category = {
  _id: string
  name: string
  isActive: boolean
}

type Props = {
  categories: Category[]
  query: ProductQuery
  onUpdate: (updates: Partial<ProductQuery>) => void
  onClear: () => void
}

const FilterPanel = ({ categories, query, onUpdate, onClear }: Props) => {
  const [minPrice, setMinPrice] = useState(query.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(query.maxPrice || '')

  const invalidRange =
    minPrice !== '' &&
    maxPrice !== '' &&
    Number(minPrice) > Number(maxPrice)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-bold text-slate-900">Filters</h2>

        <button
          type="button"
          onClick={onClear}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label
            htmlFor="category-filter"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Category
          </label>

          <select
            id="category-filter"
            value={query.category || ''}
            onChange={(event) =>
              onUpdate({ category: event.target.value || undefined })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All categories</option>

            {categories
              .filter((item) => item.isActive !== false)
              .map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-slate-700">
            Price range (₹)
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <input
              aria-label="Minimum price"
              type="number"
              min="0"
              step="0.01"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              placeholder="Min"
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />

            <input
              aria-label="Maximum price"
              type="number"
              min="0"
              step="0.01"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              placeholder="Max"
              className="min-w-0 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          {invalidRange && (
            <p className="mt-2 text-xs text-red-600">
              Maximum price must be at least the minimum price.
            </p>
          )}

          <button
            type="button"
            disabled={invalidRange}
            onClick={() =>
              onUpdate({
                minPrice: minPrice || undefined,
                maxPrice: maxPrice || undefined,
              })
            }
            className="mt-2 w-full rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
          >
            Apply price
          </button>
        </div>

        <div>
          <label
            htmlFor="stock-filter"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Availability
          </label>

          <select
            id="stock-filter"
            value={query.inStock || ''}
            onChange={(event) =>
              onUpdate({
                inStock:
                  (event.target.value || undefined) as ProductQuery['inStock'],
              })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="">All products</option>
            <option value="true">In stock</option>
            <option value="false">Out of stock</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="sort-filter"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Sort by
          </label>

          <select
            id="sort-filter"
            value={query.sort || 'newest'}
            onChange={(event) =>
              onUpdate({ sort: event.target.value as ProductSort })
            }
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="stock_asc">Stock: low to high</option>
            <option value="stock_desc">Stock: high to low</option>
          </select>
        </div>
      </div>
    </section>
  )
}

export default FilterPanel
