import { Metadata } from "next";
import HomeClient from "./HomeClient";
import { theme } from "@/config/theme";

export const metadata: Metadata = {
  title: { absolute: `${theme.brand.name} | ${theme.brand.tagline}` },
  description: theme.brand.description,
  openGraph: {
    title: `${theme.brand.name} | Premium Assam Tea`,
    description: theme.brand.description,
    type: "website",
  },
};

export default function HomePage() {
  return <HomeClient />;
}
