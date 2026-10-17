import { Metadata } from "next";
import CategoryProductsClient from "./CategoryProductsClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/categories`,
      { next: { revalidate: 60 } }
    );
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      const category = json.data.find(
        (c: { slug?: string }) => c.slug === slug
      );
      if (category) {
        return {
          title: `${category.name} - Hill Brew Tea`,
          description:
            category.description ||
            `Browse our collection of ${category.name.toLowerCase()} products.`,
        };
      }
    }
  } catch {
    // fallback below
  }
  const formatted = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return {
    title: `${formatted} - Hill Brew Tea`,
    description: `Browse our collection of ${formatted.toLowerCase()} products.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  return <CategoryProductsClient slug={slug} />;
}
