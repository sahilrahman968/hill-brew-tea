import Link from "next/link";
import { theme } from "@/config/theme";

export default function Footer() {
  return (
    <footer className="border-t border-border/70 bg-[#0c1410] text-muted">
      <div className="mx-auto max-w-[92rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link
              href="/"
              className="font-display text-3xl tracking-tight text-foreground transition-colors hover:text-primary"
              aria-label={`${theme.brand.name} Home`}
            >
              {theme.brand.name}
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {theme.brand.description}
            </p>
            <p className="mt-4 text-sm text-foreground/70">
              {theme.brand.location}
            </p>
          </div>

          <div>
            <h3 className="label-text mb-4 text-foreground">Explore</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/#estate-cup" className="text-sm transition-colors hover:text-primary">
                  The Tea
                </Link>
              </li>
              <li>
                <Link href="/#origin" className="text-sm transition-colors hover:text-primary">
                  Origin
                </Link>
              </li>
              <li>
                <Link href="/#brew" className="text-sm transition-colors hover:text-primary">
                  Brewing Guide
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label-text mb-4 text-foreground">Account</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/login" className="text-sm transition-colors hover:text-primary">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="text-sm transition-colors hover:text-primary">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="label-text mb-4 text-foreground">Visit us</h3>
            <ul className="space-y-2.5 text-sm">
              <li>{theme.brand.supportEmail}</li>
              <li>{theme.brand.supportPhone}</li>
              <li>{theme.brand.supportHours}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70">
        <div className="mx-auto flex max-w-[92rem] flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 lg:px-8 sm:text-left">
          <p className="text-xs text-muted/70">
            &copy; {new Date().getFullYear()} {theme.brand.name} · Grown in Assam.
          </p>
          <p className="text-xs text-muted/60">
            Single-origin · Small-batch · Garden-direct
          </p>
        </div>
      </div>
    </footer>
  );
}
