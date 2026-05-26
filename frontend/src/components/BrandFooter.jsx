import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";

const BrandFooter = ({ compact = false, className = "" }) => {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`rounded-2xl border border-slate-200 bg-white/95 backdrop-blur shadow-sm ${
        compact ? "px-4 py-4" : "px-5 py-6"
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-20 h-12 sm:w-24 sm:h-14 bg-white rounded-lg overflow-hidden border border-slate-200 p-1.5">
            <img
              src={logoImg}
              alt="Brand logo"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xs">
            AI-assisted skin screening support with privacy-first workflow.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm text-slate-600">
          <Link className="hover:text-blue-700 transition-colors" to="/faq">
            FAQ
          </Link>
          <Link
            className="hover:text-blue-700 transition-colors"
            to="/diseases-dictionary"
          >
            Dictionary
          </Link>
          <Link
            className="hover:text-blue-700 transition-colors"
            to="/terms-of-use"
          >
            Terms
          </Link>
          <Link
            className="hover:text-blue-700 transition-colors"
            to="/privacy-policy"
          >
            Privacy
          </Link>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] sm:text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <p>
          Not a diagnosis. Consult a qualified clinician for medical decisions.
        </p>
        <p>{year} All rights reserved.</p>
      </div>
    </footer>
  );
};

export default BrandFooter;
