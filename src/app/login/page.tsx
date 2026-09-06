import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { CredentialsLoginForm } from "./credentials-login-form";
import { GoogleLoginButton } from "./google-login-button";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Masuk | onYou",
  description: "Masuk ke onYou menggunakan akun Anda atau Google.",
};

const errorMessages: Record<string, string> = {
  AccessDenied: "Akses ditolak. Pastikan akun Google Anda dapat digunakan.",
  Configuration: "Login Google belum dikonfigurasi. Silakan coba lagi nanti.",
  OAuthCallbackError: "Google tidak dapat menyelesaikan proses login.",
  OAuthSignin: "Tidak dapat terhubung ke Google. Silakan coba kembali.",
  Verification: "Tautan autentikasi sudah tidak berlaku.",
};

function getSafeRedirect(value?: string) {
  if (!value?.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

type LoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const callbackUrl = getSafeRedirect(params.callbackUrl);
  const googleAuthConfigured = Boolean(
    process.env.AUTH_SECRET &&
      process.env.AUTH_GOOGLE_ID &&
      process.env.AUTH_GOOGLE_SECRET,
  );
  const errorMessage = params.error
    ? (errorMessages[params.error] ??
      "Login tidak berhasil. Silakan coba kembali.")
    : null;

  async function loginWithGoogle() {
    "use server";

    if (
      !process.env.AUTH_SECRET ||
      !process.env.AUTH_GOOGLE_ID ||
      !process.env.AUTH_GOOGLE_SECRET
    ) {
      redirect("/login?error=Configuration");
    }

    try {
      await signIn("google", { redirectTo: callbackUrl });
    } catch (error) {
      if (error instanceof AuthError) {
        redirect(`/login?error=${encodeURIComponent(error.type)}`);
      }
      throw error;
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.loginPanel} aria-label="Form login">
        <div className={styles.loginContent}>
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

          <p className={styles.step}>SELAMAT DATANG KEMBALI</p>
          <h2>Masuk ke onYou</h2>
          <p className={styles.description}>
            Gunakan akun Anda atau lanjutkan dengan Google untuk masuk secara
            cepat dan aman.
          </p>

          {errorMessage ? (
            <div className={styles.alert} role="alert">
              {errorMessage}
            </div>
          ) : null}

          <CredentialsLoginForm />

          <div className={styles.separator} aria-hidden="true">
            <span>atau</span>
          </div>

          <form action={loginWithGoogle} className={styles.googleForm}>
            <GoogleLoginButton disabled={!googleAuthConfigured} />
          </form>

          {!googleAuthConfigured && !errorMessage ? (
            <p className={styles.configurationNote} role="status">
              Login Google akan tersedia setelah konfigurasi OAuth diaktifkan.
            </p>
          ) : null}

          <div className={styles.trustNote}>
            <ShieldIcon />
            <p>
              onYou hanya menggunakan informasi dasar akun untuk autentikasi dan
              tidak pernah membagikan data Anda tanpa izin.
            </p>
          </div>

          <p className={styles.terms}>
            Dengan masuk, Anda menyetujui Ketentuan Layanan dan Kebijakan
            Privasi onYou.
          </p>

          <p className={styles.copyright}>© 2025–2026 onYou</p>
        </div>
      </section>
    </main>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3 5.5 5.7v5.6c0 4.3 2.6 7.9 6.5 9.7 3.9-1.8 6.5-5.4 6.5-9.7V5.7L12 3Z" />
      <path d="m9.3 12 1.7 1.7 3.8-4" />
    </svg>
  );
}
