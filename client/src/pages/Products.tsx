import { useCallback, useEffect, useState } from 'react'
import { getCategories, getProducts } from '../api/products'
import type { Category, Product } from '../api/products'
import ProductCard from '../components/ProductCard'

const PRODUCTS_PER_PAGE = 12

const Products = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

  const loadCategories = useCallback(async () => {
    try {
      const result = await getCategories()
      setCategories(result)
      setCategoryError('')
    } catch {
      setCategoryError('Unable to load categories. Please refresh the page.')
    }
  }, [])

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const result = await getProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        category: selectedCategory || undefined,
      })

      setProducts(result.items)
      setTotalPages(Math.max(result.pagination.totalPages, 1))
    } catch (err) {
      setProducts([])
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load products. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }, [currentPage, selectedCategory])

  useEffect(() => {
    let cancelled = false

    void Promise.resolve().then(() => {
      if (!cancelled) {
        void loadCategories()
      }
    })

    return () => {
      cancelled = true
    }
  }, [loadCategories])

  useEffect(() => {
    let cancelled = false

    void Promise.resolve().then(() => {
      if (!cancelled) {
        void loadProducts()
      }
    })

    return () => {
      cancelled = true
    }
  }, [loadProducts])

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setCurrentPage(1)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-900">ShopSphere</h1>
          <p className="text-sm text-gray-600">Explore our products</p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Our Products
          </h2>
          <p className="text-gray-600">
            Browse our collection and find what you need.
          </p>
        </section>

        {categoryError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {categoryError}
            <button
              type="button"
              onClick={() => void loadCategories()}
              className="ml-3 font-semibold underline"
            >
              Retry categories
            </button>
          </div>
        )}
        <nav
          aria-label="Product categories"
          className="mb-8 flex flex-wrap gap-3"
        >
          <button
            type="button"
            onClick={() => handleCategoryChange('')}
            aria-pressed={!selectedCategory}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              !selectedCategory
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 hover:bg-indigo-50'
            }`}
          >
            All Products
          </button>

          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => handleCategoryChange(category._id)}
              aria-pressed={selectedCategory === category._id}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                selectedCategory === category._id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-indigo-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </nav>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => {
                void loadProducts()
                void loadCategories()
              }}
              className="ml-3 font-semibold underline"
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div
            role="status"
            className="py-16 text-center text-gray-600"
          >
            Loading products...
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl bg-white py-16 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800">
              No products found
            </h3>
            <p className="mt-2 text-gray-600">
              Try selecting another category.
            </p>
          </div>
        ) : (
          <>
            <section
              aria-label="Product list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </section>

        <nav
              aria-label="Product pagination"
              className="mt-10 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => setCurrentPage((page) => page - 1)}
                disabled={currentPage <= 1}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((page) => page + 1)}
                disabled={currentPage >= totalPages}
                className="rounded-lg border border-gray-300 bg-white px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </nav>
          </>
        )}
      </div>
    </main>
  )
}

export default Products
