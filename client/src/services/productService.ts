
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export interface ProductVariant {
  _id?: string;
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  stock?: number;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images?: (string | { url?: string; imageUrl?: string })[];
  category?: { name?: string } | string;
  variants?: ProductVariant[];
  relatedProducts?: Product[];
}

export interface ProductDetailResponse {
  product: Product;
  relatedProducts: Product[];
}

export async function getProductBySlug(
  slug: string,
): Promise<ProductDetailResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/products/${encodeURIComponent(slug)}`,
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Product not found.");
    }

    throw new Error("Unable to load product. Please try again.");
  }

  const result = await response.json();

  const data = result.data ?? result;

  const product: Product = data.product ?? data;

  if (!product || !product.name) {
    throw new Error("Invalid product response from server.");
  }

  return {
    product,
    relatedProducts:
      data.relatedProducts ?? product.relatedProducts ?? [],
  };
}
