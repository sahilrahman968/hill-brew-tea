/**
 * Seed Hill Brew Tea catalog — categories + Assam tea products.
 *
 * Idempotent: upserts by slug. Safe to re-run.
 *
 *   npx tsx scripts/seed-catalog.ts
 *   npm run seed:catalog
 */

import mongoose, { Types } from "mongoose";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI not found in environment");
  process.exit(1);
}

const categorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true },
    description: String,
    image: { url: String, publicId: String },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    description: String,
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    brand: String,
    images: [{ url: String, publicId: String, alt: String, color: String }],
    variants: [
      {
        size: String,
        color: String,
        sku: String,
        price: Number,
        costPrice: Number,
        gst: { type: Number, default: 5 },
        compareAtPrice: Number,
        stock: Number,
        weight: Number,
        dimensions: {
          length: Number,
          width: Number,
          height: Number,
        },
        isActive: { type: Boolean, default: true },
      },
    ],
    discountPercent: Number,
    isReturnable: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 7 },
    codAvailable: { type: Boolean, default: true },
    shippingCategory: { type: String, default: "standard" },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
    relatedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    relatedProductsHeading: { type: String, default: "You may also like" },
  },
  { timestamps: true }
);

const Category = mongoose.models.Category || mongoose.model("Category", categorySchema);
const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

const CATEGORIES = [
  {
    name: "Assam Black Tea",
    slug: "assam-black-tea",
    description: "Malty, brisk single-origin Assam leaf for chai and breakfast cups.",
  },
  {
    name: "Estate Blends",
    slug: "estate-blends",
    description: "Small-batch blends finished for everyday rituals.",
  },
];

const PRODUCTS = [
  {
    title: "Hill Brew Assam Orthodox",
    slug: "hill-brew-assam-orthodox",
    description:
      "Bold, malty Assam leaf for morning chai or a quiet afternoon cup. Hand-picked at peak flush and packed in small batches so the garden stays in the liquor.",
    categorySlug: "assam-black-tea",
    brand: "Hill Brew Tea",
    isFeatured: true,
    tags: ["single-origin", "assam", "orthodox", "chai"],
    image: "/images/estate/product-hero.jpg",
    variants: [
      { size: "250g", sku: "TAP-ORT-250", price: 349, compareAtPrice: 399, stock: 120, weight: 250 },
      { size: "500g", sku: "TAP-ORT-500", price: 649, compareAtPrice: 749, stock: 80, weight: 500 },
      { size: "1kg", sku: "TAP-ORT-1KG", price: 1199, compareAtPrice: 1399, stock: 40, weight: 1000 },
    ],
  },
  {
    title: "Brahmaputra Breakfast",
    slug: "brahmaputra-breakfast",
    description:
      "A full-bodied breakfast cup with deep malt and a clean finish — built for milk tea and first light.",
    categorySlug: "assam-black-tea",
    brand: "Hill Brew Tea",
    isFeatured: true,
    tags: ["breakfast", "assam", "milk-tea"],
    image: "/images/estate/tea-cup.jpg",
    variants: [
      { size: "250g", sku: "TAP-BF-250", price: 329, compareAtPrice: 379, stock: 100, weight: 250 },
      { size: "500g", sku: "TAP-BF-500", price: 599, compareAtPrice: 699, stock: 60, weight: 500 },
    ],
  },
  {
    title: "Jorhat Evening Leaf",
    slug: "jorhat-evening-leaf",
    description:
      "Softer evening Assam with a honeyed edge. Steep shorter for a lighter cup without losing character.",
    categorySlug: "estate-blends",
    brand: "Hill Brew Tea",
    isFeatured: false,
    tags: ["evening", "assam", "light"],
    image: "/images/estate/tea-leaves.jpg",
    variants: [
      { size: "100g", sku: "TAP-JE-100", price: 199, compareAtPrice: 229, stock: 90, weight: 100 },
      { size: "250g", sku: "TAP-JE-250", price: 379, compareAtPrice: 429, stock: 70, weight: 250 },
    ],
  },
];

async function upsertCategory(def: (typeof CATEGORIES)[number]) {
  const existing = await Category.findOne({ slug: def.slug });
  if (existing) {
    existing.name = def.name;
    existing.description = def.description;
    existing.isActive = true;
    await existing.save();
    return existing._id as Types.ObjectId;
  }
  const created = await Category.create({
    ...def,
    parent: null,
    isActive: true,
  });
  return created._id as Types.ObjectId;
}

async function upsertProduct(
  def: (typeof PRODUCTS)[number],
  categoryId: Types.ObjectId
) {
  const variants = def.variants.map((v) => ({
    size: v.size,
    sku: v.sku,
    price: v.price,
    gst: 5,
    compareAtPrice: v.compareAtPrice,
    stock: v.stock,
    weight: v.weight,
    isActive: true,
  }));

  const payload = {
    title: def.title,
    slug: def.slug,
    description: def.description,
    category: categoryId,
    subcategory: null,
    brand: def.brand,
    images: [
      {
        url: def.image,
        publicId: `local/${def.slug}`,
        alt: def.title,
      },
    ],
    variants,
    isReturnable: true,
    returnWindowDays: 7,
    codAvailable: true,
    shippingCategory: "standard",
    isActive: true,
    isFeatured: def.isFeatured,
    tags: def.tags,
    relatedProducts: [],
    relatedProductsHeading: "More from the estate",
  };

  const existing = await Product.findOne({ slug: def.slug });
  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return existing._id as Types.ObjectId;
  }
  const created = await Product.create(payload);
  return created._id as Types.ObjectId;
}

async function main() {
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected to MongoDB");

  const categoryIds = new Map<string, Types.ObjectId>();
  for (const cat of CATEGORIES) {
    const id = await upsertCategory(cat);
    categoryIds.set(cat.slug, id);
    console.log(`Category ready: ${cat.slug}`);
  }

  for (const product of PRODUCTS) {
    const categoryId = categoryIds.get(product.categorySlug);
    if (!categoryId) throw new Error(`Missing category ${product.categorySlug}`);
    await upsertProduct(product, categoryId);
    console.log(`Product ready: ${product.slug}`);
  }

  // Link related products (orthodox ↔ breakfast)
  const orthodox = await Product.findOne({ slug: "hill-brew-assam-orthodox" });
  const breakfast = await Product.findOne({ slug: "brahmaputra-breakfast" });
  const evening = await Product.findOne({ slug: "jorhat-evening-leaf" });
  if (orthodox && breakfast && evening) {
    orthodox.relatedProducts = [breakfast._id, evening._id];
    breakfast.relatedProducts = [orthodox._id, evening._id];
    evening.relatedProducts = [orthodox._id, breakfast._id];
    await Promise.all([orthodox.save(), breakfast.save(), evening.save()]);
    console.log("Related products linked");
  }

  console.log("Catalog seed complete.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
