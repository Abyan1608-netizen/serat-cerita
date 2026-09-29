"use client";

import { useState } from "react";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[#DED2C5] bg-[#F7F2EA]/95 backdrop-blur-md">
        {/* Announcement */}
        <div className="bg-[#3F2A20] px-4 py-2 text-center text-[9px] font-medium tracking-[0.25em] text-[#F7F2EA] sm:text-[10px]">
          HANDMADE WITH LOVE · SERAT CERITA
        </div>

        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-6 px-6 lg:px-10">
          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#EDE3D8] md:hidden"
          >
            {mobileMenuOpen ? (
              <X size={21} strokeWidth={1.5} />
            ) : (
              <Menu size={21} strokeWidth={1.5} />
            )}
          </button>

          {/* Logo */}
          <a
            href="/"
            className="shrink-0 text-[16px] font-semibold tracking-[0.2em] sm:text-xl"
          >
            SERAT CERITA
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-7 text-[13px] md:flex lg:gap-9">
            <a
              href="#collection"
              className="transition-colors hover:text-[#8A6048]"
            >
              Shop
            </a>

            <a
              href="#collection"
              className="transition-colors hover:text-[#8A6048]"
            >
              Collections
            </a>

            <a
              href="#custom"
              className="transition-colors hover:text-[#8A6048]"
            >
              Custom
            </a>

            <a
              href="#story"
              className="transition-colors hover:text-[#8A6048]"
            >
              Our Story
            </a>
          </nav>

          {/* Desktop Search */}
          <div className="hidden min-w-0 flex-1 justify-end lg:flex">
            <div className="flex w-full max-w-[220px] items-center border-b border-[#B7A392] pb-1.5">
              <Search
                size={17}
                strokeWidth={1.5}
                className="mr-2 shrink-0 text-[#735C4D]"
              />

              <input
                type="search"
                placeholder="Search"
                className="w-full bg-transparent text-xs outline-none placeholder:text-[#9A8778]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search Mobile */}
            <button
              type="button"
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#EDE3D8] lg:hidden"
            >
              <Search size={19} strokeWidth={1.5} />
            </button>

            {/* Wishlist */}
            <button
              type="button"
              aria-label="Wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#EDE3D8]"
            >
              <Heart size={19} strokeWidth={1.5} />
            </button>

            {/* Shopping Bag */}
            <button
              type="button"
              aria-label="Shopping bag"
              className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#EDE3D8]"
            >
              <ShoppingBag size={19} strokeWidth={1.5} />

              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#3F2A20] px-1 text-[8px] font-medium text-[#F7F2EA]">
                0
              </span>
            </button>

            {/* Account */}
            <button
              type="button"
              aria-label="Account"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-[#B7A392] transition-colors hover:bg-[#3F2A20] hover:text-[#F7F2EA] sm:ml-2"
            >
              <UserRound size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-[#DED2C5] bg-[#F7F2EA] md:hidden">
            <nav className="mx-auto max-w-7xl px-6 py-5">
              <div className="flex flex-col">
                <a
                  href="#collection"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#DED2C5] py-4 text-sm"
                >
                  Shop
                </a>

                <a
                  href="#collection"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#DED2C5] py-4 text-sm"
                >
                  Collections
                </a>

                <a
                  href="#custom"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#DED2C5] py-4 text-sm"
                >
                  Custom
                </a>

                <a
                  href="#story"
                  onClick={() => setMobileMenuOpen(false)}
                  className="border-b border-[#DED2C5] py-4 text-sm"
                >
                  Our Story
                </a>

                <a
                  href="#"
                  className="flex items-center gap-2 py-4 text-sm"
                >
                  <UserRound size={17} strokeWidth={1.5} />
                  My Account
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}