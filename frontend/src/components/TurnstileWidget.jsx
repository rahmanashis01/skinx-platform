import React, { useCallback } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;
let warnedMissingKey = false;

const TurnstileWidget = ({ onVerify, onExpire, onError, className = "" }) => {
  const handleSuccess = useCallback(
    (token) => {
      if (typeof token === "string" && token.length > 0) {
        onVerify(token);
      }
    },
    [onVerify],
  );

  if (!SITE_KEY) {
    if (!warnedMissingKey) {
      // eslint-disable-next-line no-console
      console.warn(
        "Turnstile disabled: VITE_TURNSTILE_SITE_KEY is not set. " +
          "Set it in .env.local for development or .env.production for production builds.",
      );
      warnedMissingKey = true;
    }
    return null;
  }

  return (
    <div className={`flex justify-center my-2 ${className}`}>
      <Turnstile
        siteKey={SITE_KEY}
        onSuccess={handleSuccess}
        onExpire={onExpire}
        onError={onError}
        options={{ theme: "light", size: "normal" }}
      />
    </div>
  );
};

export default TurnstileWidget;
