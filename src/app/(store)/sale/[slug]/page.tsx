import { Metadata } from "next";
import SaleDetailClient from "./SaleDetailClient";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/sales/${slug}`,
      { next: { revalidate: 60 } }
    );
    const json = await res.json();
    if (json.success && json.data?.campaign) {
      const campaign = json.data.campaign;
      return {
        title: `${campaign.seoTitle || campaign.title} | Sale | Hill Brew Tea`,
        description:
          campaign.seoDescription ||
          campaign.subtitle ||
          campaign.description ||
          `Limited-time sale: ${campaign.title}.`,
      };
    }
  } catch {
    // fallback below
  }
  return {
    title: `${slug.replace(/-/g, " ")} | Sale | Hill Brew Tea`,
    description: "Limited-time sale pricing on selected Hill Brew Tea.",
  };
}

export default async function SaleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  return <SaleDetailClient slug={slug} />;
}
