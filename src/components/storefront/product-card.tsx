"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Currency } from "@/components/shared/currency";
import { cn } from "@/lib/utils";
import { useAddCartItem } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import type { Product } from "@/types/catalog";

export function ProductCard({ product, className }: { product: Product; className?: string }) {
  const addItem = useAddCartItem();
  const { has, toggle } = useWishlist();
  const isWishlisted = has(product.id);

  const primaryImage =
    product.images?.find((image) => image.is_primary)?.url ?? product.images?.[0]?.url;

  const hasDiscount =
    product.discount_price !== null &&
    product.discount_price !== undefined &&
    product.discount_price < product.selling_price;

  const discountPercent = hasDiscount
    ? Math.round(
        ((product.selling_price - (product.discount_price ?? 0)) / product.selling_price) * 100
      )
    : 0;

  const outOfStock = (product.total_stock ?? 1) <= 0;

  return (
    <Card
      className={cn(
        "group hover-lift relative gap-3 overflow-hidden py-0",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="bg-muted relative aspect-square overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 22vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
              No image
            </div>
          )}

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {hasDiscount && <Badge variant="destructive">-{discountPercent}%</Badge>}
            {product.is_featured && <Badge variant="warning">Featured</Badge>}
            {outOfStock && <Badge variant="secondary">Out of stock</Badge>}
          </div>

          <Button
            type="button"
            size="icon-sm"
            variant="secondary"
            className="absolute top-2 right-2 rounded-full opacity-0 shadow-luxury-sm transition-opacity group-hover:opacity-100"
            onClick={(event) => {
              event.preventDefault();
              toggle(product);
            }}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("size-4", isWishlisted && "fill-destructive text-destructive")} />
          </Button>
        </div>
      </Link>

      <div className="space-y-2 px-3 pb-3.5">
        {product.brand && (
          <p className="text-muted-foreground text-xs">{product.brand.name}</p>
        )}
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-10 text-sm font-medium transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <Currency value={product.current_price} className="tabular-nums text-base font-semibold" />
          {hasDiscount && (
            <Currency
              value={product.selling_price}
              className="text-muted-foreground tabular-nums text-xs font-normal line-through"
            />
          )}
        </div>
        <Button
          size="sm"
          className="w-full"
          disabled={outOfStock || addItem.isPending}
          onClick={() =>
            addItem.mutate({ product_id: product.id, quantity: 1 })
          }
        >
          <ShoppingCart className="size-4" />
          {outOfStock ? "Out of stock" : "Add to cart"}
        </Button>
      </div>
    </Card>
  );
}
