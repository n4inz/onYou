import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConnectionRequest } from "@/lib/connection-requests";
import StageThreeClient from "./stage-three-client";

export const metadata: Metadata = {
  title: "Tahap 3 Keputusan Bersama | onYou",
  description: "Tahap keputusan bersama setelah proses perkenalan lanjutan selesai.",
};

export default async function StageThreePage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const request = getConnectionRequest(uid);
  if (!request) notFound();

  return <StageThreeClient request={request} />;
}
