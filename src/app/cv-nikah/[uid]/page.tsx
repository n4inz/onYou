import type { Metadata } from "next";
import { getConnectionRequest } from "@/lib/connection-requests";
import PublicMarriageCv from "./public-marriage-cv";

export const metadata: Metadata = {
  title: "CV Nikah | onYou",
  description: "Profil perkenalan untuk tujuan pernikahan di onYou.",
};

export default async function PublicMarriageCvPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  return <PublicMarriageCv uid={uid} request={getConnectionRequest(uid)} />;
}
