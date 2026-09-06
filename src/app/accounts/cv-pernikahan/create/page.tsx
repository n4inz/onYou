import type { Metadata } from "next";
import CvMarriageForm from "./cv-marriage-form";

export const metadata: Metadata = {
  title: "Buat CV Pernikahan | onYou",
  description: "Lengkapi CV Pernikahan Anda secara bertahap.",
};

export default function CreateMarriageCvPage() {
  return <CvMarriageForm />;
}
