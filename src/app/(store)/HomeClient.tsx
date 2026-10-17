"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ChevronDown,
  Leaf,
  Minus,
  Mountain,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import ParallaxSection from "@/components/store/estate/ParallaxSection";
import Reveal from "@/components/store/estate/Reveal";
import HeroCarousel, { type HeroSlide } from "@/components/store/HeroCarousel";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/store/Toast";
import { theme } from "@/config/theme";
import { formatPrice, getProductImage } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD, priceInclGst } from "@/lib/pricing";
import {
  fetchHomeSale,
  fetchProducts,
  fetchSales,
  type ProductData,
  type ProductVariantData,
  type SaleCampaignPublic,
} from "@/lib/store-api";

const FREE_SHIPPING_LABEL = `Free shipping over ₹${FREE_SHIPPING_THRESHOLD}`;
const ESTATE_HERO_SRC = "/images/estate/hero-garden.jpg";
const ESTATE_HERO_ALT =
  "Tea estate worker picking leaves in misty Assam gardens at dawn";

const FAQ = [
  {
    q: "How long does the tea stay fresh?",
    a: "Sealed, our Assam tea stays vibrant for 12 months. Once opened, keep it airtight and away from light — you'll taste peak aroma for about 3 months.",
  },
  {
    q: "Where is Hill Brew Tea sourced from?",
    a: "Every leaf comes from partner gardens along the Brahmaputra valley in Assam — single-origin lots we taste and approve before packing.",
  },
  {
    q: "What is your shipping time?",
    a: "Orders ship within 24–48 hours across India. Most metros receive them in 2–4 days; remote areas may take a little longer.",
  },
  {
    q: "How do I know this is authentic Assam tea?",
    a: "We work garden-direct, batch-code every pouch, and never blend in outside leaf. The malty body and brisk finish are the Assam terroir speaking.",
  },
];

const REASONS = [
  {
    title: "Why Assam tastes stronger",
    body: "Alluvial soil and a tropical monsoon climate grow leaves with deeper malt and a brisk, full cup no other region quite matches.",
    icon: Mountain,
  },
  {
    title: "Why small-batch matters",
    body: "We process limited lots so oxidation can be watched leaf by leaf — aroma and colour stay true from garden to pouch.",
    icon: Leaf,
  },
  {
    title: "Why freshness changes everything",
    body: "Garden to doorstep in weeks, not seasons. The volatile notes that fade on warehouse shelves still sing in your cup.",
    icon: Sparkles,
  },
  {
    title: "Direct from the source",
    body: "No middlemen. Fair pay for farming families, honest prices for you, and a relationship that lasts seasons.",
    icon: ShieldCheck,
  },
];

const BREW_STEPS = [
  {
    step: "01",
    title: "Heat the water",
    body: "Bring fresh water to a rolling boil — about 100°C.",
    tip: "Filtered water keeps the malt clean.",
  },
  {
    step: "02",
    title: "Measure the leaf",
    body: "One teaspoon (2g) for every 200ml cup.",
    tip: "Want it stronger? Add leaf, not minutes.",
  },
  {
    step: "03",
    title: "Steep & enjoy",
    body: "Brew 3–5 minutes. Add milk if you like a classic Assam chai.",
    tip: "For milk tea, aim for a 4-minute steep.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Finally, tea that tastes like mornings in Assam. The aroma fills the kitchen before the kettle even sings.",
    name: "Priya M.",
    place: "Mumbai",
  },
  {
    quote:
      "Consistent batch after batch. We switched the whole house — no going back to supermarket dust.",
    name: "Rajesh K.",
    place: "Delhi",
  },
  {
    quote:
      "Holds its character with milk. Most teas fold; Hill Brew stays bold and clean.",
    name: "Ananya S.",
    place: "Bengaluru",
  },
];

function AccordionItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border/70">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-xl text-foreground sm:text-2xl">
          {question}
        </span>
        <ChevronDown
          size={20}
          className={`shrink-0 text-primary transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="body-copy pb-5 text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}

function plainDescription(html: string, max = 240) {
  const plain = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

function productEyebrow(product: ProductData) {
  if (product.sale?.badgeLabel) return product.sale.badgeLabel;
  if (product.brand) return product.brand;
  if (product.tags?.length) return product.tags.slice(0, 2).join(" · ");
  if (product.category?.name) return product.category.name;
  return "Estate selection";
}

function HeroProductSkeleton() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="relative aspect-[4/5] animate-pulse-slow overflow-hidden bg-card/75 sm:aspect-square" />
      <div className="space-y-4">
        <div className="h-3 w-28 animate-pulse-slow rounded bg-card-hover" />
        <div className="h-12 w-4/5 animate-pulse-slow rounded bg-card-hover" />
        <div className="h-4 w-full animate-pulse-slow rounded bg-card-hover" />
        <div className="h-4 w-5/6 animate-pulse-slow rounded bg-card-hover" />
        <div className="mt-8 flex gap-3">
          <div className="h-16 w-28 animate-pulse-slow rounded bg-card-hover" />
          <div className="h-16 w-28 animate-pulse-slow rounded bg-card-hover" />
        </div>
        <div className="mt-4 h-12 w-48 animate-pulse-slow rounded bg-card-hover" />
      </div>
    </div>
  );
}

function HeroProductPanel({
  product,
  loading,
}: {
  product: ProductData | null;
  loading: boolean;
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] =
    useState<ProductVariantData | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [busy, setBusy] = useState(false);

  const variants = useMemo(
    () => (product?.variants || []).filter((v) => v.isActive !== false),
    [product]
  );
  const images = useMemo(() => product?.images ?? [], [product]);

  useEffect(() => {
    if (!variants.length) {
      setSelectedVariant(null);
      return;
    }
    setSelectedVariant(variants.find((v) => v.stock > 0) ?? variants[0]);
  }, [variants]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?._id]);

  if (loading) return <HeroProductSkeleton />;

  if (!product) {
    return (
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden bg-[#1a1410] sm:aspect-square">
            <Image
              src="/images/estate/product-hero.jpg"
              alt="Hill Brew Tea estate gardens"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div>
            <p className="eyebrow mb-3 text-primary/90">The Estate Cup</p>
            <h2 className="section-title text-4xl text-foreground sm:text-5xl lg:text-6xl">
              Coming soon to the shop
            </h2>
            <p className="body-copy mt-4 text-muted">
              We are preparing the next estate lot. Check back shortly for the
              next release.
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  const price = selectedVariant
    ? priceInclGst(selectedVariant.price, selectedVariant.gst)
    : 0;
  const image = getProductImage(images, selectedImage);
  const description = product.description
    ? plainDescription(product.description)
    : null;

  const handleBuyNow = async () => {
    if (!selectedVariant) {
      toast("Please select a pack size.", "info");
      return;
    }
    if (!isAuthenticated) {
      router.push("/login?redirect=/");
      return;
    }
    if (selectedVariant.stock < quantity) {
      toast("Not enough stock for that quantity.", "error");
      return;
    }
    setBusy(true);
    const res = await addToCart(product._id, selectedVariant._id, quantity);
    if (res.success) {
      router.push("/checkout");
      return;
    }
    toast(res.message, "error");
    setBusy(false);
  };

  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <Reveal>
        <div>
          <Link
            href={`/products/${product.slug}`}
            className="relative block aspect-[4/5] overflow-hidden bg-[#1a1410] sm:aspect-square"
          >
            <Image
              key={images[selectedImage]?.url || "product-placeholder"}
              src={image}
              alt={images[selectedImage]?.alt || product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.03]"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
            <p className="absolute bottom-5 left-5 eyebrow text-primary">
              {productEyebrow(product)}
            </p>
          </Link>

          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => {
                const active = selectedImage === idx;
                return (
                  <button
                    key={`${img.publicId || img.url}-${idx}`}
                    type="button"
                    aria-label={`View image ${idx + 1} of ${images.length}`}
                    aria-pressed={active}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative size-16 shrink-0 overflow-hidden border transition-colors sm:size-[4.5rem] ${
                      active
                        ? "border-primary"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.title} ${idx + 1}`}
                      fill
                      sizes="72px"
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div>
          <p className="eyebrow mb-3 text-primary/90">The Estate Cup</p>
          <h2 className="section-title text-4xl text-foreground sm:text-5xl lg:text-6xl">
            <Link
              href={`/products/${product.slug}`}
              className="transition-colors hover:text-primary"
            >
              {product.title}
            </Link>
          </h2>
          {description ? (
            <p className="body-copy mt-4 text-muted">{description}</p>
          ) : null}

          {variants.length > 0 ? (
            <div className="mt-8">
              <p className="label-text mb-3 text-muted">Select size</p>
              <div className="flex flex-wrap gap-3">
                {variants.map((variant) => {
                  const active = selectedVariant?._id === variant._id;
                  const label =
                    variant.size || variant.color || variant.sku || "Pack";
                  return (
                    <button
                      key={variant._id}
                      type="button"
                      disabled={variant.stock <= 0}
                      onClick={() => setSelectedVariant(variant)}
                      className={`min-w-[7.5rem] cursor-pointer border px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                        active
                          ? "border-primary bg-primary/15 text-foreground"
                          : "border-border bg-card/60 text-muted hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      <span className="block text-sm font-medium text-foreground">
                        {label}
                      </span>
                      <span className="meta-text mt-0.5 block">
                        {formatPrice(priceInclGst(variant.price, variant.gst))}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center border border-border">
              <button
                type="button"
                aria-label="Decrease quantity"
                className="grid size-11 cursor-pointer place-items-center text-foreground transition-colors hover:bg-card-hover"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus size={16} />
              </button>
              <span className="tabular w-10 text-center text-sm font-semibold">
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Increase quantity"
                className="grid size-11 cursor-pointer place-items-center text-foreground transition-colors hover:bg-card-hover"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
              >
                <Plus size={16} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuyNow}
              disabled={
                busy ||
                !selectedVariant ||
                selectedVariant.stock <= 0
              }
              className="btn-estate disabled:cursor-not-allowed disabled:opacity-60"
            >
              <ShoppingBag size={16} />
              {busy
                ? "Redirecting…"
                : `Buy now${price ? ` · ${formatPrice(price * quantity)}` : ""}`}
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <Truck size={15} className="text-primary" /> {FREE_SHIPPING_LABEL}
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck size={15} className="text-primary" /> 30-day
              freshness promise
            </span>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

function EstateHeroCopy({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <p className="font-display text-4xl tracking-tight text-primary sm:text-5xl lg:text-6xl">
          {theme.brand.name}
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.98] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
          Leaf from the
          <span className="block text-primary">Assam hills</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-foreground/80 sm:text-lg">
          Single-origin tea, hand-picked at dawn and packed in small batches —
          so every cup carries the mist of the Brahmaputra valley.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#estate-cup" className="btn-estate">
            Buy the estate cup
          </a>
          <a href="#origin" className="btn-estate-ghost">
            Explore the gardens
          </a>
        </div>
      </motion.div>

      <a
        href="#estate-cup"
        className="mt-12 inline-flex w-fit items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary"
      >
        <ArrowDown size={16} className="animate-bounce" />
        Scroll into the estate
      </a>
    </>
  );
}

export default function HomeClient() {
  const [heroProduct, setHeroProduct] = useState<ProductData | null>(null);
  const [productLoading, setProductLoading] = useState(true);
  const [bannerSales, setBannerSales] = useState<SaleCampaignPublic[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setProductLoading(true);
      try {
        const [homeSale, salesRes] = await Promise.all([
          fetchHomeSale(),
          fetchSales(),
        ]);

        if (!cancelled && salesRes.success && salesRes.data?.items) {
          setBannerSales(
            salesRes.data.items.filter(
              (sale) =>
                Boolean(sale.banner?.url) &&
                (sale.status === "live" || sale.status === "scheduled")
            )
          );
        }

        // Prefer a live home-sale product, then featured, then newest active.
        if (
          !cancelled &&
          homeSale.success &&
          homeSale.data?.products?.[0]
        ) {
          setHeroProduct(homeSale.data.products[0]);
          return;
        }

        const featured = await fetchProducts({ featured: true, limit: 1 });
        if (!cancelled && featured.success && featured.data?.items?.[0]) {
          setHeroProduct(featured.data.items[0]);
          return;
        }

        const any = await fetchProducts({
          limit: 1,
          sort: "createdAt",
          order: "desc",
        });
        if (!cancelled && any.success && any.data?.items?.[0]) {
          setHeroProduct(any.data.items[0]);
        }
      } catch {
        // leave null — empty state below
      } finally {
        if (!cancelled) setProductLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const heroSlides = useMemo<HeroSlide[]>(() => {
    const estateSlide: HeroSlide = {
      id: "estate-hero",
      image: ESTATE_HERO_SRC,
      imageAlt: ESTATE_HERO_ALT,
      kicker: theme.brand.name,
      headline: (
        <>
          Leaf from the
          <span className="block text-primary">Assam hills</span>
        </>
      ),
      subtitle:
        "Single-origin tea, hand-picked at dawn and packed in small batches — so every cup carries the mist of the Brahmaputra valley.",
      primaryCta: { label: "Buy the estate cup", href: "#estate-cup" },
      secondaryCta: { label: "Explore the gardens", href: "#origin" },
      extra: (
        <a
          href="#estate-cup"
          className="mt-12 inline-flex w-fit items-center gap-2 text-sm text-foreground/70 transition-colors hover:text-primary"
        >
          <ArrowDown size={16} className="animate-bounce" />
          Scroll into the estate
        </a>
      ),
    };

    const saleSlides: HeroSlide[] = bannerSales.map((sale) => ({
      id: `sale-${sale._id}`,
      image: sale.banner!.url,
      imageAlt: sale.banner?.alt || sale.title,
      href: sale.bannerCtaHref || `/sale/${sale.slug}`,
      primaryCta: {
        label: sale.bannerCtaLabel || "Shop the sale",
        href: sale.bannerCtaHref || `/sale/${sale.slug}`,
      },
      ctaPosition: sale.bannerCtaPosition,
    }));

    return [estateSlide, ...saleSlides];
  }, [bannerSales]);

  const showSaleCarousel = bannerSales.length > 0;

  return (
    <div className="bg-background">
      {/* ── Hero: static parallax, or carousel when sale banners exist ── */}
      {showSaleCarousel ? (
        <HeroCarousel slides={heroSlides} variant="estate" />
      ) : (
        <ParallaxSection
          src={ESTATE_HERO_SRC}
          alt={ESTATE_HERO_ALT}
          priority
          imageTravel={100}
          contentTravel={28}
          offset={["start start", "end start"]}
          className="min-h-estate-hero"
          overlayClassName="bg-[linear-gradient(105deg,rgba(8,14,10,0.72)_0%,rgba(8,14,10,0.35)_52%,rgba(8,14,10,0.55)_100%)]"
          contentClassName="mx-auto flex min-h-estate-hero w-full max-w-[92rem] flex-col justify-end px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24"
        >
          <EstateHeroCopy reduceMotion={reduceMotion} />
        </ParallaxSection>
      )}

      {/* ── Promise ticker ───────────────────────────────────────────────── */}
      <section className="border-y border-border/70 bg-[#0c1410]">
        <div className="ticker-wrap flex h-12 w-full items-center overflow-hidden">
          <div className="ticker-track flex items-center">
            {[0, 1].map((setIdx) => (
              <div
                key={setIdx}
                className="eyebrow-xs flex min-w-max items-center gap-6 px-4 text-[#b7b19f] lg:px-6"
              >
                {[
                  "Garden-direct Assam",
                  "Small-batch craft",
                  FREE_SHIPPING_LABEL,
                  "30-day freshness promise",
                  "Hand-picked two leaves & a bud",
                  "Jorhat · Assam",
                ].map((item) => (
                  <div key={`${setIdx}-${item}`} className="flex items-center gap-6">
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Hero product ─────────────────────────────────────────────────── */}
      <section id="estate-cup" className="scroll-mt-24 py-20 sm:py-28">
        <div className="mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <HeroProductPanel product={heroProduct} loading={productLoading} />
        </div>
      </section>

      {/* ── Why Hill Brew Tea ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-border/60 py-20 sm:py-28">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        />
        <div className="relative mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3 text-primary/90">The difference</p>
            <h2 className="section-title max-w-2xl text-4xl text-foreground sm:text-5xl">
              Why Hill Brew Tea?
            </h2>
            <p className="body-copy mt-4 text-muted">
              Not all Assam is equal. Here is what you taste when the garden,
              the batch, and the timing are treated with care.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {REASONS.map((reason, i) => {
              const Icon = reason.icon;
              return (
                <Reveal key={reason.title} delay={i * 0.08}>
                  <article className="h-full border border-border/70 bg-card/50 p-6 transition-colors hover:border-primary/40">
                    <Icon size={22} className="text-primary" strokeWidth={1.5} />
                    <h3 className="mt-5 font-display text-2xl text-foreground">
                      {reason.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      {reason.body}
                    </p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Origin / parallax story ──────────────────────────────────────── */}
      <ParallaxSection
        id="origin"
        src="/images/estate/hills-mist.jpg"
        alt="Rolling hills of a tea estate in mist"
        imageTravel={90}
        contentTravel={24}
        className="min-h-estate-story"
        overlayClassName="bg-[linear-gradient(to_right,rgba(10,18,12,0.88)_0%,rgba(10,18,12,0.55)_55%,rgba(10,18,12,0.75)_100%)]"
        contentClassName="mx-auto flex min-h-estate-story w-full max-w-[92rem] items-center px-4 py-24 sm:px-6 lg:px-8"
      >
        <Reveal className="max-w-2xl">
          <p className="eyebrow mb-3 text-primary">Our origin</p>
          <h2 className="section-title text-4xl text-foreground sm:text-5xl lg:text-6xl">
            Born in Assam
          </h2>
          <p className="mt-5 text-base leading-relaxed text-foreground/85 sm:text-lg">
            In the misty valleys where the Brahmaputra meets ancient hills,
            skilled hands pluck two leaves and a bud at first light. Our
            families have worked these gardens for decades — this is not a
            commodity. It is a relationship you can taste.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
            {[
              { value: "20+", label: "Years sourcing" },
              { value: "500+", label: "Farming families" },
              { value: "100%", label: "Single origin" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-3xl text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.14em] text-foreground/65">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </ParallaxSection>

      {/* ── Brewing guide (mist panel) ───────────────────────────────────── */}
      <section id="brew" className="estate-panel py-20 sm:py-28">
        <div className="mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <Reveal>
              <p className="eyebrow mb-3 text-[#8f7318]">Brewing guide</p>
              <h2 className="section-title text-4xl sm:text-5xl">
                The perfect cup
              </h2>
              <p className="mt-4 max-w-md text-base leading-relaxed text-[#3a4238]">
                Great leaf deserves a quiet ritual. Three steps — and a cup that
                tastes of Assam mornings.
              </p>
              <div className="relative mt-10 aspect-[4/5] overflow-hidden sm:max-w-md">
                <Image
                  src="/images/estate/tea-cup.jpg"
                  alt="A warm cup of Assam tea"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </Reveal>

            <div className="space-y-6">
              {BREW_STEPS.map((step, i) => (
                <Reveal key={step.step} delay={i * 0.08}>
                  <article className="border border-[#cfc8b4] bg-white/40 p-6 backdrop-blur-sm">
                    <p className="eyebrow text-[#8f7318]">{step.step}</p>
                    <h3 className="mt-2 font-display text-3xl text-[#152019]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-[#3a4238]">{step.body}</p>
                    <p className="mt-3 text-sm text-[#6a7268]">{step.tip}</p>
                  </article>
                </Reveal>
              ))}

              <Reveal delay={0.3}>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    { v: "100°C", l: "Water" },
                    { v: "2g", l: "Per cup" },
                    { v: "3–5 min", l: "Steep" },
                    { v: "200ml", l: "Serving" },
                  ].map((item) => (
                    <div
                      key={item.l}
                      className="border border-[#cfc8b4] bg-[#f7f3e8] px-3 py-4 text-center"
                    >
                      <p className="font-display text-2xl text-[#152019]">
                        {item.v}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#6a7268]">
                        {item.l}
                      </p>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Voices ───────────────────────────────────────────────────────── */}
      <section className="py-20 sm:py-28">
        <div className="mx-auto w-full max-w-[92rem] px-4 sm:px-6 lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3 text-primary/90">What people say</p>
            <h2 className="section-title text-4xl text-foreground sm:text-5xl">
              Loved by tea drinkers
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <blockquote className="flex h-full flex-col border border-border/70 bg-card/40 p-6">
                  <p className="flex-1 font-display text-xl leading-relaxed text-foreground/90 sm:text-2xl">
                    “{t.quote}”
                  </p>
                  <footer className="mt-6 border-t border-border/60 pt-4">
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="meta-text text-muted">{t.place}</p>
                  </footer>
                </blockquote>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section id="faq" className="border-t border-border/60 py-20 sm:py-28">
        <div className="mx-auto grid w-full max-w-[92rem] gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <Reveal>
            <p className="eyebrow mb-3 text-primary/90">Questions</p>
            <h2 className="section-title text-4xl text-foreground sm:text-5xl">
              Frequently asked
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <div>
              {FAQ.map((item) => (
                <AccordionItem key={item.q} question={item.q} answer={item.a} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA with parallax ──────────────────────────────────────── */}
      <ParallaxSection
        src="/images/estate/tea-leaves.jpg"
        alt="Fresh tea leaves"
        imageTravel={70}
        contentTravel={18}
        className="py-24 sm:py-32"
        overlayClassName="bg-[linear-gradient(to_top,rgba(10,18,12,0.9),rgba(10,18,12,0.55))]"
        contentClassName="mx-auto max-w-3xl px-4 text-center sm:px-6"
      >
        <Reveal>
          <p className="eyebrow mb-3 text-primary">Ready to taste the hills?</p>
          <h2 className="section-title text-4xl text-foreground sm:text-5xl lg:text-6xl">
            Upgrade your daily tea ritual
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-foreground/80">
            Join tea lovers who made the switch to garden-fresh Assam. Your
            perfect cup is one steep away.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#estate-cup" className="btn-estate">
              Shop Hill Brew Tea
            </a>
          </div>
          <p className="mt-6 text-sm text-foreground/60">
            {FREE_SHIPPING_LABEL} · 30-day guarantee · Secure payment
          </p>
        </Reveal>
      </ParallaxSection>

    </div>
  );
}
