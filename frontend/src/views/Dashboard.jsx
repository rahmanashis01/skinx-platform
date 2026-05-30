import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Settings,
  HelpCircle,
  FileText,
  ChevronRight,
  Home,
  MessageCircle,
  Globe,
  BarChart2,
  LogOut,
  ChevronDown,
} from "lucide-react";
import logoImg from "../assets/logo.png";
import InstallPrompt from "../components/InstallPrompt";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIN_TONES = [
  { type: 1, label: "Type 1 (Very Fair)", color: "#f5deb3" },
  { type: 2, label: "Type 2 (Fair)", color: "#d4a96a" },
  { type: 3, label: "Type 3 (Light Brown)", color: "#c68642" },
  { type: 4, label: "Type 4 (Moderate Brown)", color: "#8b5e3c" },
  { type: 5, label: "Type 5 (Dark Brown)", color: "#5c3317" },
  { type: 6, label: "Type 6 (Deeply Pigmented)", color: "#2c1503" },
];

const REGIONS = [
  "Europe",
  "Asia",
  "North America",
  "South America",
  "Africa",
  "Middle East",
  "Oceania",
  "Central Asia",
  "South Asia",
  "Southeast Asia",
  "East Asia",
];

const GENDERS = ["Male", "Female"];

const BODY_AREAS = [
  "Face",
  "Neck",
  "Scalp",
  "Left Shoulder",
  "Right Shoulder",
  "Left Arm (Upper)",
  "Right Arm (Upper)",
  "Left Arm (Lower)",
  "Right Arm (Lower)",
  "Left Hand",
  "Right Hand",
  "Chest",
  "Back (Upper)",
  "Back (Lower)",
  "Abdomen",
  "Left Hip",
  "Right Hip",
  "Left Thigh",
  "Right Thigh",
  "Left Knee",
  "Right Knee",
  "Left Leg (Lower)",
  "Right Leg (Lower)",
  "Left Foot",
  "Right Foot",
  "Private Area",
  "Other",
];

// ─── Scrolling Welcome Banner ─────────────────────────────────────────────────

const WelcomeBanner = ({ userName }) => {
  const chunk = `   Welcome, ${userName}! 🎉  We're glad to have you here   `;
  const text = chunk.repeat(6);
  return (
    <div className="overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl mx-4 mt-3 py-3">
      <div
        style={{
          animation: "marquee 22s linear infinite",
          display: "inline-block",
          whiteSpace: "nowrap",
        }}
        className="text-white font-semibold text-base"
      >
        {text}
      </div>
    </div>
  );
};

// ─── Home Tab ─────────────────────────────────────────────────────────────────

