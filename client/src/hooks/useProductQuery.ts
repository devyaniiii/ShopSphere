import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type ProductSort =
  | 'newest'
  | 'oldest'
  | 'price_asc'
  | 'price_desc'
  | 'name_asc'
  | 'name_desc'
  | 'stock_asc'
  | 'stock_desc'

export type ProductQuery = {
  q?: string
  category?: string
  minPrice?: string
  maxPrice?: string
  inStock?: 'true' | 'false'
  sort?: ProductSort
  page?: string
}

export const useProductQuery = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryString = searchParams.toString()

  const query = useMemo<ProductQuery>(() => {
    const params = new URLSearchParams(queryString)
    const stock = params.get('inStock')

    return {
      q: params.get('q') || undefined,
      category: params.get('category') || undefined,
      minPrice: params.get('minPrice') || undefined,
      maxPrice: params.get('maxPrice') || undefined,
      inStock:
        stock === 'true' || stock === 'false' ? stock : undefined,
      sort: (params.get('sort') as ProductSort) || 'newest',
      page: params.get('page') || '1',
    }
  }, [queryString])

  const updateQuery = useCallback(
    (updates: Partial<ProductQuery>) => {
      const next = new URLSearchParams(searchParams)
      let changed = false

      Object.entries(updates).forEach(([key, value]) => {
        const nextValue =
          value === undefined || value === '' ? null : String(value)

        if (nextValue === null) {
          if (next.has(key)) {
            next.delete(key)
            changed = true
          }
        } else if (next.get(key) !== nextValue) {
          next.set(key, nextValue)
          changed = true
        }
      })

      if (!Object.prototype.hasOwnProperty.call(updates, 'page') && next.has('page')) {
        next.delete('page')
        changed = true
      }

      if (changed) {
        setSearchParams(next)
      }
    },
    [searchParams, setSearchParams],
  )

  const clearFilters = useCallback(() => {
    const next = new URLSearchParams()
    const search = searchParams.get('q')

    if (search) {
      next.set('q', search)
    }

    setSearchParams(next)
  }, [searchParams, setSearchParams])

  return { query, queryString, updateQuery, clearFilters }
}
