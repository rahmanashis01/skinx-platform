import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import quiz1 from "../assets/quiz-1.jpeg";
import quiz2 from "../assets/quiz-2.jpeg";
import quiz3 from "../assets/quiz-3.jpeg";
import quiz4 from "../assets/quiz-4.jpeg";
import quiz5 from "../assets/quiz-5.jpeg";
import quiz6 from "../assets/quiz-6.jpeg";
import quiz7 from "../assets/quiz-7.jpeg";

/* ─── Quiz data ─────────────────────────────────────────────────────────── */
const QUESTIONS = [
  {
    image: quiz1,
    question:
      "Are there any spots on your skin that stand out or look different from others?",
    options: ["Yes, several", "I'm not sure", "No, none that I've noticed"],
    tip: 'Sometimes, the "ugly duckling" mole is the one to watch out for.',
  },
  {
    image: quiz2,
    question: "Are you aware of any moles located in hard-to-see areas?",
    options: ["Yes", "Not sure", "No"],
    tip: "Moles in these areas are at higher risk of damage and should be monitored closely.",
  },
  {
    image: quiz3,
    question:
      "Have you ever accidentally caused mechanical damage to any of your moles?",
    options: ["Yes, multiple times", "Yes, but only once", "No, never"],
    tip: "Injuries raise the risk of complications, so regular check-ups are crucial.",
  },
  {
    image: quiz4,
    question: "Have you ever had a mole that seemed to suddenly appear?",
    options: [
      "Yes, recently",
      "Maybe, but I'm unsure",
      "No, none that I've noticed",
    ],
    tip: "New moles, especially in adulthood after the age of 25, could be a red flag.",
  },
  {
    image: quiz5,
    question: "Do you have a family history of skin cancer?",
    options: [
      "Yes, multiple relatives",
      "Not that I know of",
      "No, no history",
    ],
    tip: "If a close relative has had skin cancer, your risk of developing it can double or even triple.",
  },
  {
    image: quiz6,
    question:
      "When was the last time you checked your skin for any unusual changes or spots?",
    options: [
      "Recently, few months ago",
      "Maybe last year",
      "I can't remember",
    ],
    tip: "Neglecting skin checks can be fatal; over 90% of skin cancers are treatable if found early.",
  },
  {
    image: quiz7,
    question:
      "What's your main focus for skin monitoring? Let's work on it together!",
    options: [
      "Detecting risks early",
      "Tracking changes over time",
      "Maintaining healthy skin",
    ],
    tip: "Regular monitoring helps catch early signs and gives you the best chance at healthy skin.",
  },
];

const REVIEWS = [
  {
    name: "Arif Rahman",
    text: "Best tool to recognise syphilis",
    stars: 4,
  },
  {
    name: "Sadia Islam",
    text: "The best medical app on earth. just try it",
    stars: 5,
  },
  {
    name: "Tanvir Ahmed",
    text: "SkinX helped me catch a suspicious mole early!",
    stars: 5,
  },
];

/* ─── Injected CSS ──────────────────────────────────────────────────────── */
const STYLES = `
  @keyframes quizSlideIn {
    from {
      transform: translateX(72px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes quizFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .quiz-card-enter {
    animation: quizSlideIn 0.38s cubic-bezier(0.22, 0.68, 0, 1.2) both;
  }

  .quiz-tip-enter {
    animation: quizFadeIn 0.38s ease 0.12s both;
  }

  .quiz-opt-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 13px 16px;
    border: 1.5px solid #d5ddf0;
    border-radius: 12px;
    background: #ffffff;
    cursor: pointer;
    text-align: left;
    gap: 12px;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.12s ease;
  }

  .quiz-opt-btn:hover {
    background: #f0f4ff;
    border-color: #7896e0;
  }

  .quiz-opt-btn:active {
    transform: scale(0.975);
    background: #e6edff;
  }

  .quiz-next-btn {
    width: 100%;
    padding: 15px;
    background: #5b7fe8;
    color: white;
    font-weight: 700;
    font-size: 16px;
    border-radius: 50px;
    border: none;
    cursor: pointer;
    transition: background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease;
    box-shadow: 0 4px 16px rgba(91,127,232,0.4);
  }

  .quiz-next-btn:hover {
    background: #4a6fd4;
    box-shadow: 0 6px 22px rgba(91,127,232,0.5);
    transform: scale(1.015);
  }

  .quiz-next-btn:active {
    transform: scale(0.975);
  }
`;

/* ─── Sub-components ────────────────────────────────────────────────────── */
const Stars = ({ count }) => (
  <div style={{ display: "flex", gap: "3px" }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <span
        key={n}
        style={{
          fontSize: "20px",
          color: n <= count ? "#f5a623" : "#d1d5db",
          lineHeight: 1,
        }}
      >
        ★
      </span>
    ))}
  </div>
);

