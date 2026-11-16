import { apiRequest } from '../services/api'

export interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  isActive: boolean
}

export interface ProductCategory {
  _id: string
  name: string
  slug: string
}

export interface Product {
  _id: string
  name: string
  description: string
  price: number
  stock: number
  images: string[]
  category: ProductCategory
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

interface ApiResponse<T> {
  status: string
  data: T
}

interface PaginatedData<T> {
  items: T[]
  pagination: Pagination
}

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
}

export const getProducts = async (
  filters: ProductFilters = {},
): Promise<PaginatedData<Product>> => {
  const params = new URLSearchParams()

  params.set('page', String(filters.page ?? 1))
  params.set('limit', String(filters.limit ?? 12))

  if (filters.category) {
    params.set('category', filters.category)
  }

  const response = await apiRequest<ApiResponse<PaginatedData<Product>>>(
    `/api/products?${params.toString()}`,
  )

  return response.data
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await apiRequest<ApiResponse<PaginatedData<Category>>>(
    '/api/categories?limit=100',
  )

  return response.data.items.filter((category) => category.isActive)
}
