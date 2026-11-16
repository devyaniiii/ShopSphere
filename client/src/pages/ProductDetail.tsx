
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getProductBySlug,
  type Product,
  type ProductVariant,
} from "../services/productService";
import "./ProductDetail.css";

function getImageUrl(
  image: string | { url?: string; imageUrl?: string },
): string {
  if (typeof image === "string") return image;
  return image.url ?? image.imageUrl ?? "";
}

function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      if (!slug) {
        setError("Product slug is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getProductBySlug(slug);

        setProduct(result.product);
        setRelatedProducts(result.relatedProducts);

        const firstVariant = result.product.variants?.[0];

        setSelectedSize(firstVariant?.size ?? "");
        setSelectedColor(firstVariant?.color ?? "");

        const firstImage = result.product.images?.[0];

        setSelectedImage(firstImage ? getImageUrl(firstImage) : "");
      } catch (err) {
        setProduct(null);
        setError(
          err instanceof Error ? err.message : "Something went wrong.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug]);

  if (loading) {
    return <div className="product-message">Loading product...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-message">
        <h2>Product unavailable</h2>
        <p>{error || "Product not found."}</p>
        <Link to="/">Back to home</Link>
      </div>
    );
  }

  const variants: ProductVariant[] = product.variants ?? [];

  const sizes = [...new Set(
    variants.map((variant) => variant.size).filter(Boolean),
  )] as string[];

  const colors = [...new Set(
    variants.map((variant) => variant.color).filter(Boolean),
  )] as string[];

  const selectedVariant = variants.find(
    (variant) =>
      (!variant.size || variant.size === selectedSize) &&
      (!variant.color || variant.color === selectedColor),
  );

  const categoryName =
    typeof product.category === "string"
      ? product.category
      : product.category?.name ?? "General";

  const displayPrice = selectedVariant?.price ?? product.price;

  const outOfStock =
    selectedVariant?.stock !== undefined &&
    selectedVariant.stock <= 0;

  function chooseSize(size: string) {
    setSelectedSize(size);

    const matchingVariant = variants.find(
      (variant) =>
        variant.size === size &&
        (!selectedColor || !variant.color || variant.color === selectedColor),
    );

    if (matchingVariant?.color) {
      setSelectedColor(matchingVariant.color);
    }
  }

  function chooseColor(color: string) {
    setSelectedColor(color);

    const matchingVariant = variants.find(
      (variant) =>
        variant.color === color &&
        (!selectedSize || !variant.size || variant.size === selectedSize),
    );

    if (matchingVariant?.size) {
      setSelectedSize(matchingVariant.size);
    }
  }

  return (
    <main className="product-detail-page">
      <div className="product-breadcrumb">
        <Link to="/">Home</Link> / {product.name}
      </div>

      <section className="product-detail">
        <div className="product-gallery">
          <div className="main-product-image">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} />
            ) : (
              <div className="no-product-image">No image available</div>
            )}
          </div>

          <div className="product-thumbnails">
            {product.images?.map((image, index) => {
              const imageUrl = getImageUrl(image);

              return (
                <button
                  key={`${imageUrl}-${index}`}
                  className={
                    selectedImage === imageUrl ? "thumbnail active" : "thumbnail"
                  }
                  onClick={() => setSelectedImage(imageUrl)}
                  type="button"
                >
                  <img src={imageUrl} alt={`${product.name} ${index + 1}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="product-information">
          <p className="product-category">{categoryName}</p>

          <h1>{product.name}</h1>

          <p className="product-description">
            {product.description || "Discover more about this product."}
          </p>

          <h2 className="product-price">₹{displayPrice}</h2>

          {sizes.length > 0 && (
            <div className="variant-section">
              <h3>Choose Size</h3>

              <div className="variant-options">
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={
                      selectedSize === size ? "variant-option selected" : "variant-option"
                    }
                    onClick={() => chooseSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="variant-section">
              <h3>Choose Color</h3>

              <div className="variant-options">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={
                      selectedColor === color
                        ? "variant-option selected"
                        : "variant-option"
                    }
                    onClick={() => chooseColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {selectedVariant && (
            <div className="selected-variant">
              <p><strong>SKU:</strong> {selectedVariant.sku}</p>
              <p>
                <strong>Stock:</strong>{" "}
                {selectedVariant.stock ?? "Not specified"}
              </p>
              <p>
                <strong>Availability:</strong>{" "}
                {outOfStock ? "Out of stock" : "Available"}
              </p>
            </div>
          )}

          {variants.length > 0 && !selectedVariant && (
            <p className="variant-warning">
              Please select an available size and color combination.
            </p>
          )}

          {variants.length === 0 && (
            <p className="selected-variant">
              No variants are available for this product.
            </p>
          )}

          <button
            type="button"
            className="product-action-button"
            disabled={!selectedVariant || outOfStock}
          >
            {outOfStock ? "Out of Stock" : "Variant Selected"}
          </button>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <h2>Related Products</h2>

          <div className="related-product-grid">
            {relatedProducts.map((item) => (
              <Link
                to={`/products/${item.slug}`}
                className="related-product-card"
                key={item._id}
              >
                {item.images?.[0] && (
                  <img
                    src={getImageUrl(item.images[0])}
                    alt={item.name}
                  />
                )}

                <h3>{item.name}</h3>
                <p>₹{item.price}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetail;
