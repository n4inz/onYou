import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConnectionRequest } from "@/lib/connection-requests";
import MessageDetailClient from "./message-detail-client";

export const metadata: Metadata = {
  title: "Detail CV | Pesan Masuk onYou",
  description: "Lihat CV pengguna yang ingin terhubung dengan Anda.",
};

export default async function MessageDetailPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const request = getConnectionRequest(uid);

  if (!request) notFound();

  return <MessageDetailClient request={request} />;
}
