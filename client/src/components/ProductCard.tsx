import type { Product } from '../api/products'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const imageUrl = product.images?.[0]

  return (
    <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-52 items-center justify-center bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-sm text-gray-500">No image available</span>
        )}
      </div>

      <div className="p-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          {product.category?.name || 'Uncategorized'}
        </p>

        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          {product.name}
        </h2>

        <p className="mb-4 line-clamp-2 min-h-10 text-sm text-gray-600">
          {product.description}
        </p>

        <p className="text-xl font-bold text-gray-900">
          &#8377;{product.price.toLocaleString('en-IN')}
        </p>
      </div>
    </article>
  )
}

export default ProductCard
