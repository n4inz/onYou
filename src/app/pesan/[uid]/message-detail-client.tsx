"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "@/app/accounts/account-navigation";
import {
  CONNECTION_REQUESTS,
  CONNECTION_REVIEW_STORAGE_KEY,
  CONNECTION_STATUS_STORAGE_KEY,
  ConnectionRequest,
  ConnectionReviewState,
  ConnectionStatus,
  getConnectionCvSections,
  getDisplayName,
} from "@/lib/connection-requests";
import { MarriageCvFieldKey } from "@/lib/marriage-cv";
import styles from "../messages.module.css";

type Panel = "language" | "notification" | "message" | null;
type IconName = "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "cv" | "post" | "settings" | "location" | "user" | "arrow" | "lock" | "check" | "x" | "exchange";

const EMPTY_REVIEW: ConnectionReviewState = { requestedFields: [], reviewSubmitted: false };

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, close: <path d="m6 6 12 12M18 6 6 18"/>, x: <path d="m6 6 12 12M18 6 6 18"/>, check: <path d="m5 12 4 4L19 6"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>, arrow: <path d="m9 18 6-6-6-6"/>,
    cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    exchange: <><path d="M4 7h14m-3-3 3 3-3 3M20 17H6m3 3-3-3 3-3"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function readStatuses() {
  try {
    const saved = localStorage.getItem(CONNECTION_STATUS_STORAGE_KEY);
    return saved ? JSON.parse(saved) as Record<string, ConnectionStatus> : {};
  } catch { return {}; }
}

function readReview(uid: string) {
  try {
    const saved = localStorage.getItem(CONNECTION_REVIEW_STORAGE_KEY);
    const reviews = saved ? JSON.parse(saved) as Record<string, ConnectionReviewState> : {};
    return reviews[uid] ?? EMPTY_REVIEW;
  } catch { return EMPTY_REVIEW; }
}

