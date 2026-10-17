"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LogOut,
  MapPin,
  Menu,
  Package,
  User,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { theme } from "@/config/theme";

const MAIN_NAV_HEIGHT = "4.25rem";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isFullBleed =
    isHome || pathname === "/login" || /^\/sale\/[^/]+$/.test(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const navLinks = [
    { href: "/#estate-cup", label: "The Tea" },
    { href: "/#origin", label: "Origin" },
    { href: "/#brew", label: "Brewing" },
    { href: "/#faq", label: "FAQ" },
  ];

  const solidBar = !isFullBleed || scrolled;

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
        isFullBleed && !scrolled ? "-mb-[4.25rem]" : ""
      }`}
    >
      <div
        className={`relative transition-all duration-300 ${
          solidBar
            ? "border-b border-border/70 bg-background/92 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        {!solidBar ? (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 via-black/25 to-transparent"
          />
        ) : null}

        <div
          className="relative mx-auto flex max-w-[92rem] items-center justify-between px-4 sm:px-6 lg:px-8"
          style={{ height: MAIN_NAV_HEIGHT }}
        >
          <Link
            href="/"
            className="relative z-10 font-display text-2xl tracking-tight text-foreground transition-colors hover:text-primary sm:text-[1.75rem]"
            aria-label={`${theme.brand.name} Home`}
          >
            {theme.brand.name}
          </Link>

          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`eyebrow transition-colors ${
                  isActive(link.href.split("#")[0] || link.href)
                    ? "text-primary"
                    : "text-foreground/80 hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-10 flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="grid size-10 cursor-pointer place-items-center text-foreground transition-colors hover:text-primary lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <div className="hidden items-center gap-4 lg:flex">
              {isAuthenticated ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="cursor-pointer text-foreground/85 transition-colors hover:text-primary"
                    aria-label="Account"
                  >
                    <User size={17} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 top-full z-50 mt-2 w-56 border border-border bg-card/95 py-2 shadow-2xl shadow-black/30"
                      >
                        <Link
                          href="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-card-hover"
                        >
                          <Package size={16} />
                          My Orders
                        </Link>
                        <Link
                          href="/account/addresses"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-card-hover"
                        >
                          <MapPin size={16} />
                          Saved Addresses
                        </Link>
                        <hr className="my-1 border-border" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-danger transition-colors hover:bg-card-hover"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-foreground/85 transition-colors hover:text-primary"
                  aria-label="Login"
                >
                  <User size={17} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {mobileMenuOpen && (
              <>
                <motion.button
                  type="button"
                  aria-label="Close menu"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="fixed inset-0 z-[2147483646] cursor-default bg-black/40 backdrop-blur-sm lg:hidden"
                />
                <motion.aside
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 340, damping: 34 }}
                  className="fixed right-0 top-0 z-[2147483647] flex h-dvh w-[72vw] max-w-[18rem] flex-col overflow-y-auto border-l border-border bg-[#0c1410] lg:hidden"
                  aria-label="Mobile navigation"
                >
                  <div className="flex items-center justify-between px-5 pt-5">
                    <p className="font-display text-xl text-foreground">
                      {theme.brand.name}
                    </p>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="grid size-9 cursor-pointer place-items-center text-foreground/80 transition-colors hover:text-primary"
                      aria-label="Close menu"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <nav className="relative px-3 pb-3 pt-6">
                    {navLinks.map(({ href, label }) => {
                      return (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex min-h-11 items-center px-3.5 text-foreground/90 transition-colors hover:text-primary"
                        >
                          <span className="font-display text-xl">
                            {label}
                          </span>
                        </Link>
                      );
                    })}

                    {isAuthenticated ? (
                      <div className="mt-4 border-t border-border/70 pt-3">
                        <Link
                          href="/account/orders"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex min-h-11 items-center px-3.5 text-foreground/85"
                        >
                          My orders
                        </Link>
                        <Link
                          href="/account/addresses"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex min-h-11 items-center px-3.5 text-foreground/85"
                        >
                          Saved addresses
                        </Link>
                      </div>
                    ) : null}
                  </nav>

                  <div className="mt-auto p-4">
                    {!isAuthenticated ? (
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-estate flex w-full"
                      >
                        Login / register
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          void handleLogout();
                        }}
                        className="btn-text flex h-11 w-full cursor-pointer items-center justify-center border border-danger/30 text-danger"
                      >
                        Logout
                      </button>
                    )}
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </header>
  );
}
