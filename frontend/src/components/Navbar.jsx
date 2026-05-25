import React, { useState, useEffect } from "react";
import { Globe, Menu, X } from "lucide-react";
import logoImg from "../assets/logo.png";

const NavLogo = ({ compact }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      userSelect: "none",
    }}
  >
    {/* App-icon style rounded logo */}
    <div
      style={{
        width: compact ? "50px" : "58px",
        height: compact ? "32px" : "38px",
        borderRadius: compact ? "8px" : "10px",
        overflow: "hidden",
        flexShrink: 0,
        background: "white",
        boxShadow: "0 1px 8px rgba(0,0,0,0.2)",
        padding: "2px 4px",
        transition:
          "width 0.3s ease, height 0.3s ease, border-radius 0.3s ease",
      }}
    >
      <img
        src={logoImg}
        alt="SkinX"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>

    {/* Text beside icon */}
    <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <span
        style={{
          fontWeight: 800,
          fontSize: compact ? "14px" : "16px",
          color: "white",
          letterSpacing: "0.02em",
          transition: "font-size 0.3s ease",
        }}
      >
        SkinX
      </span>
      {!compact && (
        <span
          style={{
            fontSize: "9px",
            color: "rgba(191,219,254,0.85)",
            fontWeight: 500,
            letterSpacing: "0.03em",
            marginTop: "2px",
          }}
        >
          Skin Cancer Detector
        </span>
      )}
    </div>
  </div>
);

const Navbar = ({ alwaysOpaque = false, hideAuthButtons = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const textCls = "text-white/90 hover:text-white";
  const borderCls = "border-white/30 hover:border-white/70";
  const dividerCls = "bg-white/20";
  const hoverBg = "hover:bg-white/10";

  // Mobile dropdown solid bg
  const mobileDropBg = "bg-[#364a6b] border-white/10";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "py-1.5 shadow-[0_4px_32px_rgba(0,0,0,0.55)]" : "py-2.5"
      }`}
      style={{
        background:
          scrolled || alwaysOpaque ? "rgba(30, 58, 138, 0.95)" : "transparent",
        backdropFilter: scrolled || alwaysOpaque ? "blur(10px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 flex items-center justify-between">
        {/* ── Logo ── */}
        <a href="/" className="cursor-pointer">
          <NavLogo compact={scrolled} />
        </a>

        {/* ── Desktop Nav ── */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2.5">
          {/* Language */}
          <button
            className={`flex items-center gap-1 text-xs font-medium px-1.5 py-1 rounded-md transition-all duration-200 ${textCls} ${hoverBg}`}
          >
            <Globe size={12} strokeWidth={2} />
            <span>Lang: EN</span>
          </button>

          {/* FAQ */}
          <a
            href="/faq"
            className={`text-xs font-medium px-1.5 py-1 rounded-md transition-all duration-200 ${textCls} ${hoverBg}`}
          >
            FAQ
          </a>

          {/* Diseases Dictionary */}
          <a
            href="/diseases-dictionary"
            className={`text-xs font-medium px-1.5 py-1 rounded-md transition-all duration-200 hidden lg:block ${textCls} ${hoverBg}`}
          >
            Diseases dictionary
          </a>

          {/* Register */}
          {!hideAuthButtons && (
            <a
              href="/register"
              className={`text-xs font-medium border px-3 py-1 rounded-md transition-all duration-200 ${textCls} ${borderCls} ${hoverBg}`}
            >
              Register
            </a>
          )}

          {/* Log In */}
          {!hideAuthButtons && (
            <a
              href="/login"
              className={`text-xs font-medium border px-3 py-1 rounded-md transition-all duration-200 ${textCls} ${borderCls} ${hoverBg}`}
            >
              Log In
            </a>
          )}
        </div>

        {/* ── Mobile: hamburger ── */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileOpen((prev) => !prev)}
            className={`p-2 rounded-lg transition-colors ${textCls} ${hoverBg}`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Dropdown ── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-5 pt-3 pb-5 flex flex-col gap-3 border-t backdrop-blur-md ${mobileDropBg}`}
        >
          <button
            className={`flex items-center gap-2 text-sm font-medium text-left py-1.5 transition-colors ${textCls}`}
          >
            <Globe size={15} />
            Lang: EN
          </button>

          <a
            href="/faq"
            onClick={() => setMobileOpen(false)}
            className={`text-sm font-medium text-left py-1.5 transition-colors ${textCls}`}
          >
            FAQ
          </a>

          <a
            href="/diseases-dictionary"
            onClick={() => setMobileOpen(false)}
            className={`text-sm font-medium text-left py-1.5 transition-colors ${textCls}`}
          >
            Diseases dictionary
          </a>

          {!hideAuthButtons && (
            <>
              <div className={`w-full h-px my-1 ${dividerCls}`} />

              <div className="flex gap-3">
                <a
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 text-sm font-medium border py-2 rounded-md transition-all text-center ${textCls} ${borderCls}`}
                >
                  Register
                </a>
                <a
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className={`flex-1 text-sm font-medium border py-2 rounded-md transition-all text-center ${textCls} ${borderCls}`}
                >
                  Log In
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
