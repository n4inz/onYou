import type { Metadata } from "next";
import MessagesClient from "./messages-client";

export const metadata: Metadata = {
  title: "Pesan Masuk | onYou",
  description: "Kelola permintaan koneksi dari pengguna onYou.",
};

export default function MessagesPage() {
  return <MessagesClient />;
}
