"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CV_PRIVACY_STORAGE_KEY,
  DEFAULT_VISIBLE_CV_FIELDS,
  getInitials,
  MARRIAGE_CV_SECTIONS,
  MarriageCvFieldKey,
} from "@/lib/marriage-cv";
import styles from "./public-marriage-cv.module.css";

export default function PublicMarriageCv({ uid }: { uid: string }) {
  const [visible, setVisible] = useState<Set<MarriageCvFieldKey>>(new Set(DEFAULT_VISIBLE_CV_FIELDS));
  const [useInitials, setUseInitials] = useState(true);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(CV_PRIVACY_STORAGE_KEY);
        if (!saved) return;
        const parsed = JSON.parse(saved) as { visible?: MarriageCvFieldKey[]; useInitials?: boolean };
        if (Array.isArray(parsed.visible)) setVisible(new Set(parsed.visible));
        if (typeof parsed.useInitials === "boolean") setUseInitials(parsed.useInitials);
      } catch {
        // Public CV remains available with privacy-safe defaults.
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const fullName = MARRIAGE_CV_SECTIONS[0].fields[0].value;
  const displayName = visible.has("name") ? (useInitials ? getInitials(fullName) : fullName) : "Profil onYou";
  const publicSections = useMemo(() => MARRIAGE_CV_SECTIONS.map((section) => ({
    ...section,
    fields: section.fields.filter((field) => visible.has(field.key)),
  })).filter((section) => section.fields.length > 0), [visible]);

  return <main className={styles.page}>
    <header className={styles.header}>
      <Link href="/feed" className={styles.logo}><span>oY</span>onYou</Link>
      <Link href="/login">Masuk</Link>
    </header>
    <article className={styles.document}>
      <div className={styles.identity}>
        <div className={styles.monogram}>{visible.has("name") ? getInitials(fullName) : "oY"}</div>
        <div><span>CV Nikah</span><h1>{displayName}</h1><p>Product Designer · Bandung, Jawa Barat</p></div>
      </div>
      {publicSections.map((section, index) => <section key={section.title} className={styles.section}>
        <div className={styles.sectionTitle}><span>0{index + 1}</span><div><h2>{section.title}</h2><p>{section.description}</p></div></div>
        <dl>{section.fields.map((field) => <div key={field.key}><dt>{field.label}</dt><dd>{field.key === "name" ? displayName : field.value}</dd></div>)}</dl>
      </section>)}
      <footer><p>Informasi pada CV ini dibagikan atas pilihan pemilik profil.</p><span>onyou.id/cv-nikah/{uid}</span></footer>
    </article>
  </main>;
}
