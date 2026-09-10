import type { Metadata } from "next";
import LandingClient from "./landing-client";

export const metadata: Metadata = {
  title: "onYou — Temukan yang Sejalan",
  description: "Kenali calon pasangan melalui nilai, kesiapan, dan tujuan hidup dengan proses yang lebih aman dan bermakna.",
};

export default function Home() {
  return <LandingClient />;
}
