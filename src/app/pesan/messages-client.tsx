"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MouseEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "@/app/accounts/account-navigation";
import {
  CONNECTION_REQUESTS,
  CONNECTION_STATUS_STORAGE_KEY,
  ConnectionStatus,
  getDisplayName,
} from "@/lib/connection-requests";
import styles from "./messages.module.css";

const PAGE_SIZE = 10;
type Panel = "language" | "notification" | "message" | null;
type IconName = "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "cv" | "post" | "settings" | "location" | "calendar" | "user" | "check" | "x" | "arrow";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, close: <path d="m6 6 12 12M18 6 6 18"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>, cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>, calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, check: <path d="m5 12 4 4L19 6"/>, x: <path d="m6 6 12 12M18 6 6 18"/>, arrow: <path d="m9 18 6-6-6-6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function readSavedStatuses() {
  try {
    const saved = localStorage.getItem(CONNECTION_STATUS_STORAGE_KEY);
    return saved ? JSON.parse(saved) as Record<string, ConnectionStatus> : {};
  } catch { return {}; }
}

export default function MessagesClient() {
  const pathname = usePathname();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});
  const [hydrated, setHydrated] = useState(false);
  const [page, setPage] = useState(1);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rejectUid, setRejectUid] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(CONNECTION_REQUESTS.length / PAGE_SIZE);
  const requests = useMemo(() => CONNECTION_REQUESTS.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [page]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setStatuses(readSavedStatuses());
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(CONNECTION_STATUS_STORAGE_KEY, JSON.stringify(statuses));
  }, [hydrated, statuses]);

  useEffect(() => {
    const close = (event: globalThis.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const updateStatus = (uid: string, status: ConnectionStatus) => {
    setStatuses((current) => ({ ...current, [uid]: status }));
    setRejectUid(null);
    setFeedback(status === "accepted" ? "Permintaan koneksi diterima." : "Permintaan koneksi ditolak.");
    window.setTimeout(() => setFeedback(""), 2400);
  };

  const openRequest = (uid: string, status: ConnectionStatus) => {
    if (status === "accepted") router.push(`/pesan/${uid}`);
  };

  const stop = (event: MouseEvent) => event.stopPropagation();

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
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>✦</span><div><b>Permintaan baru diterima</b><p>Aulia S. ingin terhubung dengan Anda.</p><small>10 menit lalu</small></div></div><div className={styles.notice}><span>♥</span><div><b>CV Anda dilihat</b><p>18 orang melihat CV minggu ini.</p><small>1 jam lalu</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><button onClick={() => setPanel(null)}>Lihat semua</button></div>{CONNECTION_REQUESTS.slice(0,2).map((item) => <div className={styles.notice} key={item.uid}><span>{item.initials}</span><div><b>{getDisplayName(item)}</b><p>{item.message.slice(0,45)}…</p><small>{item.requestedAt}</small></div></div>)}</>}
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
        <div className={styles.sidebarInfo}><strong>Jaga proses tetap nyaman</strong><p>Pelajari CV terlebih dahulu dan pilih terima hanya bila Anda siap melanjutkan perkenalan.</p></div>
      </aside>
      {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={styles.main}>
        <div className={styles.heading}><span>Pesan Masuk</span><h1>Permintaan untuk terhubung.</h1><p>Lihat profil dan pesan perkenalan sebelum memutuskan untuk melanjutkan.</p></div>
        <div className={styles.listHeader}><strong>{CONNECTION_REQUESTS.length} permintaan koneksi</strong><span>Menampilkan {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, CONNECTION_REQUESTS.length)}</span></div>
        <section className={styles.messageList} aria-label="Daftar permintaan koneksi">
          {requests.map((request) => {
            const status = statuses[request.uid] ?? request.status;
            const declined = status === "declined";
            const accepted = status === "accepted";
            return <article key={request.uid} className={`${styles.messageItem} ${declined ? styles.declined : ""} ${status === "pending" ? styles.pendingLocked : ""}`} role={accepted ? "link" : undefined} tabIndex={accepted ? 0 : -1} onClick={() => openRequest(request.uid, status)} onKeyDown={(event) => { if (accepted && (event.key === "Enter" || event.key === " ")) openRequest(request.uid, status); }} data-status={status} data-uid={request.uid}>
              <div className={`${styles.personAvatar} ${request.gender === "Pria" ? styles.male : styles.female}`}><span>{request.initials}</span></div>
              <div className={styles.messageBody}>
                <div className={styles.messageTop}><div><strong>{getDisplayName(request)} ingin terhubung dengan Anda.</strong><span className={`${styles.status} ${styles[status]}`}>{status === "pending" ? "Menunggu" : status === "accepted" ? "Diterima" : "Ditolak"}</span></div><time><Icon name="calendar" size={14}/>{request.requestedAt}</time></div>
                <div className={styles.personMeta}><span><Icon name="location" size={14}/>{request.location}</span><span><Icon name="user" size={14}/>{request.age} tahun · {request.gender}</span></div>
                <p className={styles.firstMessage}>{request.message.slice(0, 255)}</p>
                <div className={styles.itemFooter}>
                  {declined ? <span className={styles.cvLink}>CV tidak lagi tersedia</span> : <div className={styles.itemLinks}>
                    <Link className={styles.cvLink} href={`/cv-nikah/${request.uid}`} target="_blank" onClick={stop}><span>Lihat CV Nikah</span><Icon name="arrow" size={14}/></Link>
                    <span className={styles.detailHint}>{accepted ? "Klik pesan untuk memulai review" : "Terima dahulu untuk membuka detail"}</span>
                  </div>}
                  <div className={styles.actions} onClick={stop}>
                    {status !== "declined" && <button className={styles.rejectButton} onClick={() => setRejectUid(request.uid)}><Icon name="x" size={15}/>Tolak</button>}
                    {status !== "accepted" && status !== "declined" && <button className={styles.acceptButton} onClick={() => updateStatus(request.uid, "accepted")}><Icon name="check" size={15}/>Terima</button>}
                    {status === "accepted" && <span className={styles.acceptedLabel}><Icon name="check" size={14}/>Sudah diterima</span>}
                  </div>
                </div>
              </div>
            </article>;
          })}
        </section>

        <nav className={styles.pagination} aria-label="Pagination pesan">
          <button disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Sebelumnya</button>
          <div>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? styles.currentPage : undefined} aria-current={page === number ? "page" : undefined} onClick={() => setPage(number)}>{number}</button>)}</div>
          <button disabled={page === totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Berikutnya</button>
        </nav>
      </main>
    </div>

    {rejectUid && <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setRejectUid(null)}><div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="reject-title" onMouseDown={(event) => event.stopPropagation()}><span className={styles.modalIcon}><Icon name="x"/></span><h2 id="reject-title">Tolak permintaan ini?</h2><p>Permintaan akan diredupkan dan CV pengguna ini tidak dapat dibuka lagi.</p><div><button onClick={() => setRejectUid(null)}>Batal</button><button className={styles.confirmReject} onClick={() => updateStatus(rejectUid, "declined")}>Ya, tolak</button></div></div></div>}
    {feedback && <div className={styles.toast} role="status"><Icon name="check" size={16}/>{feedback}</div>}
  </div>;
}