const HomeTab = ({ navigate, userName, setActiveTab }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const cards = [
    {
      bg: "linear-gradient(135deg,#1a1f3a 0%,#2a2f54 100%)",
      title: "Ask AI Consultant!",
      desc: "You can ask about your result online.",
      emoji: "🤖",
    },
    {
      bg: "linear-gradient(135deg,#12342a 0%,#1a4d38 100%)",
      title: "Early Detection Saves Lives",
      desc: "Regular skin checks help catch issues early.",
      emoji: "🔬",
    },
  ];

  useEffect(() => {
    const t = setInterval(
      () => setCarouselIndex((p) => (p + 1) % cards.length),
      3500,
    );
    return () => clearInterval(t);
  }, [cards.length]);

  return (
    <div className="pb-28 space-y-4 px-4 pt-2">
      <WelcomeBanner userName={userName} />

      <p className="text-white/90 font-semibold text-center text-base pt-1">
        So, what will you get?
      </p>

      {/* Carousel */}
      <div>
        <div
          className="rounded-2xl p-5 flex items-center justify-between min-h-[110px] transition-all duration-500"
          style={{ background: cards[carouselIndex].bg }}
        >
          <div className="flex-1 pr-4">
            <h3 className="text-white font-bold text-xl mb-1">
              {cards[carouselIndex].title}
            </h3>
            <p className="text-white/70 text-sm">{cards[carouselIndex].desc}</p>
          </div>
          <span className="text-5xl">{cards[carouselIndex].emoji}</span>
        </div>
        <div className="flex justify-center gap-2 mt-2.5">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => setCarouselIndex(i)}
              className={`rounded-full transition-all duration-300 ${
                i === carouselIndex
                  ? "w-6 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* In-Depth Analysis */}
      <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <BarChart2 size={22} className="text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">
            Get In-Depth Analysis
          </p>
          <p className="text-gray-500 text-xs">Based on multiple results</p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={() => setActiveTab("session")}
        className="w-full py-4 rounded-full font-bold text-white text-sm tracking-widest shadow-lg active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(135deg,#2044c8 0%,#1832a8 100%)",
        }}
      >
        SCAN NOW
      </button>

      {/* Tip */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
        <span className="text-amber-500 mt-0.5 flex-shrink-0">ℹ️</span>
        <p className="text-amber-800 text-xs leading-relaxed">
          <span className="font-semibold">Tip:</span> For more accurate results,
          please upload 3 clear photos of the same skin area taken under good
          lighting. This helps the AI analyze the spot more precisely.
        </p>
      </div>

      {/* Doctor Appointment */}
      <p className="text-white font-semibold text-center text-base pt-1">
        Scheduled a doctor&apos;s appointment?
      </p>

      {/* Skin Report Card */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: "linear-gradient(135deg,#1e3a8a 0%,#1e40af 100%)",
          }}
        >
          <h3 className="text-white font-bold text-base">
            Skin Report for Your Doctor
          </h3>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 ml-3">
            <span className="text-xl">👨‍⚕️</span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-gray-700 font-semibold text-sm mb-3">
            Make sure to provide:
          </p>
          <ul className="space-y-1.5">
            {[
              "AI skin analysis & results",
              "High-quality photos of your skin issue",
              "Medical-style questionnaire answers",
            ].map((item) => (
              <li
                key={item}
                className="text-gray-600 text-sm flex items-start gap-2"
              >
                <span className="text-blue-400 mt-0.5">·</span> {item}
              </li>
            ))}
          </ul>
          <button className="mt-4 w-full border border-blue-200 rounded-full py-2.5 text-blue-700 font-medium text-sm flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors">
            Read more <ChevronDown size={16} />
          </button>
        </div>
      </div>

      {/* Diseases Dictionary */}
      <div
        className="rounded-2xl p-5 flex items-center justify-between shadow-sm cursor-pointer active:scale-[0.98] transition-transform"
        style={{
          background: "linear-gradient(135deg,#20b2aa 0%,#159c95 100%)",
        }}
        onClick={() => navigate("/diseases-dictionary")}
      >
        <div>
          <h3 className="text-white font-bold text-base">
            Diseases Dictionary
          </h3>
          <p className="text-white/80 text-sm mt-0.5">
            Read more about several skin diseases
          </p>
        </div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 ml-4">
          <span className="text-2xl">📋</span>
        </div>
      </div>

      {/* Other */}
      <div>
        <p className="text-white font-semibold text-sm mb-2">Other</p>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm divide-y divide-gray-100">
          {[
            {
              icon: <Settings size={17} className="text-purple-500" />,
              bg: "bg-purple-50",
              label: "Settings",
              action: () => {},
            },
            {
              icon: <HelpCircle size={17} className="text-purple-500" />,
              bg: "bg-purple-50",
              label: "FAQ",
              action: () => navigate("/faq"),
            },
            {
              icon: <FileText size={17} className="text-green-500" />,
              bg: "bg-green-50",
              label: "Terms of use",
              action: () => navigate("/terms-of-use"),
            },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center`}
                >
                  {item.icon}
                </div>
                <span className="text-gray-800 font-medium text-sm">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={17} className="text-gray-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Session Tab ──────────────────────────────────────────────────────────────

const SessionTab = ({ navigate }) => {
  const [selectedSkinTone, setSelectedSkinTone] = useState(null);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    age: "",
    region: "",
    gender: "",
    bodyArea: "",
  });

  const [sessions, setSessions] = useState(() => {
    try {
      const userId = localStorage.getItem("userId") || "default_user";
      const allSessions = JSON.parse(
        localStorage.getItem("skinx_sessions") || "[]",
      );
      // Filter sessions to only show current user's sessions
      return allSessions.filter((session) => session.userId === userId);
    } catch {
      return [];
    }
  });

  const setField = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: "" }));
  };

  const validate = () => {
    const e = {};
    if (
      !formData.age ||
      isNaN(formData.age) ||
      +formData.age < 1 ||
      +formData.age > 120
    )
      e.age = "Enter a valid age (1–120)";
    if (!formData.region) e.region = "Please select a region";
    if (!formData.gender) e.gender = "Please select a gender";
    if (!selectedSkinTone) e.skinTone = "Please select your skin tone";
    if (!formData.bodyArea) e.bodyArea = "Please select a body area";
    return e;
  };

  const handleCreate = () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const userId = localStorage.getItem("userId") || "default_user";
    const skinToneData = SKIN_TONES.find((t) => t.type === selectedSkinTone);
    const session = {
      id: Date.now(),
      userId: userId, // Add userId to isolate sessions per user
      age: formData.age,
      region: formData.region,
      gender: formData.gender,
      bodyArea: formData.bodyArea,
      skinTone: skinToneData,
      date: new Date().toLocaleString(),
      scans: 0,
    };

    // Get all sessions and add the new one
    const allSessions = JSON.parse(
      localStorage.getItem("skinx_sessions") || "[]",
    );
    const updated = [session, ...allSessions];
    localStorage.setItem("skinx_sessions", JSON.stringify(updated));
    localStorage.setItem("currentSession", JSON.stringify(session));

    // Update state with only current user's sessions
    setSessions([session, ...sessions]);
    navigate("/session/workspace");
  };

  return (
    <div className="pb-28 px-4 pt-4 space-y-4">
      {/* ── All-in-One Session Form ── */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">
              Start New Skin Session
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              Intake, scan history are saved per session in local storage.
            </p>
          </div>

          {/* Age */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={120}
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setField("age", e.target.value)}
              className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 ${errors.age ? "border-red-400" : "border-gray-200"}`}
            />
            {errors.age && (
              <p className="text-red-500 text-xs mt-1">{errors.age}</p>
            )}
          </div>

          {/* Region */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Region <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.region}
                onChange={(e) => setField("region", e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white pr-8 ${errors.region ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Select region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            {errors.region && (
              <p className="text-red-500 text-xs mt-1">{errors.region}</p>
            )}
          </div>

          {/* Gender */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.gender}
                onChange={(e) => setField("gender", e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white pr-8 ${errors.gender ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>

          {/* Skin Tone */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Skin tone <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {SKIN_TONES.map((tone) => (
                <button
                  key={tone.type}
                  onClick={() => {
                    setSelectedSkinTone(tone.type);
                    setErrors((p) => ({ ...p, skinTone: "" }));
                  }}
                  className={`flex flex-col items-center border-2 rounded-xl p-3 transition-all ${
                    selectedSkinTone === tone.type
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 mb-2 flex items-center justify-center self-start ${
                      selectedSkinTone === tone.type
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedSkinTone === tone.type && (
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl shadow-inner mb-2"
                    style={{ backgroundColor: tone.color }}
                  />
                  <p className="text-gray-700 text-[10px] text-center leading-tight font-medium">
                    {tone.label}
                  </p>
                </button>
              ))}
            </div>
            {errors.skinTone && (
              <p className="text-red-500 text-xs mt-1">{errors.skinTone}</p>
            )}
          </div>

          {/* Body Region */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1">
              Body region <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.bodyArea}
                onChange={(e) => setField("bodyArea", e.target.value)}
                className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 appearance-none bg-white pr-8 ${errors.bodyArea ? "border-red-400" : "border-gray-200"}`}
              >
                <option value="">Body region</option>
                {BODY_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
            {errors.bodyArea && (
              <p className="text-red-500 text-xs mt-1">{errors.bodyArea}</p>
            )}
          </div>

          {/* Create Session */}
          <button
            onClick={handleCreate}
            className="w-full py-3.5 rounded-full text-white font-semibold text-sm flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg,#20b2aa 0%,#159c95 100%)",
            }}
          >
            + Create New Session
          </button>
        </div>

        {/* Recent Sessions */}
        {sessions.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 text-sm mb-3">
              Recent Sessions
            </h3>
            <div className="space-y-2">
              {sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    localStorage.setItem("currentSession", JSON.stringify(s));
                    navigate("/session/workspace");
                  }}
                  className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <p className="text-gray-800 font-medium text-sm">
                    {s.region} · {s.skinTone?.label}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {s.date} · {s.scans} scans
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Dashboard Navbar ─────────────────────────────────────────────────────────

const DashboardNavbar = ({ user, onLogout, navigate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const userName = localStorage.getItem("userName") || user?.name || "User";
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <nav className="sticky top-0 z-40 bg-white/10 backdrop-blur-md border-b border-white/10 px-3 py-2 flex items-center justify-between">
      {/* Logo */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        <div className="w-12 h-8 bg-white rounded-lg overflow-hidden shadow flex items-center justify-center p-1">
          <img
            src={logoImg}
            alt="SkinX"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-none">SkinX</p>
          <p className="text-white/60 text-[9px] leading-none mt-1">
            Skin Cancer Detector
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button className="text-white/80 text-xs flex items-center gap-1 hover:text-white transition-colors">
          <Globe size={13} /> Lang: EN
        </button>
        <button
          onClick={() => navigate("/faq")}
          className="text-white/80 text-xs hover:text-white transition-colors hidden sm:block"
        >
          FAQ
        </button>
        <button
          onClick={() => navigate("/diseases-dictionary")}
          className="text-white/80 text-xs hover:text-white transition-colors hidden sm:block"
        >
          Diseases dictionary
        </button>

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((p) => !p)}
            className="w-8 h-8 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full flex items-center justify-center text-white font-bold text-xs transition-colors"
          >
            {initials}
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-11 bg-white rounded-2xl shadow-xl border border-gray-100 w-48 py-1 z-50">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-gray-800 font-semibold text-sm truncate">
                    {userName}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {user?.email || localStorage.getItem("userEmail") || ""}
                  </p>
                </div>
                <InstallPrompt variant="light-menu" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-2.5 text-red-500 text-sm hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

// ─── Bottom Nav ───────────────────────────────────────────────────────────────

const BottomNav = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 safe-area-bottom">
    <div className="max-w-lg mx-auto flex">
      {[
        { key: "home", label: "Home", icon: <Home size={20} /> },
        { key: "session", label: "Session", icon: <MessageCircle size={20} /> },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`relative flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
            activeTab === tab.key
              ? "text-teal-500"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab.icon}
          <span className="text-xs font-medium">{tab.label}</span>
          {activeTab === tab.key && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-teal-500 rounded-full" />
          )}
        </button>
      ))}
    </div>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate();
  const { logout: auth0Logout, isAuthenticated, user } = useAuth0();
  const [activeTab, setActiveTab] = useState("home");

  const userName =
    localStorage.getItem("userName") ||
    user?.name ||
    user?.given_name ||
    "User";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login");
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("currentSession");
    if (isAuthenticated) {
      auth0Logout({
        logoutParams: { returnTo: window.location.origin + "/login" },
      });
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className="min-h-screen relative"
      style={{
        background:
          "radial-gradient(ellipse at 30% 20%, #5b6ee8 0%, #3b52d8 35%, #2640c0 70%, #1a30a8 100%)",
      }}
    >
      <DashboardNavbar
        user={user}
        onLogout={handleLogout}
        navigate={navigate}
      />

      <div className="max-w-lg mx-auto">
        {activeTab === "home" && (
          <HomeTab
            navigate={navigate}
            userName={userName}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "session" && <SessionTab navigate={navigate} />}
      </div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <style>{`
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
