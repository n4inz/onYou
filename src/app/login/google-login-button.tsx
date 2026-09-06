"use client";

import { useFormStatus } from "react-dom";
import styles from "./login.module.css";

type GoogleLoginButtonProps = {
  disabled?: boolean;
};

export function GoogleLoginButton({ disabled = false }: GoogleLoginButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={styles.googleButton}
      type="submit"
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
    >
      <GoogleIcon />
      <span>{pending ? "Menghubungkan ke Google…" : "Masuk dengan Google"}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg
      className={styles.googleIcon}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.23-.2-1.78h-9.2v3.33h5.4a4.7 4.7 0 0 1-2 3.04l-.02.11 2.91 2.25.2.02c1.85-1.71 2.91-4.23 2.91-6.97"
      />
      <path
        fill="#34A853"
        d="M12.2 21.8c2.65 0 4.87-.87 6.49-2.6l-3.09-2.38c-.83.56-1.94.95-3.4.95a5.9 5.9 0 0 1-5.58-4.08l-.11.01-3.03 2.35-.04.1a9.8 9.8 0 0 0 8.76 5.65"
      />
      <path
        fill="#FBBC05"
        d="M6.62 13.69a6.05 6.05 0 0 1-.32-1.92c0-.67.12-1.31.31-1.92v-.12L3.55 7.35l-.1.05a9.82 9.82 0 0 0 0 8.75z"
      />
      <path
        fill="#EA4335"
        d="M12.2 5.78c1.84 0 3.08.79 3.79 1.45l2.76-2.69A9.42 9.42 0 0 0 12.2 2a9.8 9.8 0 0 0-8.76 5.4l3.17 2.45a5.93 5.93 0 0 1 5.59-4.07"
      />
    </svg>
  );
}
