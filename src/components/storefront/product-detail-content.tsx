"use client";

import * as React from "react";
import Image from "next/image";
import { Heart, Minus, Package, Plus, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Currency } from "@/components/shared/currency";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorState } from "@/components/shared/error-state";
import { ProductGrid } from "@/components/storefront/product-grid";
import { cn } from "@/lib/utils";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useAddCartItem } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";

export function ProductDetailContent({ slug }: { slug: string }) {
  const { data: product, isLoading, isError, refetch } = useProduct(slug);
  const addItem = useAddCartItem();
  const { has, toggle } = useWishlist();

  const [activeImage, setActiveImage] = React.useState(0);
  const [selectedVariantId, setSelectedVariantId] = React.useState<number | null>(null);
  const [quantity, setQuantity] = React.useState(1);

  const { data: related } = useProducts({
    category_id: product?.category?.id,
    per_page: 4,
  });

  if (isLoading) {
    return <LoadingSpinner className="min-h-[60vh]" />;
  }

  if (isError || !product) {
    return (
      <div className="container-page py-16">
        <ErrorState
          title="Product not found"
          description="This product may have been removed or is no longer available."
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const selectedVariant = product.variants?.find((v) => v.id === selectedVariantId);
  const price = selectedVariant?.selling_price ?? product.current_price;
  const isWishlisted = has(product.id);
  const stock = selectedVariant?.stock_quantity ?? product.total_stock ?? 0;
  const outOfStock = stock <= 0;

  return (
    <div className="container-page py-12">
      <div className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="bg-muted shadow-luxury-sm relative aspect-square overflow-hidden rounded-2xl border border-border/60">
            {images[activeImage]?.url ? (
              <Image
                src={images[activeImage].url as string}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                <Package className="size-10" />
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2.5">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={cn(
                    "bg-muted hover-lift-sm relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors",
                    activeImage === index ? "border-primary" : "border-transparent"
                  )}
                >
                  {image.url && (
                    <Image src={image.url} alt={product.name} fill className="object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div>
            {product.brand && (
              <p className="text-muted-foreground text-sm">{product.brand.name}</p>
            )}
            <h1 className="text-display text-2xl sm:text-3xl">{product.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm">SKU: {selectedVariant?.sku ?? product.sku}</p>
          </div>

          <div className="flex items-center gap-3">
            <Currency value={price} className="tabular-nums text-3xl font-bold" />
            {product.discount_price && product.discount_price < product.selling_price && (
              <Currency
                value={product.selling_price}
                className="text-muted-foreground tabular-nums text-lg font-normal line-through"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : stock <= product.low_stock_threshold ? (
              <Badge variant="warning">Only {stock} left</Badge>
            ) : (
              <Badge variant="success">In stock</Badge>
            )}
            {product.is_featured && <Badge variant="secondary">Featured</Badge>}
          </div>

          {product.short_description && (
            <p className="text-muted-foreground">{product.short_description}</p>
          )}

          {product.has_variants && !!product.variants?.length && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose an option</p>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={selectedVariantId === variant.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {Object.values(variant.attributes).join(" / ")}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="size-3.5" />
              </Button>
              <span className="w-10 text-center">{quantity}</span>
              <Button variant="outline" size="icon-sm" onClick={() => setQuantity((q) => q + 1)}>
                <Plus className="size-3.5" />
              </Button>
            </div>

            <Button
              size="lg"
              disabled={outOfStock || addItem.isPending}
              onClick={() =>
                addItem.mutate({
                  product_id: product.id,
                  product_variant_id: selectedVariant?.id,
                  quantity,
                })
              }
            >
              <ShoppingCart className="size-4" />
              {outOfStock ? "Out of stock" : "Add to cart"}
            </Button>

            <Button variant="outline" size="lg" onClick={() => toggle(product)}>
              <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
              {isWishlisted ? "Wishlisted" : "Wishlist"}
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="description" className="mt-16">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="text-muted-foreground max-w-3xl py-4 text-sm leading-relaxed whitespace-pre-line">
          {product.description || "No description available for this product."}
        </TabsContent>
        <TabsContent value="details" className="py-4">
          <dl className="grid max-w-md grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Category</dt>
            <dd>{product.category?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Brand</dt>
            <dd>{product.brand?.name ?? "-"}</dd>
            <dt className="text-muted-foreground">Unit</dt>
            <dd>{product.unit}</dd>
            {product.weight && (
              <>
                <dt className="text-muted-foreground">Weight</dt>
                <dd>{product.weight} kg</dd>
              </>
            )}
          </dl>
        </TabsContent>
      </Tabs>

      {!!related?.data.length && (
        <section className="border-border/60 mt-16 border-t pt-12">
          <h2 className="text-display mb-6 text-xl sm:text-2xl">You might also like</h2>
          <ProductGrid products={related.data.filter((p) => p.id !== product.id).slice(0, 4)} />
        </section>
      )}
    </div>
  );
}
