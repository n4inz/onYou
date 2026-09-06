import type { Metadata } from "next";
import AccountsPostClient from "./accounts-post-client";

export const metadata: Metadata = {
  title: "Postingan Saya | onYou",
  description: "Kelola postingan yang telah Anda buat di onYou.",
};

export default function AccountsPostPage() {
  return <AccountsPostClient />;
}
