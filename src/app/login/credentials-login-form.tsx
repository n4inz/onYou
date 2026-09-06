"use client";

import { useState, type FormEvent } from "react";
import styles from "./login.module.css";

export function CredentialsLoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(
      "Login akun belum terhubung ke layanan pengguna. Silakan gunakan Google untuk sementara.",
    );
  }

  return (
    <form className={styles.credentialsForm} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="identity">Email atau nama pengguna</label>
        <input
          id="identity"
          name="identity"
          type="text"
          autoComplete="username"
          placeholder="contoh@email.com"
          required
        />
      </div>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="password">Password</label>
          <a href="#forgot-password">Lupa password?</a>
        </div>
        <div className={styles.passwordField}>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Masukkan password"
            minLength={8}
            required
          />
          <button
            type="button"
            className={styles.passwordToggle}
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
            aria-pressed={showPassword}
          >
            <EyeIcon crossed={showPassword} />
          </button>
        </div>
      </div>

      {message ? (
        <p className={styles.credentialMessage} role="status">
          {message}
        </p>
      ) : null}

      <button className={styles.loginButton} type="submit">
        Masuk
      </button>
    </form>
  );
}

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2.5 12s3.4-5 9.5-5 9.5 5 9.5 5-3.4 5-9.5 5-9.5-5-9.5-5Z" />
      <circle cx="12" cy="12" r="2.4" />
      {crossed ? <path d="m4 4 16 16" /> : null}
    </svg>
  );
}
