"use client";

import { useState, type FormEvent } from "react";
import styles from "./register.module.css";

type Message = {
  kind: "error" | "info";
  text: string;
};

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("passwordConfirmation") ?? "");

    if (password !== confirmation) {
      setMessage({
        kind: "error",
        text: "Konfirmasi password belum sama. Silakan periksa kembali.",
      });
      return;
    }

    setMessage({
      kind: "info",
      text: "Pendaftaran akun belum terhubung ke layanan pengguna. Silakan gunakan Google untuk sementara.",
    });
  }

  return (
    <form className={styles.registerForm} onSubmit={handleSubmit}>
      <div className={styles.field}>
        <label htmlFor="identity">Nama atau email</label>
        <input
          id="identity"
          name="identity"
          type="text"
          autoComplete="username"
          placeholder="Masukkan nama atau email"
          required
        />
      </div>

      <PasswordField
        id="password"
        name="password"
        label="Password"
        placeholder="Minimal 8 karakter"
        visible={showPassword}
        onToggle={() => setShowPassword((current) => !current)}
      />

      <PasswordField
        id="passwordConfirmation"
        name="passwordConfirmation"
        label="Konfirmasi password"
        placeholder="Ulangi password"
        visible={showConfirmation}
        onToggle={() => setShowConfirmation((current) => !current)}
      />

      {message ? (
        <p
          className={
            message.kind === "error"
              ? styles.formError
              : styles.formMessage
          }
          role={message.kind === "error" ? "alert" : "status"}
        >
          {message.text}
        </p>
      ) : null}

      <button className={styles.registerButton} type="submit">
        Buat akun
      </button>
    </form>
  );
}

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder: string;
  visible: boolean;
  onToggle: () => void;
};

function PasswordField({
  id,
  name,
  label,
  placeholder,
  visible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.passwordField}>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          placeholder={placeholder}
          minLength={8}
          required
        />
        <button
          type="button"
          className={styles.passwordToggle}
          onClick={onToggle}
          aria-label={visible ? `Sembunyikan ${label}` : `Tampilkan ${label}`}
          aria-pressed={visible}
        >
          <EyeIcon crossed={visible} />
        </button>
      </div>
    </div>
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
