import { useEffect, useState } from "react";
import { Download, Share2, X } from "lucide-react";

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true
  );
};

const isIosSafariBrowser = () => {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent.toLowerCase();
  const isIosDevice =
    /iphone|ipad|ipod/.test(ua) ||
    (window.navigator.platform === "MacIntel" &&
      window.navigator.maxTouchPoints > 1);
  const isWebKit = /webkit/.test(ua);
  const isOtherIosBrowser = /crios|fxios|edgios|opr|mercury/.test(ua);

  return isIosDevice && isWebKit && !isOtherIosBrowser;
};

const fallbackInstallStore = {
  getSnapshot: () => ({
    canInstall: false,
    iosSafari: false,
    standalone: false,
  }),
  subscribe: () => () => {},
  dismiss: () => {},
  promptInstall: async () => {},
};

const createInstallStore = () => {
  let deferredPrompt = null;
  let dismissed = false;
  let standalone = isStandaloneMode();
  const iosSafari = isIosSafariBrowser();
  const listeners = new Set();

  const getSnapshot = () => {
    const installed = standalone || isStandaloneMode();

    return {
      canInstall: Boolean(deferredPrompt) && !dismissed && !installed,
      iosSafari: iosSafari && !dismissed && !installed,
      standalone: installed,
    };
  };

  const notify = () => {
    listeners.forEach((listener) => listener());
  };

  const handleBeforeInstallPrompt = (event) => {
    if (isStandaloneMode() || dismissed) return;

    event.preventDefault();
    deferredPrompt = event;
    notify();
  };

  const handleAppInstalled = () => {
    deferredPrompt = null;
    standalone = true;
    dismissed = true;
    notify();
  };

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  window.addEventListener("appinstalled", handleAppInstalled);

  const mediaQuery = window.matchMedia("(display-mode: standalone)");
  const updateStandalone = () => {
    standalone = isStandaloneMode();
    notify();
  };

  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener("change", updateStandalone);
  } else {
    mediaQuery.addListener(updateStandalone);
  }

  return {
    getSnapshot,
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    dismiss() {
      dismissed = true;
      deferredPrompt = null;
      notify();
    },
    async promptInstall() {
      if (!deferredPrompt) return;

      const promptEvent = deferredPrompt;

      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;

        if (choice?.outcome === "accepted") {
          standalone = true;
        }
      } catch (error) {
        console.error("SkinX install prompt failed:", error);
      } finally {
        dismissed = true;
        deferredPrompt = null;
        notify();
      }
    },
  };
};

const getInstallStore = () => {
  if (typeof window === "undefined") return fallbackInstallStore;

  if (!window.__skinxInstallPromptStore) {
    window.__skinxInstallPromptStore = createInstallStore();
  }

  return window.__skinxInstallPromptStore;
};

const installStore = getInstallStore();

const InstallPrompt = ({ variant = "light-menu", className = "" }) => {
  const [snapshot, setSnapshot] = useState(() => installStore.getSnapshot());

  useEffect(() => {
    const unsubscribe = installStore.subscribe(() => {
      setSnapshot(installStore.getSnapshot());
    });

    return unsubscribe;
  }, []);

  const hidePrompt = () => {
    installStore.dismiss();
  };

  const handleInstall = async () => {
    await installStore.promptInstall();
  };

  const { canInstall, iosSafari, standalone } = snapshot;

  if ((!canInstall && !iosSafari) || standalone) return null;

  const isMenu = variant === "menu" || variant === "light-menu";
  const isLightMenu = variant === "light-menu";
  const shellClass = isLightMenu
    ? "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
    : isMenu
      ? "flex w-full items-center justify-between gap-2 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-left text-sm text-white/90"
      : "inline-flex items-center gap-1.5 rounded-md border border-white/30 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur transition hover:bg-white/20";
  const dismissClass = isLightMenu
    ? "rounded p-0.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
    : "rounded p-0.5 text-white/70 transition hover:bg-white/10 hover:text-white";

  if (iosSafari) {
    return (
      <div
        className={`${shellClass} ${className}`}
        title="To install SkinX: tap Share, then Add to Home Screen."
      >
        <Share2 size={isMenu ? 15 : 13} className="shrink-0" />
        <span className={isMenu ? "flex-1" : "hidden lg:inline"}>
          To install SkinX: tap Share, then Add to Home Screen.
        </span>
        {!isMenu && <span className="lg:hidden">Add to Home Screen</span>}
        <button
          type="button"
          onClick={hidePrompt}
          className={dismissClass}
          aria-label="Dismiss install instructions"
        >
          <X size={isMenu ? 15 : 13} />
        </button>
      </div>
    );
  }

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={handleInstall}
      className={`${shellClass} ${className}`}
      aria-label="Install SkinX"
    >
      <Download size={isMenu ? 15 : 13} className="shrink-0" />
      <span className={isMenu ? "flex-1" : "hidden sm:inline"}>
        Install SkinX
      </span>
    </button>
  );
};

export default InstallPrompt;