function RequestSwitch({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return <button type="button" className={`${styles.requestSwitch} ${checked ? styles.requestSwitchOn : ""}`} role="switch" aria-checked={checked} aria-label={`Minta pertukaran ${label}`} onClick={onChange}><span/></button>;
}

export default function MessageDetailClient({ request }: { request: ConnectionRequest }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [review, setReview] = useState<ConnectionReviewState | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const displayName = getDisplayName(request);
  const sections = getConnectionCvSections(request);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setStatus(readStatuses()[request.uid] ?? request.status);
      setReview(readReview(request.uid));
    });
    return () => cancelAnimationFrame(frame);
  }, [request.status, request.uid]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!review) return;
    const saved = localStorage.getItem(CONNECTION_REVIEW_STORAGE_KEY);
    const reviews = saved ? JSON.parse(saved) as Record<string, ConnectionReviewState> : {};
    localStorage.setItem(CONNECTION_REVIEW_STORAGE_KEY, JSON.stringify({ ...reviews, [request.uid]: review }));
  }, [request.uid, review]);

  const showFeedback = (message: string) => {
    setFeedback(message);
    window.setTimeout(() => setFeedback(""), 2800);
  };

  const toggleRequest = (key: MarriageCvFieldKey, label: string) => {
    setReview((current) => {
      const safe = current ?? EMPTY_REVIEW;
      const requested = safe.requestedFields.includes(key);
      return { ...safe, requestedFields: requested ? safe.requestedFields.filter((item) => item !== key) : [...safe.requestedFields, key] };
    });
    showFeedback(`Permintaan pertukaran ${label} diperbarui.`);
  };

  const submitReview = () => {
    setReview((current) => ({ ...(current ?? EMPTY_REVIEW), reviewSubmitted: true }));
    showFeedback("Pengajuan review selesai telah dikirim.");
  };

  const rejectCandidate = () => {
    const statuses = readStatuses();
    localStorage.setItem(CONNECTION_STATUS_STORAGE_KEY, JSON.stringify({ ...statuses, [request.uid]: "declined" }));
    setStatus("declined");
    setRejectOpen(false);
    showFeedback(`Notifikasi penolakan telah dikirim kepada ${displayName}.`);
  };

  const currentStage = review?.reviewSubmitted ? 2 : 1;
  const stages = ["Review CV", "Persetujuan bersama", "Lanjut perkenalan"];

  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <button className={styles.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka menu akun"><Icon name="menu"/></button>
      <Link className={styles.logo} href="/feed"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
      <Link className={styles.feedLink} href="/feed">Feed</Link>
      <div className={styles.headerActions} ref={panelRef}>
        <button className={styles.language} onClick={() => setPanel(panel === "language" ? null : "language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "notification" ? null : "notification")} aria-label="Notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>2</i></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "message" ? null : "message")} aria-label="Pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>{CONNECTION_REQUESTS.length}</i></button>
        <span className={styles.headerAvatar}>ZN</span>
        {panel && <div className={styles.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>⇄</span><div><b>Permintaan pertukaran data</b><p>{displayName} ingin melengkapi proses review CV.</p><small>Hari ini</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><Link href="/pesan">Lihat semua</Link></div><div className={styles.notice}><span>{request.initials}</span><div><b>{displayName}</b><p>{request.message.slice(0,45)}…</p><small>{request.requestedAt}</small></div></div></>}
        </div>}
      </div>
    </div></header>

    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarTitle}><span>Menu akun</span><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><Icon name="close"/></button></div>
        <nav aria-label="Navigasi akun">{ACCOUNT_NAVIGATION.map((item) => {
          const active = isAccountNavigationActive(pathname, item.activePrefix);
          return <Link key={item.key} className={active ? styles.activeMenu : undefined} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setSidebarOpen(false)}><Icon name={item.icon}/>{item.label}{item.key === "messages" && <span>{CONNECTION_REQUESTS.length}</span>}</Link>;
        })}</nav>
        <div className={styles.sidebarInfo}><strong>Pertukaran yang setara</strong><p>Informasi privat hanya dibuka setelah kedua pihak melengkapi dan menyetujui pertukaran data.</p></div>
      </aside>
      {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={styles.main}>
        <Link className={styles.backLink} href="/pesan"><Icon name="arrow" size={15}/>Kembali ke pesan masuk</Link>
        {status === null || review === null ? <div className={styles.blocked}><p>Memuat proses review…</p></div> : status !== "accepted" ? <div className={styles.blocked} data-access={status}>
          <span className={styles.blockedIcon}><Icon name="lock"/></span>
          <h1>{status === "pending" ? "Terima permintaan terlebih dahulu." : "Proses review telah dihentikan."}</h1>
          <p>{status === "pending" ? "Detail koneksi hanya tersedia setelah permintaan diterima. Anda tetap dapat melihat CV publik pengguna dari halaman pesan masuk." : "Calon ini telah ditolak sehingga detail CV dan proses pertukaran data tidak lagi dapat dibuka."}</p>
          <Link href="/pesan">Kembali ke pesan masuk</Link>
        </div> : <>
          <ol className={styles.reviewProgress} aria-label="Tahapan review CV">{stages.map((label, index) => {
            const number = index + 1;
            const completed = number < currentStage;
            const active = number === currentStage;
            return <li key={label} className={`${completed ? styles.stageCompleted : ""} ${active ? styles.stageActive : ""}`} aria-current={active ? "step" : undefined}><span>{completed ? <Icon name="check" size={15}/> : number}</span><div><small>Tahap {number}</small><strong>{label}</strong></div></li>;
          })}</ol>

          <section className={styles.profileIntro}>
            <div className={`${styles.personAvatar} ${request.gender === "Pria" ? styles.male : styles.female}`}><span>{request.initials}</span></div>
            <div><span className={styles.eyebrow}>Review CV Calon Pasangan</span><h1>{displayName}</h1><div className={styles.personMeta}><span><Icon name="location" size={14}/>{request.location}</span><span><Icon name="user" size={14}/>{request.age} tahun · {request.gender}</span></div></div>
            <span className={styles.detailStatus}>{review.reviewSubmitted ? "Menunggu persetujuan" : "Sedang direview"}</span>
          </section>

          {review.reviewSubmitted && <div className={styles.reviewNotice} role="status"><Icon name="check"/><div><strong>Review CV selesai telah diajukan.</strong><p>Kami telah mengirimkan pengajuan kepada {displayName}. Tahap berikutnya terbuka setelah calon pasangan menyetujui review telah usai.</p></div></div>}

          <section className={styles.introMessage}><span>Pesan perkenalan</span><p>“{request.message.slice(0,255)}”</p></section>

          <div className={styles.reviewDocument}>{sections.map((section, index) => <section className={styles.reviewSection} key={section.title}>
            <div className={styles.reviewSectionTitle}><span>0{index + 1}</span><div><h2>{section.title}</h2><p>{section.description}</p></div></div>
            <div className={styles.reviewFields}>{section.fields.map((field) => {
              const requested = review.requestedFields.includes(field.key);
              return <div className={`${styles.reviewField} ${field.visible ? styles.sharedField : styles.privateField}`} key={field.key} data-field={field.key}>
                <div className={styles.reviewFieldMain}><div><span>{field.label}</span><p>{field.visible && field.value ? field.value : "Belum dibagikan oleh calon pasangan"}</p></div>{!field.visible && <div className={styles.exchangeControl}><small>{requested ? "Diminta" : "Minta data"}</small><RequestSwitch checked={requested} label={field.label} onChange={() => toggleRequest(field.key, field.label)}/></div>}</div>
                {requested && <div className={styles.exchangeNotice}><Icon name="exchange" size={17}/><p><strong>{displayName} ingin bertukar data {field.label}.</strong> Lengkapi {field.label} Anda terlebih dahulu, lalu lakukan pertukaran saat kedua pihak siap.</p></div>}
              </div>;
            })}</div>
          </section>)}</div>

          <section className={styles.reviewActions}>
            <div><span>Keputusan review</span><h2>Sudah selesai mempelajari CV ini?</h2><p>Ajukan review selesai untuk meminta persetujuan calon pasangan, atau hentikan proses bila Anda tidak ingin melanjutkan.</p></div>
            <div><button className={styles.rejectCandidate} onClick={() => setRejectOpen(true)}>Tolak calon ini</button><button className={styles.completeReview} disabled={review.reviewSubmitted} onClick={submitReview}><Icon name="check" size={16}/>{review.reviewSubmitted ? "Menunggu persetujuan" : "Review CV Selesai"}</button></div>
          </section>
        </>}
      </main>
    </div>

    {rejectOpen && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setRejectOpen(false)}><div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="reject-candidate-title" onMouseDown={(event) => event.stopPropagation()}><span className={styles.modalIcon}><Icon name="x"/></span><h2 id="reject-candidate-title">Tolak {displayName}?</h2><p>Proses review akan dihentikan dan calon pasangan akan menerima notifikasi penolakan yang sopan.</p><div><button onClick={() => setRejectOpen(false)}>Batal</button><button className={styles.confirmReject} onClick={rejectCandidate}>Ya, tolak calon</button></div></div></div>}
    {feedback && <div className={styles.toast} role="status"><Icon name="check" size={16}/>{feedback}</div>}
  </div>;
}
