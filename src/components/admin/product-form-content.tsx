"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/error-state";
import { FileDropzone } from "@/components/shared/file-dropzone";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { PageHeader } from "@/components/shared/page-header";
import {
  useAdminBrands,
  useAdminCategories,
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-admin-products";
import { productSchema, type ProductFormValues } from "@/lib/validators/product";

const DEFAULT_VALUES: ProductFormValues = {
  category_id: 0,
  brand_id: null,
  name: "",
  sku: "",
  barcode: "",
  description: "",
  short_description: "",
  cost_price: 0,
  selling_price: 0,
  discount_price: null,
  tax_rate: 0,
  unit: "",
  has_variants: false,
  is_active: true,
  is_featured: true,
  low_stock_threshold: 5,
  weight: null,
};

interface ProductFormContentProps {
  productId?: number;
}

export function ProductFormContent({ productId }: ProductFormContentProps) {
  const router = useRouter();
  const isEditing = !!productId;

  const { data: categories } = useAdminCategories();
  const { data: brands } = useAdminBrands();
  const {
    data: product,
    isLoading: productLoading,
    isError: productError,
    refetch: refetchProduct,
  } = useAdminProduct(productId);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const [images, setImages] = React.useState<File[]>([]);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: DEFAULT_VALUES,
  });

  React.useEffect(() => {
    if (product) {
      form.reset({
        category_id: product.category?.id ?? 0,
        brand_id: product.brand?.id ?? null,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode ?? "",
        description: product.description ?? "",
        short_description: product.short_description ?? "",
        cost_price: product.cost_price ?? 0,
        selling_price: product.selling_price,
        discount_price: product.discount_price,
        tax_rate: product.tax_rate,
        unit: product.unit,
        has_variants: product.has_variants,
        is_active: product.is_active,
        is_featured: product.is_featured,
        low_stock_threshold: product.low_stock_threshold,
        weight: product.weight,
      });
    }
  }, [product, form]);

  const isPending = createProduct.isPending || updateProduct.isPending;

  function onSubmit(values: ProductFormValues) {
    const payload = { ...values, weight: values.weight ?? undefined };

    if (isEditing && productId) {
      updateProduct.mutate(
        { id: productId, input: payload },
        { onSuccess: () => router.push("/admin/products") }
      );
      return;
    }

    createProduct.mutate(
      { ...payload, images: images.length ? images : undefined },
      { onSuccess: () => router.push("/admin/products") }
    );
  }

  if (isEditing && productLoading) {
    return <LoadingSpinner className="min-h-[50vh]" />;
  }

  if (isEditing && productError) {
    return <ErrorState onRetry={() => refetchProduct()} />;
  }

  return (
    <div className="animate-in-fade-up mx-auto max-w-4xl space-y-6">
      <div className="space-y-1">
        <Button variant="ghost" size="sm" className="-ml-2" asChild>
          <Link href="/admin/products">
            <ArrowLeft className="size-3.5" />
            Back to products
          </Link>
        </Button>
        <PageHeader
          title={isEditing ? "Edit product" : "New product"}
          description={
            isEditing
              ? "Update pricing, stock rules, and catalog placement."
              : "Add a new item to your catalog."
          }
        />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Basic information</CardTitle>
              <CardDescription>Name, category, and identifiers for this product.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Product name</FormLabel>
                    <FormControl>
                      <Input placeholder="Wireless Mouse" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : undefined}
                      onValueChange={(value) => field.onChange(Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={String(category.id)}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand (optional)</FormLabel>
                    <Select
                      value={field.value ? String(field.value) : "none"}
                      onValueChange={(value) => field.onChange(value === "none" ? null : Number(value))}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No brand</SelectItem>
                        {brands?.map((brand) => (
                          <SelectItem key={brand.id} value={String(brand.id)}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="WM-1001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Barcode (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="8901234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="pcs, kg, box…" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Pricing & stock</CardTitle>
              <CardDescription>Cost, margin, tax, and reorder thresholds.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        {...field}
                        value={(field.value as number | undefined) ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="selling_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selling price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        {...field}
                        value={(field.value as number | undefined) ?? 0}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discount_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount price (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={(field.value as number | null | undefined) ?? ""}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tax_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        max={100}
                        value={(field.value as number | undefined) ?? 0}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="low_stock_threshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low stock threshold</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        value={(field.value as number | undefined) ?? 0}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? undefined : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg, optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={(field.value as number | null | undefined) ?? ""}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                        onChange={(event) =>
                          field.onChange(event.target.value === "" ? null : event.target.value)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Description</CardTitle>
              <CardDescription>Copy shown on listing cards and the product page.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 pt-6">
              <FormField
                control={form.control}
                name="short_description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={2} placeholder="One-line summary shown on listing cards." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full description (optional)</FormLabel>
                    <FormControl>
                      <Textarea rows={5} placeholder="Detailed product description." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Images</CardTitle>
              <CardDescription>Product photography — the first image becomes the primary shot.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              {isEditing && (product?.images?.length ?? 0) > 0 && (
                <div>
                  <p className="text-muted-foreground mb-2.5 text-sm font-medium">Current images</p>
                  <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {product?.images?.map((image) => (
                      <div
                        key={image.id}
                        className="bg-muted ring-border/60 relative aspect-square overflow-hidden rounded-lg ring-1"
                      >
                        {image.url && (
                          <Image src={image.url} alt={product.name} fill className="object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                {isEditing && (
                  <p className="text-muted-foreground bg-muted/50 mb-2.5 rounded-lg border border-dashed p-3 text-sm">
                    Uploading new images here is only supported when creating a product. To change images
                    on an existing product, add a new product image via the API/back office.
                  </p>
                )}
                <FileDropzone
                  value={images}
                  onChange={setImages}
                  multiple
                  label="Upload product images"
                  hint="PNG, JPG up to 4MB each"
                  className={isEditing ? "pointer-events-none opacity-50" : undefined}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-eyebrow text-muted-foreground">Visibility</CardTitle>
              <CardDescription>Control where this product appears in the storefront.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Active</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Featured</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="has_variants"
                render={({ field }) => (
                  <FormItem className="hover:bg-muted/40 transition-luxury flex flex-row items-center justify-between rounded-lg border p-3.5">
                    <FormLabel className="font-normal">Has variants</FormLabel>
                    <FormControl>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="glass-panel sticky bottom-4 z-10 flex justify-end gap-2 rounded-xl p-3 shadow-luxury-md">
            <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save changes" : "Create product"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
