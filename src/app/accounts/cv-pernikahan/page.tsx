import type { Metadata } from "next";
import CvMarriageDashboard from "./cv-marriage-dashboard";

export const metadata: Metadata = {
  title: "CV Nikah Saya | onYou",
  description: "Kelola visibilitas, statistik, dan tautan publik CV Nikah Anda.",
};

export default function CvMarriagePage() {
  return <CvMarriageDashboard />;
}