const AIBadge = () => (
  <div
    style={{
      position: "absolute",
      bottom: "14px",
      left: "14px",
      background: "white",
      borderRadius: "10px",
      padding: "5px 10px 5px 8px",
      display: "flex",
      alignItems: "center",
      gap: "7px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.18)",
    }}
  >
    <div
      style={{
        width: "26px",
        height: "26px",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #4a7fd4 0%, #6aaaf0 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {/* simple skin/scan icon */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="12" r="3" />
        <path
          d="M3 9V5a2 2 0 012-2h4M3 15v4a2 2 0 002 2h4M21 9V5a2 2 0 00-2-2h-4M21 15v4a2 2 0 01-2 2h-4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
    <div>
      <div
        style={{
          fontSize: "11px",
          fontWeight: "700",
          color: "#1e293b",
          lineHeight: 1.2,
        }}
      >
        SkinX
      </div>
      <div style={{ fontSize: "9px", color: "#64748b", lineHeight: 1.2 }}>
        Skin Scanner
      </div>
    </div>
  </div>
);

/* ─── Reviews Screen ────────────────────────────────────────────────────── */
const ReviewsScreen = () => {
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const review = REVIEWS[idx];

  // Auto-advance every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIdx((prev) => (prev + 1) % REVIEWS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #7da5e8 0%, #a8d5f5 100%)",
        padding: "48px 24px 40px",
      }}
    >
      <div style={{ maxWidth: "540px", margin: "0 auto" }}>
        {/* Heading */}
        <h1
          style={{
            fontSize: "26px",
            fontWeight: "800",
            color: "#1e293b",
            lineHeight: 1.3,
            marginBottom: "28px",
          }}
        >
          84% of our users find SkinX helpfull.
        </h1>

        {/* Review card — re-mounts on index change for fade effect */}
        <div
          key={idx}
          className="quiz-card-enter"
          style={{
            border: "1.5px solid #e5e7eb",
            borderRadius: "16px",
            padding: "22px 24px",
            marginBottom: "22px",
            background: "white",
          }}
        >
          <p
            style={{
              fontWeight: "700",
              fontSize: "16px",
              color: "#1e293b",
              marginBottom: "8px",
            }}
          >
            {review.name}
          </p>
          <p
            style={{
              color: "#4b5563",
              fontSize: "15px",
              marginBottom: "14px",
              lineHeight: 1.5,
            }}
          >
            {review.text}
          </p>
          <Stars count={review.stars} />
        </div>

        {/* Dot indicators */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "36px",
          }}
        >
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
                background: i === idx ? "#5b7fe8" : "#c5cde8",
                transition: "background 0.2s",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* View Result button → /scan */}
        <button
          onClick={() => navigate("/scan")}
          style={{
            width: "100%",
            padding: "15px",
            background: "#dc2626",
            color: "white",
            fontWeight: "700",
            fontSize: "16px",
            borderRadius: "50px",
            border: "none",
            cursor: "pointer",
            transition:
              "background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease",
            boxShadow: "0 4px 16px rgba(220,38,38,0.4)",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#b91c1c";
            e.target.style.boxShadow = "0 6px 22px rgba(220,38,38,0.5)";
            e.target.style.transform = "scale(1.015)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "#dc2626";
            e.target.style.boxShadow = "0 4px 16px rgba(220,38,38,0.4)";
            e.target.style.transform = "scale(1)";
          }}
          onMouseDown={(e) => {
            e.target.style.transform = "scale(0.975)";
          }}
          onMouseUp={(e) => {
            e.target.style.transform = "scale(1.015)";
          }}
        >
          View Result
        </button>
      </div>
    </div>
  );
};

/* ─── Main QuizPage ─────────────────────────────────────────────────────── */
const QuizPage = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [cardKey, setCardKey] = useState(0);
  const [showReviews, setShowReviews] = useState(false);

  const handleAnswer = () => {
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setCardKey((prev) => prev + 1);
    } else {
      setShowReviews(true);
    }
  };

  if (showReviews) {
    return (
      <>
        <style>{STYLES}</style>
        <ReviewsScreen />
      </>
    );
  }

  const q = QUESTIONS[currentQ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #5b7fe8 0%, #89a8ef 100%)",
        padding: "20px 16px 32px",
      }}
    >
      <style>{STYLES}</style>

      {/* Progress bar */}
      <div
        style={{
          maxWidth: "520px",
          margin: "0 auto 16px auto",
          display: "flex",
          gap: "5px",
        }}
      >
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "5px",
              borderRadius: "3px",
              background: i <= currentQ ? "#4a7fd4" : "#b8c5e0",
              transition: "background 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        key={cardKey}
        className="quiz-card-enter"
        style={{
          maxWidth: "520px",
          margin: "0 auto 12px auto",
          background: "white",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative" }}>
          <img
            src={q.image}
            alt={`Question ${currentQ + 1}`}
            style={{
              width: "100%",
              height: "260px",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
            }}
          />
          <AIBadge />
        </div>

        {/* Question + Options */}
        <div style={{ padding: "22px 20px 22px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#2d3a7c",
              textAlign: "center",
              lineHeight: 1.45,
              marginBottom: "20px",
            }}
          >
            {q.question}
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {q.options.map((opt, i) => (
              <button key={i} className="quiz-opt-btn" onClick={handleAnswer}>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "#8898c8",
                    width: "18px",
                    flexShrink: 0,
                  }}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontSize: "15px",
                    color: "#2d3a7c",
                    fontWeight: "500",
                  }}
                >
                  {opt}
                </span>
                <ChevronRight size={17} color="#9baacf" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tip box */}
      {q.tip && (
        <div
          key={`tip-${cardKey}`}
          className="quiz-tip-enter"
          style={{
            maxWidth: "520px",
            margin: "0 auto",
            background: "#8fa8d8",
            borderRadius: "16px",
            padding: "16px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          {/* Chat bubble icon */}
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </div>
          <p
            style={{
              color: "white",
              fontSize: "14px",
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {q.tip}
          </p>
        </div>
      )}
    </div>
  );
};

export default QuizPage;
