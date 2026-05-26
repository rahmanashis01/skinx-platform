import { useState, useRef } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import ScanPage from "./views/ScanPage";
import LandingPage from "./views/LandingPage";
import Step0_Rules from "./views/Step0_Rules";
import Step1_WideShot from "./views/Step1_WideShot";
import Step2_Reticle from "./views/Step2_Reticle";
import Step3_Metadata from "./views/Step3_Metadata";
import Step4_Results from "./views/Step4_Results";
import ResultReady from "./views/ResultReady";
import PrivacyPolicy from "./views/PrivacyPolicy";
import TermsOfUse from "./views/TermsOfUse";
import DiseasesDictionary from "./views/DiseasesDictionary";
import DiseaseDetail from "./views/DiseaseDetail";
import FAQ from "./views/FAQ";
import FAQDetail from "./views/FAQDetail";
import Register from "./views/Register";
import Login from "./views/Login";
import ForgotPassword from "./views/ForgotPassword";
import ResetPassword from "./views/ResetPassword";
import SessionWorkspace from "./views/SessionWorkspace";
import CookieConsent from "./components/CookieConsent";

import CookiePolicyPage from "./views/CookiePolicyPage";
import QuizPage from "./views/QuizPage";
import Dashboard from "./views/Dashboard";
import AuthCallback from "./views/AuthCallback";
import ChatWidget from "./components/ChatWidget";
import AIAssistantTeaser from "./components/AIAssistantTeaser";

// Wrapper component for chat widget and teaser on landing page
const ConditionalChatWidget = () => {
  const { pathname } = useLocation();
  const chatWidgetRef = useRef(null);

  if (pathname !== "/") return null;

  const handleOpenChat = () => {
    if (chatWidgetRef.current && chatWidgetRef.current.handleOpen) {
      chatWidgetRef.current.handleOpen();
    }
  };

  return (
    <>
      <ChatWidget ref={chatWidgetRef} />
      <AIAssistantTeaser onOpenChat={handleOpenChat} />
    </>
  );
};

function App() {
  // -1 = landing page, 0+ = wizard steps
  const [currentStep, setCurrentStep] = useState(-1);

  const [checkupData, setCheckupData] = useState({
    wideShot: null,
    straightShot: null,
    angledShot: null,
    patientAge: null,
    gender: null,
    country: null,
    fitzpatrickType: null,
  });

  const startCheckup = () => setCurrentStep(0);

  const nextStep = () => setCurrentStep((prev) => prev + 1);

  const updateCheckupData = (data) =>
    setCheckupData((prev) => ({ ...prev, ...data }));

  return (
    <BrowserRouter>
      <CookieConsent />
      <ConditionalChatWidget />
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/diseases-dictionary" element={<DiseasesDictionary />} />
        <Route path="/diseases/:slug" element={<DiseaseDetail />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/faq/:slug" element={<FAQDetail />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/cookie-policy" element={<CookiePolicyPage />} />
        {/* Quiz route */}
        <Route path="/quiz" element={<QuizPage />} />
        {/* Dashboard route */}
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Session routes */}
        <Route path="/session/new" element={<Dashboard />} />
        <Route path="/session/workspace" element={<SessionWorkspace />} />
        {/* Auth0 Callback route */}
        <Route path="/callback" element={<AuthCallback />} />
        {/* Test route for scanning animation */}
        <Route path="/test-scan" element={<Step4_Results />} />
        {/* Result ready page */}
        <Route path="/result-ready" element={<ResultReady />} />
        {/* Scan routes — all render same ScanPage, URL path differs by entry point */}
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/scan/try-1" element={<ScanPage />} />
        <Route path="/scan/try-2" element={<ScanPage />} />
        <Route
          path="/"
          element={
            <>
              {/* Landing page */}
              {currentStep === -1 && (
                <LandingPage onStartCheckup={startCheckup} />
              )}

              {/* Wizard steps */}
              {currentStep >= 0 && (
                <div className="bg-slate-950 text-slate-50 min-h-screen font-sans">
                  {currentStep === 0 && <Step0_Rules onNext={nextStep} />}
                  {currentStep === 1 && (
                    <Step1_WideShot
                      onNext={nextStep}
                      updateCheckupData={updateCheckupData}
                      checkupData={checkupData}
                    />
                  )}
                  {currentStep === 2 && (
                    <Step2_Reticle
                      onNext={nextStep}
                      updateCheckupData={updateCheckupData}
                      checkupData={checkupData}
                    />
                  )}
                  {currentStep === 3 && (
                    <Step3_Metadata
                      onNext={nextStep}
                      updateCheckupData={updateCheckupData}
                      checkupData={checkupData}
                    />
                  )}
                  {currentStep === 4 && (
                    <Step4_Results checkupData={checkupData} />
                  )}
                </div>
              )}
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
