import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { GoogleRegisterButton } from "./google-register-button";
import { RegisterForm } from "./register-form";
import styles from "./register.module.css";

export const metadata: Metadata = {
  title: "Daftar | onYou",
  description: "Buat akun onYou menggunakan data Anda atau akun Google.",
};

const errorMessages: Record<string, string> = {
  AccessDenied: "Akses ditolak. Pastikan akun Google Anda dapat digunakan.",
  Configuration: "Pendaftaran Google belum dikonfigurasi. Silakan coba lagi nanti.",
  OAuthCallbackError: "Google tidak dapat menyelesaikan proses pendaftaran.",
  OAuthSignin: "Tidak dapat terhubung ke Google. Silakan coba kembali.",
  Verification: "Tautan autentikasi sudah tidak berlaku.",
};

function getSafeRedirect(value?: string) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

type RegisterPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeRedirect(params.callbackUrl);
  const googleAuthConfigured = Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET,
  );
  const errorMessage = params.error
    ? (errorMessages[params.error] ??
      "Pendaftaran tidak berhasil. Silakan coba kembali.")
    : null;

  async function registerWithGoogle() {
    "use server";

    if (
      !process.env.AUTH_SECRET ||
      !process.env.AUTH_GOOGLE_ID ||
      !process.env.AUTH_GOOGLE_SECRET
    ) {
      redirect("/register?error=Configuration");
    }

    try {
      await signIn("google", { redirectTo: callbackUrl });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/register?error=${encodeURIComponent(error.type)}`);
      }
      throw error;
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.registerPanel} aria-label="Form pendaftaran">
        <div className={styles.registerContent}>
          <Link className={styles.brand} href="/" aria-label="onYou beranda">
            <Image
              src="/onyou-logo.svg"
              width={72}
              height={72}
              alt=""
              priority
            />
            <span>onYou</span>
          </Link>

          <p className={styles.step}>MULAI PERJALANAN ANDA</p>
          <h1>Buat akun onYou</h1>
          <p className={styles.description}>
            Daftar dengan data Anda atau gunakan Google untuk memulai dengan
            cepat.
          </p>

          {errorMessage ? (
            <div className={styles.alert} role="alert">
              {errorMessage}
            </div>
          ) : null}

          <RegisterForm />

          <div className={styles.separator} aria-hidden="true">
            <span>atau</span>
          </div>

          <form action={registerWithGoogle} className={styles.googleForm}>
            <GoogleRegisterButton disabled={!googleAuthConfigured} />
          </form>

          {!googleAuthConfigured && !errorMessage ? (
            <p className={styles.configurationNote} role="status">
              Pendaftaran Google tersedia setelah konfigurasi OAuth diaktifkan.
            </p>
          ) : null}

          <p className={styles.loginPrompt}>
            Sudah memiliki akun? <Link href="/login">Masuk</Link>
          </p>

          <p className={styles.terms}>
            Dengan mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan
            Privasi onYou.
          </p>

          <p className={styles.copyright}>© 2025–2026 onYou</p>
        </div>
      </section>
    </main>
  );
}
