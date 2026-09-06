import type { Metadata } from "next";
import FeedClient from "./feed-client";

export const metadata: Metadata = {
  title: "Temukan Pasangan | onYou",
  description: "Temukan seseorang dengan nilai dan tujuan hidup yang sejalan.",
};

export default function FeedPage() {
  return <FeedClient />;
}
