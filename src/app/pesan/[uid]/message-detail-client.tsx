"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "@/app/accounts/account-navigation";
import {
  CONNECTION_STATUS_STORAGE_KEY,
  ConnectionRequest,
  ConnectionStatus,
  getDisplayName,
} from "@/lib/connection-requests";
import styles from "../messages.module.css";

type Panel = "language" | "notification" | "message" | null;
type IconName = "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "cv" | "post" | "settings" | "location" | "user" | "arrow" | "lock";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, close: <path d="m6 6 12 12M18 6 6 18"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>, arrow: <path d="m9 18 6-6-6-6"/>,
    cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>, lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function getSavedStatus(uid: string, fallback: ConnectionStatus) {
  try {
    const saved = localStorage.getItem(CONNECTION_STATUS_STORAGE_KEY);
    const statuses = saved ? JSON.parse(saved) as Record<string, ConnectionStatus> : {};
    return statuses[uid] ?? fallback;
  } catch { return fallback; }
}

export default function MessageDetailClient({ request }: { request: ConnectionRequest }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setStatus(getSavedStatus(request.uid, request.status)));
    return () => cancelAnimationFrame(frame);
  }, [request.status, request.uid]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const cvSections = [
    { title: "Data Pribadi", fields: [
      ["name", "Nama", getDisplayName(request)], ["birth", "Tempat, tanggal lahir", request.cv.birth], ["location", "Domisili sekarang", request.location], ["religion", "Agama", request.cv.religion], ["maritalStatus", "Status pernikahan", request.cv.maritalStatus], ["education", "Pendidikan terakhir", request.cv.education], ["job", "Pekerjaan", request.cv.job], ["height", "Tinggi badan", request.cv.height], ["weight", "Berat badan", request.cv.weight],
    ] },
    { title: "Tentang Saya", fields: [["about", "Tentang saya", request.cv.about]] },
    { title: "Visi Pernikahan", fields: [["marriageVision", "Visi pernikahan", request.cv.marriageVision]] },
    { title: "Harapan & Kesiapan", fields: [["partnerExpectation", "Harapan terhadap pasangan", request.cv.partnerExpectation], ["marriageTarget", "Target waktu menikah", request.cv.marriageTarget]] },
  ].map((section) => ({ ...section, fields: section.fields.filter(([key]) => request.visibleFields.includes(key)) }));

  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <button className={styles.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka menu akun"><Icon name="menu"/></button>
      <Link className={styles.logo} href="/feed"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
      <Link className={styles.feedLink} href="/feed">Feed</Link>
      <div className={styles.headerActions} ref={panelRef}>
        <button className={styles.language} onClick={() => setPanel(panel === "language" ? null : "language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "notification" ? null : "notification")} aria-label="Notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>2</i></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "message" ? null : "message")} aria-label="Pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>13</i></button>
        <span className={styles.headerAvatar}>ZN</span>
        {panel && <div className={styles.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>✦</span><div><b>Permintaan koneksi</b><p>Profil ini ingin terhubung dengan Anda.</p><small>Hari ini</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><Link href="/pesan">Lihat semua</Link></div><div className={styles.notice}><span>{request.initials}</span><div><b>{getDisplayName(request)}</b><p>{request.message.slice(0,45)}…</p><small>{request.requestedAt}</small></div></div></>}
        </div>}
      </div>
    </div></header>

    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarTitle}><span>Menu akun</span><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><Icon name="close"/></button></div>
        <nav aria-label="Navigasi akun">{ACCOUNT_NAVIGATION.map((item) => {
          const active = isAccountNavigationActive(pathname, item.activePrefix);
          return <Link key={item.key} className={active ? styles.activeMenu : undefined} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setSidebarOpen(false)}><Icon name={item.icon}/>{item.label}{item.key === "messages" && <span>13</span>}</Link>;
        })}</nav>
        <div className={styles.sidebarInfo}><strong>Informasi terpilih</strong><p>CV ini hanya menampilkan data yang dipilih oleh pemiliknya untuk dibagikan.</p></div>
      </aside>
      {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={styles.main}>
        <Link className={styles.backLink} href="/pesan"><Icon name="arrow" size={15}/>Kembali ke pesan masuk</Link>
        {status === null ? <div className={styles.blocked}><p>Memuat CV…</p></div> : status === "declined" ? <div className={styles.blocked} data-blocked="true"><span className={styles.blockedIcon}><Icon name="lock"/></span><h1>CV tidak dapat dibuka.</h1><p>Permintaan koneksi dari pengguna ini telah Anda tolak. Demi menjaga privasi, detail CV tidak lagi tersedia.</p><Link href="/pesan">Kembali ke pesan masuk</Link></div> : <>
          <section className={styles.profileIntro}>
            <div className={`${styles.personAvatar} ${request.gender === "Pria" ? styles.male : styles.female}`}><span>{request.initials}</span></div>
            <div><span className={styles.eyebrow}>CV Nikah</span><h1>{getDisplayName(request)}</h1><div className={styles.personMeta}><span><Icon name="location" size={14}/>{request.location}</span><span><Icon name="user" size={14}/>{request.age} tahun · {request.gender}</span></div></div>
            <span className={styles.detailStatus}>{status === "accepted" ? "Koneksi diterima" : "Menunggu keputusan"}</span>
          </section>
          <section className={styles.introMessage}><span>Pesan perkenalan</span><p>“{request.message.slice(0,255)}”</p></section>
          <div className={styles.cvDocument}>{cvSections.filter((section) => section.fields.length).map((section) => <section className={styles.cvSection} key={section.title}><h2>{section.title}</h2><div className={styles.fieldGrid}>{section.fields.map(([key,label,value]) => <div className={styles.field} key={key}><span>{label}</span><p>{value}</p></div>)}</div></section>)}</div>
        </>}
      </main>
    </div>
  </div>;
}
