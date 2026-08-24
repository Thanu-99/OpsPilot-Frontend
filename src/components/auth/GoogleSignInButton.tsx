import { useEffect, useRef } from "react";

type GoogleSignInButtonProps = {
  text: GoogleButtonText;
  disabled?: boolean;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
};

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ??
  "146010134455-g0fud63emoqcc7evo9i5b9kqda7tf608.apps.googleusercontent.com";

const GOOGLE_SCRIPT_ID = "google-identity-services";

function GoogleSignInButton({
  text,
  disabled = false,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const credentialHandlerRef = useRef(onCredential);
  const errorHandlerRef = useRef(onError);

  useEffect(() => {
    credentialHandlerRef.current = onCredential;
    errorHandlerRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    let active = true;

    function renderGoogleButton() {
      if (!active || !window.google || !buttonContainerRef.current) {
        return;
      }

      const container = buttonContainerRef.current;
      container.replaceChildren();

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => {
          if (response.credential) {
            credentialHandlerRef.current(response.credential);
          }
        },
      });

      window.google.accounts.id.renderButton(container, {
        type: "standard",
        theme: "filled_black",
        size: "large",
        text,
        shape: "rectangular",
        logo_alignment: "left",
        width: Math.min(400, container.clientWidth || 400),
      });
    }

    if (window.google) {
      renderGoogleButton();
      return () => {
        active = false;
      };
    }

    const existingScript = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    const script = existingScript ?? document.createElement("script");

    function handleLoad() {
      renderGoogleButton();
    }

    function handleError() {
      if (active) {
        errorHandlerRef.current(
          "Google Sign-In could not load. Check your connection and try again.",
        );
      }
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    if (!existingScript) {
      script.id = GOOGLE_SCRIPT_ID;
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      active = false;
      script.removeEventListener("load", handleLoad);
      script.removeEventListener("error", handleError);
    };
  }, [text]);

  return (
    <div className="relative min-h-11 w-full overflow-hidden rounded-lg">
      <div
        ref={buttonContainerRef}
        className="flex min-h-11 w-full justify-center"
      />
      {disabled ? (
        <div className="absolute inset-0 cursor-not-allowed bg-[#111113]/65" />
      ) : null}
    </div>
  );
}

export default GoogleSignInButton;
