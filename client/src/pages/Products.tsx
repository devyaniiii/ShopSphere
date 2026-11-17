import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import FilterPanel from '../components/FilterPanel'
import SearchBar from '../components/SearchBar'
import { useProductQuery } from '../hooks/useProductQuery'
import { apiRequest } from '../services/api'

type Category = {
  _id: string
  name: string
  slug: string
  isActive: boolean
}

type Product = {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  category: Category | string
}

type Pagination = {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

type ListResponse<T> = {
  status: string
  data: {
    items: T[]
    pagination: Pagination
  }
}

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value)

const Products = () => {
  const { query, queryString, updateQuery, clearFilters } =
    useProductQuery()

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const handleSearch = useCallback(
    (value: string | undefined) => {
      updateQuery({ q: value })
    },
    [updateQuery],
  )

  useEffect(() => {
    const controller = new AbortController()

    const loadProducts = async () => {
      setLoading(true)
      setError('')

      try {
        const params = new URLSearchParams(queryString)

        if (!params.has('limit')) {
          params.set('limit', '12')
        }

        const response = await apiRequest<ListResponse<Product>>(
          `/api/products?${params.toString()}`,
          { signal: controller.signal },
        )

        setProducts(response.data.items)
        setPagination(response.data.pagination)
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load products.',
          )
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadProducts()

    return () => controller.abort()
  }, [queryString])

  useEffect(() => {
    const controller = new AbortController()

    const loadCategories = async () => {
      try {
        const response = await apiRequest<ListResponse<Category>>(
          '/api/categories?limit=100&sort=name',
          { signal: controller.signal },
        )

        setCategories(
          response.data.items.filter((item) => item.isActive !== false),
        )
      } catch (err) {
        if (!controller.signal.aborted) {
          setCategoryError(
            err instanceof Error
              ? err.message
              : 'Unable to load categories.',
          )
        }
      }
    }

    void loadCategories()

    return () => controller.abort()
  }, [])

  const page = pagination?.page ?? Number(query.page || 1)
  const pages = pagination?.totalPages ?? 1

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/products"
            className="text-2xl font-black tracking-tight text-indigo-700"
          >
            ShopSphere<span className="text-slate-900">.</span>
          </Link>

          <nav className="flex items-center gap-4 text-sm font-semibold">
            <Link
              to="/login"
              className="text-slate-600 hover:text-indigo-700"
            >
              Sign in
            </Link>

            <Link
              to="/register"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-700 to-violet-600 px-6 py-8 text-white sm:px-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-100">
            Discover something great
          </p>

          <h1 className="text-3xl font-black sm:text-4xl">
            Find your next favourite product.
          </h1>

          <p className="mt-3 max-w-2xl text-sm text-indigo-100 sm:text-base">
            Search the catalogue and narrow your results with filters that stay
            in your URL.
          </p>
        </section>

        <div className="mb-6">
          <SearchBar key={query.q || 'empty'} value={query.q || ''} onSearch={handleSearch} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside>
            <FilterPanel
              categories={categories}
              query={query}
              onUpdate={updateQuery}
              onClear={clearFilters}
            />

            {categoryError && (
              <p className="mt-2 text-xs text-amber-700">
                {categoryError}
              </p>
            )}
          </aside>

          <section aria-live="polite">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold">Products</h2>

                <p className="mt-1 text-sm text-slate-500">
                  {pagination
                    ? `${pagination.totalItems} product(s) found`
                    : 'Browse our catalogue'}
                </p>
              </div>

              {query.q && (
                <p className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                  Search: “{query.q}”
                </p>
              )}
            </div>

            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Loading products...
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
                <p className="font-semibold text-red-700">
                  Could not load products
                </p>

                <p className="mt-2 text-sm text-slate-600">{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Try again
                </button>
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
                <p className="text-lg font-bold">No products found</p>

                <p className="mt-2 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 text-sm font-semibold text-indigo-600"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((product) => {
                    const categoryName =
                      typeof product.category === 'object' &&
                      product.category
                        ? product.category.name
                        : 'Product'

                    const imageUrl = product.images?.[0]

                    return (
                      <article
                        key={product._id}
                        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="flex h-48 items-center justify-center bg-slate-100">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-5xl" aria-hidden="true">
                              🛍️
                            </span>
                          )}
                        </div>

                        <div className="p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                            {categoryName}
                          </p>

                          <h3 className="mt-2 truncate text-base font-bold">
                            {product.name}
                          </h3>

                          <p className="mt-2 h-10 overflow-hidden text-sm leading-5 text-slate-500">
                            {product.description}
                          </p>

                          <div className="mt-4 flex items-center justify-between gap-3">
                            <span className="text-lg font-black">
                              {money(product.price)}
                            </span>

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                product.stock > 0
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {product.stock > 0
                                ? 'In stock'
                                : 'Out of stock'}
                            </span>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>

                {pagination && pages > 1 && (
                  <div className="mt-7 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() =>
                        updateQuery({ page: String(page - 1) })
                      }
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      Previous
                    </button>

                    <span className="text-sm text-slate-600">
                      Page {page} of {pages}
                    </span>

                    <button
                      type="button"
                      disabled={page >= pages}
                      onClick={() =>
                        updateQuery({ page: String(page + 1) })
                      }
                      className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}

export default Products

