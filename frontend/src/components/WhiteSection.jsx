import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FolderIcon3D from "../assets/FolderIcon3D";
import HandPhoneStar3D from "../assets/HandPhoneStar3D";
import bodyFigure from "../assets/body-figure.png";
import backSpot from "../assets/back-spot.png";
import step1TakePhoto from "../assets/step1-take-photo.png";
import step2SendPhoto from "../assets/step2-send-photo.png";
import step3ReceiveResult from "../assets/step3-receive-result.png";
import aiImage from "../assets/ai-image.png";

// ─────────────────────────────────────────────────────────────────────────────
// TESTIMONIALS CAROUSEL COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TestimonialsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Ashis",
      text: "Which was later confirmed by my PCP! Thank you for creating and providing this technology.",
      stars: 5,
    },
    {
      name: "Redwan",
      text: "The app works really well for skin tracking, and the reminders are super useful. The AI chat is helpful but sometimes gives generic responses.",
      stars: 5,
    },
    {
      name: "Sameul",
      text: "The 1st photo (yesterday) was free. The 2nd (today) cost $2.99. I see no mention of pricing, or a paid subscription. Impressed with app. Thank you!",
      stars: 4,
    },
    {
      name: "Siddhartho",
      text: "Accurately detected skin cancer this month and quite possibly saved my life, skin biopsy showed this app being 100% correct. I will recommend this app to everyone.",
      stars: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Get the current and next testimonial
  const currentTestimonial = testimonials[currentIndex];
  const nextTestimonial =
    testimonials[(currentIndex + 1) % testimonials.length];

  return (
    <div className="mt-20 py-16 px-4 bg-gray-50">
      {/* Carousel Container */}
      <div className="max-w-7xl mx-auto overflow-hidden">
        <div className="relative">
          {/* Mobile: Single card view */}
          <div className="block md:hidden">
            <div className="px-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <h3 className="font-semibold text-[#1e293b] text-xl mb-4">
                  {testimonials[currentIndex].name}
                </h3>
                <p className="text-[#64748b] leading-relaxed mb-6 text-sm">
                  {testimonials[currentIndex].text}
                </p>
                <div className="flex gap-1">
                  {[...Array(testimonials[currentIndex].stars)].map((_, i) => (
                    <svg
                      key={i}
                      className="fill-yellow-400 w-5 h-5"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                  ))}
                  {[...Array(5 - testimonials[currentIndex].stars)].map(
                    (_, i) => (
                      <svg
                        key={i}
                        className="fill-gray-300 w-5 h-5"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                      </svg>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop: Dual card carousel */}
          <div className="hidden md:block">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * 50}%)`,
              }}
            >
              {testimonials.map((testimonial, index) => {
                const position =
                  (index - currentIndex + testimonials.length) %
                  testimonials.length;
                const isCenter = position === 0;
                const isRight = position === 1;
                const isVisible = isCenter || isRight;

                return (
                  <div
                    key={index}
                    className="w-1/2 flex-shrink-0 px-4 transition-all duration-700"
                    style={{
                      opacity: isVisible ? (isCenter ? 1 : 0.6) : 0,
                    }}
                  >
                    <div
                      className={`bg-white border border-gray-200 rounded-xl shadow-lg h-full hover:shadow-xl transition-shadow ${isCenter ? "p-8" : "p-6"}`}
                    >
                      <h3
                        className={`font-semibold text-[#1e293b] mb-4 ${isCenter ? "text-2xl" : "text-xl"}`}
                      >
                        {testimonial.name}
                      </h3>
                      <p
                        className={`text-[#64748b] leading-relaxed mb-6 ${isCenter ? "text-base" : "text-sm line-clamp-3"}`}
                      >
                        {testimonial.text}
                      </p>
                      <div className="flex gap-1">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <svg
                            key={i}
                            className={`fill-yellow-400 ${isCenter ? "w-6 h-6" : "w-5 h-5"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                        {[...Array(5 - testimonial.stars)].map((_, i) => (
                          <svg
                            key={i}
                            className={`fill-gray-300 ${isCenter ? "w-6 h-6" : "w-5 h-5"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                          </svg>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center gap-2 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 hover:bg-gray-400 w-3"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const Bullet = ({ children }) => (
  <div className="flex items-start gap-2.5 mb-4">
    <svg
      viewBox="0 0 14 12"
      width="16"
      height="14"
      className="flex-shrink-0 mt-[3px]"
      fill="none"
    >
      <polyline
        points="1,6.5 4.5,10.5 13,1.5"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    <span className="text-[14px] text-slate-700 leading-snug">{children}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// PROMO CARD ICONS
// ─────────────────────────────────────────────────────────────────────────────

/** Card 1 — folder with papers */
const FolderDocSVG = () => (
  <svg
    viewBox="0 0 108 92"
    width="96"
    height="82"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Papers fanning out from folder */}
    <rect
      x="44"
      y="4"
      width="34"
      height="48"
      rx="3"
      fill="white"
      opacity="0.88"
      transform="rotate(-14 61 28)"
    />
    <rect
      x="46"
      y="2"
      width="34"
      height="48"
      rx="3"
      fill="#dce8ff"
      opacity="0.82"
      transform="rotate(-4 63 26)"
    />
    <rect
      x="48"
      y="0"
      width="34"
      height="48"
      rx="3"
      fill="white"
      opacity="0.96"
      transform="rotate(5 65 24)"
    />
    {/* Lines on front paper */}
    <line
      x1="54"
      y1="17"
      x2="76"
      y2="14"
      stroke="#b0c8f0"
      strokeWidth="2"
      opacity="0.65"
      strokeLinecap="round"
    />
    <line
      x1="54"
      y1="24"
      x2="76"
      y2="21"
      stroke="#b0c8f0"
      strokeWidth="2"
      opacity="0.65"
      strokeLinecap="round"
    />
    <line
      x1="54"
      y1="31"
      x2="70"
      y2="28"
      stroke="#b0c8f0"
      strokeWidth="2"
      opacity="0.5"
      strokeLinecap="round"
    />
    {/* Folder body */}
    <path
      d="M 6 39 Q 6 32 13 32 L 92 32 Q 99 32 99 39 L 99 76 Q 99 83 92 83 L 13 83 Q 6 83 6 76 Z"
      fill="rgba(255,255,255,0.30)"
    />
    {/* Folder sheen */}
    <path
      d="M 8 39 Q 8 34 13 34 L 92 34 Q 97 34 97 39 L 97 44 Q 97 40 92 40 L 13 40 Q 8 40 8 44 Z"
      fill="rgba(255,255,255,0.18)"
    />
    {/* Folder tab */}
    <path
      d="M 12 32 L 42 32 Q 47 32 49 28 L 53 22 Q 55 18 60 18 L 40 18 Q 35 18 33 22 L 29 28 Q 27 32 22 32 Z"
      fill="rgba(255,255,255,0.22)"
    />
  </svg>
);

/** Card 2 — star + hand holding phone */
const StarPhoneSVG = () => (
  <svg
    viewBox="0 0 108 92"
    width="96"
    height="82"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="starGrad" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
    </defs>

    {/* 3-D star */}
    <polygon
      points="40,3 44.5,16 58,16 47.5,24 52,37 40,28.5 28,37 32.5,24 22,16 35.5,16"
      fill="url(#starGrad)"
    />
    {/* Star depth shadow */}
    <polygon
      points="40,3 44.5,16 58,16 47.5,24 52,37 40,28.5 28,37 32.5,24 22,16 35.5,16"
      fill="rgba(160,80,0,0.22)"
      transform="translate(2.5,3.5)"
    />

    {/* Fingers */}
    <path
      d="M 62 48 Q 57 54 59 67"
      stroke="#f0c090"
      strokeWidth="10"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 72 46 Q 68 53 70 66"
      stroke="#f0c090"
      strokeWidth="10"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 82 48 Q 80 55 82 66"
      stroke="#e8b080"
      strokeWidth="9"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 91 54 Q 92 62 93 72"
      stroke="#e8b080"
      strokeWidth="8.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.78"
    />

    {/* Palm */}
    <ellipse
      cx="76"
      cy="74"
      rx="24"
      ry="15"
      fill="#f0c090"
      transform="rotate(-10 76 74)"
    />

    {/* Phone body */}
    <rect
      x="61"
      y="36"
      width="26"
      height="46"
      rx="4.5"
      fill="white"
      opacity="0.97"
    />
    <rect
      x="61"
      y="36"
      width="26"
      height="46"
      rx="4.5"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="0.8"
      fill="none"
    />
    {/* Screen */}
    <rect
      x="64"
      y="41"
      width="20"
      height="34"
      rx="2.5"
      fill="rgba(30,58,138,0.18)"
    />
    {/* Speaker */}
    <rect
      x="68"
      y="38.5"
      width="8"
      height="1.8"
      rx="0.9"
      fill="rgba(100,120,200,0.3)"
    />
    {/* Home bar */}
    <rect
      x="70"
      y="78"
      width="7"
      height="2"
      rx="1"
      fill="rgba(30,58,138,0.25)"
    />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// TEAL CARD — AI Brain SVG
// ─────────────────────────────────────────────────────────────────────────────

const AIBrainSVG = () => (
  <svg
    viewBox="0 0 72 72"
    width="62"
    height="62"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Left hemisphere */}
    <path
      d="M 35 13 Q 20 13 16 24 Q 12 34 16 43 Q 19 50 22 55 L 35 55 Z"
      stroke="rgba(255,255,255,0.82)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.13)"
    />
    {/* Right hemisphere */}
    <path
      d="M 37 13 Q 52 13 56 24 Q 60 34 56 43 Q 53 50 50 55 L 37 55 Z"
      stroke="rgba(255,255,255,0.82)"
      strokeWidth="2"
      fill="rgba(255,255,255,0.13)"
    />
    {/* Centre divider */}
    <line
      x1="36"
      y1="13"
      x2="36"
      y2="55"
      stroke="rgba(255,255,255,0.32)"
      strokeWidth="1.5"
      strokeDasharray="3,2.5"
    />
    {/* Brain fold lines */}
    <path
      d="M 22 24 Q 27 31 22 39 Q 20 43 22 48"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M 50 24 Q 45 31 50 39 Q 52 43 50 48"
      stroke="rgba(255,255,255,0.55)"
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />

    {/* Circuit nodes */}
    <circle cx="16" cy="28" r="2.8" fill="rgba(255,255,255,0.88)" />
    <circle cx="56" cy="28" r="2.8" fill="rgba(255,255,255,0.88)" />
    <circle cx="16" cy="43" r="2.8" fill="rgba(255,255,255,0.88)" />
    <circle cx="56" cy="43" r="2.8" fill="rgba(255,255,255,0.88)" />
    <circle cx="36" cy="9" r="2.8" fill="rgba(255,255,255,0.88)" />
    <circle cx="36" cy="59" r="2.5" fill="rgba(255,255,255,0.72)" />

    {/* Horizontal wires */}
    <line
      x1="7"
      y1="28"
      x2="13.2"
      y2="28"
      stroke="rgba(255,255,255,0.68)"
      strokeWidth="1.4"
    />
    <line
      x1="7"
      y1="43"
      x2="13.2"
      y2="43"
      stroke="rgba(255,255,255,0.68)"
      strokeWidth="1.4"
    />
    <line
      x1="58.8"
      y1="28"
      x2="65"
      y2="28"
      stroke="rgba(255,255,255,0.68)"
      strokeWidth="1.4"
    />
    <line
      x1="58.8"
      y1="43"
      x2="65"
      y2="43"
      stroke="rgba(255,255,255,0.68)"
      strokeWidth="1.4"
    />

    {/* Vertical wires */}
    <line
      x1="36"
      y1="6.2"
      x2="36"
      y2="11.8"
      stroke="rgba(255,255,255,0.68)"
      strokeWidth="1.4"
    />
    <line
      x1="36"
      y1="56.2"
      x2="36"
      y2="61.8"
      stroke="rgba(255,255,255,0.52)"
      strokeWidth="1.4"
    />

    {/* Diagonal connections */}
    <line
      x1="18.5"
      y1="29.5"
      x2="34.2"
      y2="11"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.1"
    />
    <line
      x1="53.5"
      y1="29.5"
      x2="37.8"
      y2="11"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="1.1"
    />
    <line
      x1="18.5"
      y1="41.5"
      x2="16"
      y2="30.8"
      stroke="rgba(255,255,255,0.30)"
      strokeWidth="1.1"
    />
    <line
      x1="53.5"
      y1="41.5"
      x2="56"
      y2="30.8"
      stroke="rgba(255,255,255,0.30)"
      strokeWidth="1.1"
    />

    {/* Outer endpoint dots */}
    <circle cx="7" cy="28" r="1.8" fill="rgba(255,255,255,0.65)" />
    <circle cx="7" cy="43" r="1.8" fill="rgba(255,255,255,0.65)" />
    <circle cx="65" cy="28" r="1.8" fill="rgba(255,255,255,0.65)" />
    <circle cx="65" cy="43" r="1.8" fill="rgba(255,255,255,0.65)" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// PROMO CAROUSEL DATA
// ─────────────────────────────────────────────────────────────────────────────

const PROMO_CARDS = [
  {
    bg: "linear-gradient(128deg, #3948b8 0%, #5560d8 60%, #6472e8 100%)",
    title: "Create a FREE account to unlock your In-Depth Analysis",
    subtitle: null,
    Icon: FolderIcon3D,
  },
  {
    bg: "linear-gradient(128deg, #2aa0d2 0%, #36b8e8 60%, #4acef8 100%)",
    title: "Register, get more!",
    subtitle: "Detailed scan • Reports • Results history",
    Icon: HandPhoneStar3D,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// WHITE SECTION
// ─────────────────────────────────────────────────────────────────────────────

const WhiteSection = ({ onStartCheckup }) => {
  const navigate = useNavigate();
  const [activePromo, setActivePromo] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActivePromo((p) => (p + 1) % 2), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-white">
      {/* ══ 1. WHY SKINX? ═══════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-14 pb-10">
        {/* Heading */}
        <h2 className="text-[28px] sm:text-3xl font-extrabold text-[#0c1a54] mb-1">
          Why SkinX?
        </h2>
        <p className="text-slate-500 text-[14px] mb-8">
          Developed and powered by artificial intelligence.
        </p>

        {/* Features grid — 2 columns */}
        <div className="flex flex-col sm:flex-row gap-8 lg:gap-14">
          {/* Left bullet column */}
          <div className="flex-1">
            <Bullet>
              <>
                <strong className="text-[#0c1a54]">
                  Detects skin cancer, melanoma, and basal cell
                </strong>{" "}
                level
              </>
            </Bullet>
            <Bullet>
              <>
                <strong className="text-[#0c1a54]">Over 97% accuracy,</strong>{" "}
                based on AI and clinical database
              </>
            </Bullet>
            <Bullet>
              <>
                <strong className="text-[#0c1a54]">Result</strong> within{" "}
                <strong className="text-[#0c1a54]">1 minute</strong>
              </>
            </Bullet>
          </div>

          {/* Right bullet column */}
          <div className="flex-1">
            <Bullet>
              <>
                Enables{" "}
                <strong className="text-[#0c1a54]">
                  instant at-home screening
                </strong>
              </>
            </Bullet>
            <Bullet>
              <strong className="text-[#0c1a54]">
                24/7 personal AI Consultant
              </strong>
            </Bullet>
          </div>
        </div>
      </div>

      {/* ══ 2. PROMO BANNER CAROUSEL ════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-12">
        {/* Slide track */}
        <div
          className="relative overflow-hidden rounded-[20px]"
          style={{ height: "140px" }}
        >
          {PROMO_CARDS.map((card, i) => (
            <div
              key={i}
              className="absolute inset-0 flex items-center justify-between px-10 pr-5 transition-transform duration-700 ease-in-out"
              style={{
                background: card.bg,
                transform: `translateX(${(i - activePromo) * 100}%)`,
              }}
            >
              {/* Text */}
              <div className="max-w-xs">
                <h3 className="text-white font-bold text-xl leading-snug">
                  {card.title}
                </h3>
                {card.subtitle && (
                  <p className="text-white/80 text-sm mt-1">{card.subtitle}</p>
                )}
              </div>
              {/* Illustration */}
              <div className="flex-shrink-0">
                <card.Icon />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center gap-2.5 mt-4">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setActivePromo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === activePromo
                  ? "bg-blue-600 w-5 h-2.5"
                  : "bg-slate-300 w-2.5 h-2.5"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ══ 3. WHAT DO YOU KNOW IN 1 MINUTE? ═══════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pb-16">
        {/* Heading */}
        <h2 className="text-[28px] sm:text-3xl font-extrabold text-[#0c1a54] mb-1">
          What do you know in 1 minute?
        </h2>
        <p className="text-slate-500 text-[14px] mb-7">
          What do you know in 1 minute?
        </p>

        {/* Bullets + teal card row */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 2-column bullet grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
            {/* Left column */}
            <div>
              <Bullet>
                <>
                  <strong className="text-[#0c1a54]">Skin cancer</strong>
                  <br />
                  <span className="text-slate-500 text-[13px]">
                    (melanoma, BKK, BCC, etc.)
                  </span>
                </>
              </Bullet>
              <Bullet>
                <>
                  <strong className="text-[#0c1a54]">
                    Precancerous lesions
                  </strong>
                  <br />
                  <span className="text-slate-500 text-[13px]">
                    (blue and dysplastic nevus, etc.)
                  </span>
                </>
              </Bullet>
              <Bullet>
                <strong className="text-[#0c1a54]">6 types of acne</strong>
              </Bullet>
            </div>

            {/* Right column */}
            <div>
              <Bullet>
                <>
                  <strong className="text-[#0c1a54]">Benign formations</strong>
                  <br />
                  <span className="text-slate-500 text-[13px]">
                    (moles, angeoma, dermatofibroma, etc.)
                  </span>
                </>
              </Bullet>
              <Bullet>
                <>
                  <strong className="text-[#0c1a54]">Papilloma virus</strong>
                  <br />
                  <span className="text-slate-500 text-[13px]">
                    (warts, papillomas, mollusks, etc.)
                  </span>
                </>
              </Bullet>
            </div>
          </div>

          {/* Teal AI card */}
          <div
            className="w-full lg:w-[280px] rounded-2xl p-6 flex items-center gap-4 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #2dc8c0 0%, #22a0d0 100%)",
            }}
          >
            <p className="text-white font-semibold text-[15px] leading-snug flex-1">
              SkinX is based on Artificial Intelligence technologies
            </p>
            <AIBrainSVG />
          </div>
        </div>

        {/* TRY NOW button */}
        <div className="mt-10">
          <button
            onClick={() => navigate("/scan")}
            className="
              bg-[#e53e3e] hover:bg-[#c53030]
              text-white font-extrabold
              py-3.5 px-14
              rounded-full
              text-[13px] tracking-[0.20em] uppercase
              transition-all duration-200
              shadow-[0_4px_20px_rgba(229,62,62,0.45)]
              hover:shadow-[0_6px_28px_rgba(229,62,62,0.55)]
              hover:scale-[1.025] active:scale-[0.975]
              focus:outline-none
            "
          >
            TRY NOW!
          </button>
        </div>
      </div>

      {/* ══ 3. SKINX CAN SAVE YOUR LIFE SECTION ══════════════════════════════ */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Caution Tip Banner */}
          <div className="bg-[#f5ebe0] border border-[#e8d5c4] rounded-lg p-4 mb-16 flex items-start gap-3">
            <svg
              className="w-5 h-5 text-[#8b7355] flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-[#5d4e3e] text-sm leading-relaxed">
              <strong className="font-semibold">Tip:</strong> For more accurate
              results, please upload 3 clear photos of the same skin area taken
              under good lighting. This helps the AI analyze the spot more
              precisely.
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left: Body Illustration */}
            <div className="flex justify-center lg:justify-start">
              <div className="relative w-full max-w-[420px]">
                {/* Body figure image */}
                <img
                  src={bodyFigure}
                  alt="AI Dermatologist Body Analysis"
                  className="w-full h-auto"
                />
              </div>
            </div>

            {/* Right: Information */}
            <div>
              <h2 className="text-5xl font-bold text-[#1e293b] mb-4 leading-tight">
                SkinX can save your life
              </h2>

              <p className="text-base text-[#64748b] mb-6 leading-relaxed">
                One of the most dangerous diseases that SkinX can help identify
                is skin cancer.
              </p>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[#1e293b] mb-4">
                  Skin cancer is the most common cancer in the United States and
                  worldwide.
                </h3>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="text-green-500 text-lg flex-shrink-0 mt-0.5">
                      →
                    </span>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      More than 2 people die of skin cancer every hour all over
                      the world.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-green-500 text-lg flex-shrink-0 mt-0.5">
                      →
                    </span>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      Melanoma is a skin cancer that can spread earlier and more
                      quickly than other skin cancers.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-green-500 text-lg flex-shrink-0 mt-0.5">
                      →
                    </span>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      Melanoma is the second most common of all cancers in men
                      and women ages 15-29.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-green-500 text-lg flex-shrink-0 mt-0.5">
                      →
                    </span>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      1 in 50 people will develop skin cancer in their lifetime.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="text-green-500 text-lg flex-shrink-0 mt-0.5">
                      →
                    </span>
                    <p className="text-[#64748b] text-sm leading-relaxed">
                      When detected early, the 5-year survival rate for melanoma
                      is 99 percent.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Early Detection Section */}
          <div className="grid lg:grid-cols-2 gap-12 items-center bg-gradient-to-br from-[#f0f4f8] to-[#e8eef3] rounded-2xl p-10 lg:p-14">
            {/* Left: Call to Action */}
            <div>
              <h2 className="text-5xl font-bold text-[#1e293b] mb-5 leading-tight">
                Early Detection Saves Lives!
              </h2>

              <p className="text-base text-[#64748b] mb-8 leading-relaxed">
                Small changes can mean big problems. Few questions can reveal
                what your skin needs to stay healthy.
              </p>

              <button
                onClick={() => navigate("/quiz")}
                className="
                  bg-[#dc2626] hover:bg-[#b91c1c]
                  text-white font-bold
                  py-3.5 px-12
                  rounded-full
                  text-sm tracking-wider uppercase
                  transition-all duration-200
                  shadow-lg
                  hover:shadow-xl
                  hover:scale-105 active:scale-95
                  focus:outline-none
                "
              >
                ACT NOW
              </button>

              {/* 84% User Feedback Text */}
              <p className="text-lg text-[#64748b] mt-6 text-left">
                84% of our users find SkinX helpfull.
              </p>
            </div>

            {/* Right: Back Spot Image */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[480px]">
                {/* Back Spot Image */}
                <img
                  src={backSpot}
                  alt="Skin Analysis"
                  className="w-full h-auto rounded-2xl shadow-xl"
                />
              </div>
            </div>
          </div>

          {/* Testimonials Carousel Section */}
          <TestimonialsCarousel />

          {/* Why is SkinX worth using Section */}
          <div className="py-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1e293b] text-left mb-16">
              Why is SkinX worth using?
            </h2>

            {/* Features Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Feature 1 - Smart */}
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-sky-400 flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Smart
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  SkinX is created on the basis of artificial intelligence as a
                  result of joint work of IT specialists and doctors. Our app
                  has the same accuracy as a professional dermatologist
                </p>
              </div>

              {/* Feature 2 - Simple */}
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-sky-400 flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Simple
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Place your phone near a mole or other formation on the skin
                  and within 1 minute you will find out if there is cause for
                  concern.
                </p>
              </div>

              {/* Feature 3 - Accessible */}
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-sky-400 flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 9l2 2 4-4"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Accessible
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  SkinX is available anytime, anywhere. Keep your health in
                  check at your fingertips even when you are on the go.
                </p>
              </div>

              {/* Feature 4 - Affordable */}
              <div className="flex flex-col items-center text-center">
                {/* Icon Circle */}
                <div className="w-24 h-24 rounded-full bg-sky-400 flex items-center justify-center mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Affordable
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  SkinX's leading image analysis features come at an unbeatable
                  price, fit for any request or budget. Flexible pricing plans
                  and customizable bundles will save your practice both time and
                  money.
                </p>
              </div>
            </div>
          </div>

          {/* How to use SkinX Section */}
          <div className="py-20 bg-white">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#1e293b] text-left mb-16">
              How to use SkinX?
            </h2>

            {/* Steps Grid */}
            <div className="grid md:grid-cols-3 gap-12 mb-16">
              {/* Step 1 - Take a photo */}
              <div className="flex flex-col items-start">
                {/* Illustration */}
                <div className="relative w-full h-64 mb-6 flex items-center justify-center">
                  <img
                    src={step1TakePhoto}
                    alt="Take a photo - Keep in Focus"
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Take a photo*
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Keep zoomed at the closest distance (less than 10 cm), keep in
                  focus and center only the skin mark (without hair, wrinkles
                  and other objects)
                </p>
              </div>

              {/* Step 2 - Identify and send */}
              <div className="flex flex-col items-start">
                {/* Illustration */}
                <div className="relative w-full h-64 mb-6 flex items-center justify-center">
                  <img
                    src={step2SendPhoto}
                    alt="Identify and send - Send photo"
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Identify and send*
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Send your photo to the Artificial Intelligence. The system
                  will analyze it and send you a risk assessment.
                </p>
              </div>

              {/* Step 3 - Receive assessment */}
              <div className="flex flex-col items-start">
                {/* Illustration */}
                <div className="relative w-full h-64 mb-6 flex items-center justify-center">
                  <img
                    src={step3ReceiveResult}
                    alt="Receive your risk assessment - Save result"
                    className="w-full h-full object-contain"
                  />
                </div>

                <h3 className="text-xl font-semibold text-[#1e293b] mb-3">
                  Receive your risk assessment*
                </h3>
                <p className="text-[#64748b] text-sm leading-relaxed">
                  Get the result within 60 seconds and advice on the next steps
                  to take.
                </p>
              </div>
            </div>

            {/* Try Now Button */}
            <div className="flex justify-center mb-8">
              <button
                onClick={() => navigate("/scan")}
                className="
                  bg-[#dc2626] hover:bg-[#b91c1c]
                  text-white font-bold
                  py-4 px-16
                  rounded-full
                  text-base tracking-wide uppercase
                  transition-all duration-200
                  shadow-lg
                  hover:shadow-xl
                  hover:scale-105 active:scale-95
                  focus:outline-none
                "
              >
                Try Now!
              </button>
            </div>

            {/* Footnotes */}
            <div className="text-center space-y-1">
              <p className="text-[#94a3b8] text-xs">
                * You can take a photo on your mobile phone or upload a photo
                from your computer.
              </p>
              <p className="text-[#94a3b8] text-xs">
                ** You can view your results online or send them to your email
                address.
              </p>
            </div>
          </div>

          {/* How does AI analyze images Section */}
          <div className="py-20 bg-white">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: AI Image */}
              <div className="flex justify-center lg:justify-start">
                <img
                  src={aiImage}
                  alt="Artificial Intelligence Analysis"
                  className="w-full max-w-[500px] h-auto"
                />
              </div>

              {/* Right: Content */}
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-[#1e293b] mb-6 leading-tight">
                  How does Artificial Intelligence analyze images?
                </h2>

                <p className="text-[#64748b] text-base leading-relaxed mb-6">
                  SkinX uses a deep machine learning algorithm (AI-algorithm).
                  The human ability to learn from examples and experiences has
                  been transferred to a computer. For this purpose, the neural
                  network has been trained using a dermoscopic imaging database
                  containing tens of thousands of examples that have confirmed
                  diagnosis and assessment by dermatologists.
                </p>

                <p className="text-[#64748b] text-base leading-relaxed mb-6">
                  The AI is able to distinguish between benign and malignant
                  tumors, similar to the ABCDE rule (5 main signs of oncology:
                  asymmetry, boundary, color, diameter, and change over time).
                  The difference between them is that the algorithm can analyze
                  thousands of features, but not only 5 of them. Of course, only
                  a machine can detect that amount of evidence.
                </p>

                <p className="text-[#64748b] text-base leading-relaxed">
                  Due to the productive cooperation with doctors, the quality of
                  the algorithm performance is constantly being improved. Based
                  on growing experience and its own autonomous rules, the AI is
                  able to distinguish between benign and malignant tumors, find
                  risks of human papillomavirus, and classify different types of
                  acne...
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Section */}
          <div className="py-20 bg-white">
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1e293b] text-center mb-12 leading-tight px-4">
              You are joining more than 1 000+ people that use SkinX to keep
              their skin healthy.
            </h2>

            {/* Statistics Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
              {/* Card 1 - SkinX Users */}
              <div className="group relative bg-[#7dd3c0]/90 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="text-5xl font-bold text-white mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  1,234
                </h3>
                <p className="text-xl text-white/90 relative z-10">
                  SkinX users
                </p>
              </div>

              {/* Card 2 - Online Checks Done */}
              <div className="group relative bg-[#7dd3c0]/90 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="text-5xl font-bold text-white mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  5,678
                </h3>
                <p className="text-xl text-white/90 relative z-10">
                  Online checks done
                </p>
              </div>

              {/* Card 3 - Skin Diseases Detected */}
              <div className="group relative bg-[#7dd3c0]/90 backdrop-blur-md border border-white/30 rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <h3 className="text-5xl font-bold text-white mb-3 relative z-10 group-hover:scale-110 transition-transform duration-300">
                  234
                </h3>
                <p className="text-xl text-white/90 relative z-10">
                  Skin Diseases Detected
                </p>
              </div>
            </div>
          </div>

          {/* Footer Section */}
        </div>
      </div>

      {/* Footer Section - Full Width */}
      <div className="bg-[#364a6b] py-12">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
          {/* Footer Links */}
          <div className="flex flex-wrap justify-start gap-6 mb-8">
            <a
              href="/faq"
              className="text-white/80 hover:text-white text-sm transition-colors underline"
            >
              FAQ
            </a>
            <a
              href="/diseases-dictionary"
              className="text-white/80 hover:text-white text-sm transition-colors underline"
            >
              Diseases dictionary
            </a>
            <a
              href="/privacy-policy"
              className="text-white/80 hover:text-white text-sm transition-colors underline"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-use"
              className="text-white/80 hover:text-white text-sm transition-colors underline"
            >
              Terms of use
            </a>
            <a
              href="/cookie-policy"
              className="text-white/80 hover:text-white text-sm transition-colors underline"
            >
              Cookie Policy
            </a>
          </div>

          {/* Disclaimer */}
          <div className="text-left mb-6">
            <p className="text-white/90 text-sm mb-4">
              SkinX is not intended to perform diagnosis, but rather to provide
              users the ability to image, track, and monitor any areas of skin
              concern.
            </p>
            <p className="text-white/60 text-sm">
              If you have any questions about our AI system, contact us via
              email{" "}
              <a
                href="mailto:support@skin-x.app"
                className="text-white hover:text-white/80 underline"
              >
                support@skin-x.app
              </a>
            </p>
          </div>

          {/* Social Icons */}
          <div className="flex justify-start gap-4 mb-6">
            {/* Facebook */}
            <a
              href="#facebook"
              className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-all"
              aria-label="Facebook"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#linkedin"
              className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-all"
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>

            {/* Twitter */}
            <a
              href="#twitter"
              className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-all"
              aria-label="Twitter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="#instagram"
              className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-all"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
              </svg>
            </a>

            {/* GitHub */}
            <a
              href="https://github.com/rahmanashis01/skinX"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-white/60 rounded flex items-center justify-center text-white/80 hover:text-white hover:border-white transition-all"
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>

          {/* Copyright */}
          <div className="text-left">
            <p className="text-white/60 text-sm">
              skinX | All Rights Reserved. Copyright © 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteSection;
