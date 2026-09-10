import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getConnectionRequest } from "@/lib/connection-requests";
import StageTwoClient from "./stage-two-client";

export const metadata: Metadata = {
  title: "Tahap 2 Perkenalan | onYou",
  description: "Sepakati pertukaran media atau rencana pertemuan dengan calon pasangan.",
};

export default async function StageTwoPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const request = getConnectionRequest(uid);

  if (!request) notFound();

  return <StageTwoClient request={request} />;
}
