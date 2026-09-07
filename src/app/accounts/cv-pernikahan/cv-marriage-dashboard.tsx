"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  CV_PRIVACY_STORAGE_KEY,
  DEFAULT_VISIBLE_CV_FIELDS,
  DEMO_CV_UID,
  getInitials,
  MARRIAGE_CV_SECTIONS,
  MarriageCvField,
  MarriageCvFieldKey,
} from "@/lib/marriage-cv";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "../account-navigation";
import styles from "./cv-marriage-dashboard.module.css";

type Panel = "language" | "notification" | "message" | "share" | null;
type IconName = "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "cv" | "post" | "settings" | "eye" | "trend" | "download" | "share" | "edit" | "link" | "check";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></>,
    trend: <path d="m4 17 5-5 4 4 7-9M15 7h5v5"/>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5"/><path d="M5 20h14"/></>,
    share: <><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return <button type="button" className={`${styles.switch} ${checked ? styles.switchOn : ""}`} role="switch" aria-checked={checked} aria-label={label} onClick={onChange}><span/></button>;
}

function drawWrappedText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const words = text.split(/\s+/);
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
    } else line = candidate;
  }
  if (line) context.fillText(line, x, y);
  return y + lineHeight;
}

function createJpg(fields: MarriageCvField[], displayName: string) {
  const canvas = document.createElement("canvas");
  const estimatedLines = fields.reduce((total, field) => total + Math.max(1, Math.ceil(field.value.length / 58)), 0);
  canvas.width = 1400;
  canvas.height = Math.max(1900, 520 + fields.length * 92 + estimatedLines * 44);
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#F5F5F7";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#A57A1B";
  context.fillRect(0, 0, canvas.width, 22);
  context.fillStyle = "#1D1D1F";
  context.font = "700 34px Arial";
  context.fillText("onYou", 100, 110);
  context.fillStyle = "#8A681C";
  context.font = "600 20px Arial";
  context.fillText("CV NIKAH", 100, 190);
  context.fillStyle = "#1D1D1F";
  context.font = "500 70px Georgia";
  context.fillText(displayName, 100, 285);
  context.fillStyle = "#6E6E73";
  context.font = "24px Arial";
  context.fillText("Profil perkenalan untuk tujuan pernikahan", 100, 335);
  let y = 440;
  for (const section of MARRIAGE_CV_SECTIONS) {
    const sectionFields = section.fields.filter((field) => fields.some((item) => item.key === field.key));
    if (!sectionFields.length) continue;
    context.fillStyle = "#8A681C";
    context.font = "700 24px Arial";
    context.fillText(section.title.toUpperCase(), 100, y);
    y += 28;
    context.strokeStyle = "#C7C7CC";
    context.beginPath();
    context.moveTo(100, y);
    context.lineTo(1300, y);
    context.stroke();
    y += 54;
    for (const field of sectionFields) {
      context.fillStyle = "#6E6E73";
      context.font = "600 21px Arial";
      context.fillText(field.label, 100, y);
      y += 38;
      context.fillStyle = "#1D1D1F";
      context.font = "27px Arial";
      y = drawWrappedText(context, field.key === "name" ? displayName : field.value, 100, y, 1200, 40) + 28;
    }
    y += 20;
  }
  context.fillStyle = "#8E8E93";
  context.font = "20px Arial";
  context.fillText("Dibuat melalui onYou · Informasi dibagikan atas pilihan pemilik CV", 100, canvas.height - 70);
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cv-nikah-${DEMO_CV_UID}.jpg`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, "image/jpeg", 0.94);
}

export default function CvMarriageDashboard() {
  const pathname = usePathname();
  const [visible, setVisible] = useState<Set<MarriageCvFieldKey>>(new Set(DEFAULT_VISIBLE_CV_FIELDS));
  const [useInitials, setUseInitials] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const initials = getInitials(MARRIAGE_CV_SECTIONS[0].fields[0].value);
  const publicPath = `/cv-nikah/${DEMO_CV_UID}`;
  const visibleFields = useMemo(() => MARRIAGE_CV_SECTIONS.flatMap((section) => section.fields).filter((field) => visible.has(field.key)), [visible]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(CV_PRIVACY_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as { visible?: MarriageCvFieldKey[]; useInitials?: boolean };
          if (Array.isArray(parsed.visible)) setVisible(new Set(parsed.visible));
          if (typeof parsed.useInitials === "boolean") setUseInitials(parsed.useInitials);
        }
      } catch { /* Keep safe defaults when local storage is unavailable. */ }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CV_PRIVACY_STORAGE_KEY, JSON.stringify({ visible: [...visible], useInitials }));
  }, [hydrated, useInitials, visible]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleVisibility = (key: MarriageCvFieldKey) => setVisible((current) => {
    const next = new Set(current);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2600);
  };

  const copyPublicLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${publicPath}`);
    showFeedback("Tautan publik berhasil disalin.");
    setPanel(null);
  };

  const shareCv = async () => {
    const url = `${window.location.origin}${publicPath}`;
    if (navigator.share) {
      try { await navigator.share({ title: "CV Nikah", text: "Lihat CV Nikah saya di onYou", url }); } catch { return; }
    } else await copyPublicLink();
  };

  const togglePanel = (next: Exclude<Panel, null>) => setPanel((current) => current === next ? null : next);
  const shareUrl = `https://onyou.id${publicPath}`;

  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <button className={styles.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka menu akun"><Icon name="menu"/></button>
      <Link className={styles.logo} href="/feed"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
      <Link className={styles.feedLink} href="/feed">Feed</Link>
      <div className={styles.headerActions} ref={panelRef}>
        <button className={styles.language} onClick={() => togglePanel("language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={styles.iconButton} onClick={() => togglePanel("notification")} aria-label="Notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>2</i></button>
        <button className={styles.iconButton} onClick={() => togglePanel("message")} aria-label="Pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>3</i></button>
        <span className={styles.avatar}>{initials}</span>
        {panel && panel !== "share" && <div className={styles.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>✦</span><div><b>CV dilihat 18 kali</b><p>Aktivitas CV meningkat minggu ini.</p><small>10 menit lalu</small></div></div><div className={styles.notice}><span>♥</span><div><b>Profil tersimpan</b><p>Pengaturan privasi Anda sudah diperbarui.</p><small>1 jam lalu</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><button>Lihat semua</button></div><div className={styles.notice}><span>AS</span><div><b>Aulia S.</b><p>Halo, salam kenal dari saya…</p><small>8 menit lalu</small></div></div><div className={styles.notice}><span>RA</span><div><b>Rizky A.</b><p>Terima kasih sudah membalas.</p><small>Kemarin</small></div></div></>}
        </div>}
      </div>
    </div></header>

    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarTitle}><span>Menu akun</span><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><Icon name="close"/></button></div>
        <nav aria-label="Navigasi akun">{ACCOUNT_NAVIGATION.map((item) => {
          const active = isAccountNavigationActive(pathname, item.activePrefix);
          return <Link key={item.key} className={active ? styles.activeMenu : undefined} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setSidebarOpen(false)}><Icon name={item.icon}/>{item.label}{item.key === "messages" && <span>3</span>}</Link>;
        })}</nav>
        <div className={styles.sidebarInfo}><strong>Privasi di tangan Anda</strong><p>Hanya informasi yang diaktifkan yang akan tampil pada CV publik dan hasil unduhan.</p></div>
      </aside>
      {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={styles.main}>
        <div className={styles.heading}>
          <div><span>CV Nikah Saya</span><h1>Atur cerita yang ingin Anda bagikan.</h1><p>Kontrol setiap informasi yang tampil pada CV publik, tautan berbagi, dan file unduhan.</p></div>
          <div className={styles.primaryActions}><Link href="/accounts/cv-pernikahan/create?mode=edit"><Icon name="edit" size={17}/>Edit CV</Link><button onClick={() => createJpg(visibleFields, visible.has("name") ? (useInitials ? initials : MARRIAGE_CV_SECTIONS[0].fields[0].value) : "Profil onYou")}><Icon name="download" size={17}/>Unduh JPG</button></div>
        </div>

        <section className={styles.stats} aria-label="Statistik kunjungan CV">
          <div><span><Icon name="eye" size={18}/>Total dilihat</span><strong>1.284</strong><small>Sejak CV dipublikasikan</small></div>
          <div><span><Icon name="trend" size={18}/>7 hari terakhir</span><strong>126</strong><small>Rata-rata 18 orang/hari</small></div>
          <div><span><Icon name="trend" size={18}/>30 hari terakhir</span><strong>432</strong><small>Rata-rata 14 orang/hari</small></div>
        </section>

        <section className={styles.publicLink}>
          <div><span className={styles.publicIcon}><Icon name="link"/></span><div><strong>Tautan CV publik</strong><p>onyou.id{publicPath}</p></div></div>
          <div className={styles.shareActions}><Link href={publicPath} target="_blank">Lihat publik</Link><button onClick={copyPublicLink}>Salin tautan</button><button className={styles.shareButton} onClick={() => togglePanel("share")} aria-expanded={panel === "share"}><Icon name="share" size={16}/>Bagikan</button></div>
          {panel === "share" && <div className={styles.shareMenu}><strong>Bagikan CV Nikah</strong><button onClick={shareCv}><Icon name="share" size={16}/>Bagikan melalui perangkat</button><a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">X</a><a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">Facebook</a><a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noreferrer">LinkedIn</a></div>}
        </section>

        <div className={styles.visibilitySummary}><div><strong>{visible.size} dari {MARRIAGE_CV_SECTIONS.flatMap((section) => section.fields).length} informasi ditampilkan</strong><p>Perubahan tersimpan otomatis pada perangkat ini.</p></div><span><i/>Publik</span><span className={styles.privateLegend}><i/>Privat</span></div>

        <div className={styles.cvDocument}>
          <div className={styles.cvHeader}><div className={styles.monogram}>{initials}</div><div><span>CV Nikah</span><h2>{useInitials ? initials : MARRIAGE_CV_SECTIONS[0].fields[0].value}</h2><p>Product Designer · Bandung, Jawa Barat</p></div><label className={styles.initialToggle}><span><b>Gunakan inisial</b><small>Publik tampil sebagai {initials}</small></span><Switch checked={useInitials} onChange={() => setUseInitials((current) => !current)} label="Gunakan inisial nama pada CV publik"/></label></div>

          {MARRIAGE_CV_SECTIONS.map((section, sectionIndex) => <section className={styles.cvSection} key={section.title}>
            <div className={styles.sectionTitle}><span>0{sectionIndex + 1}</span><div><h3>{section.title}</h3><p>{section.description}</p></div></div>
            <div className={styles.fieldList}>{section.fields.map((field) => {
              const isVisible = visible.has(field.key);
              const shownValue = field.key === "name" && useInitials ? `${field.value} · tampil sebagai ${initials}` : field.value;
              return <div className={`${styles.fieldRow} ${isVisible ? styles.fieldVisible : styles.fieldHidden}`} key={field.key}><div><span>{field.label}</span><p>{shownValue}</p></div><div className={styles.fieldControl}><small>{isVisible ? "Publik" : "Privat"}</small><Switch checked={isVisible} onChange={() => toggleVisibility(field.key)} label={`${isVisible ? "Sembunyikan" : "Tampilkan"} ${field.label}`}/></div></div>;
            })}</div>
          </section>)}
        </div>
      </main>
    </div>
    {feedback && <div className={styles.toast} role="status"><Icon name="check" size={17}/>{feedback}</div>}
  </div>;
}
