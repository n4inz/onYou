"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useRef, useState } from "react";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "@/app/accounts/account-navigation";
import {
  CONNECTION_REQUESTS,
  CONNECTION_STAGE_THREE_STORAGE_KEY,
  CONNECTION_STAGE_TWO_STORAGE_KEY,
  ConnectionRequest,
  StageThreeDecision,
  StageThreeState,
  StageTwoState,
  getDisplayName,
} from "@/lib/connection-requests";
import shell from "../tahap-2/stage-two.module.css";
import styles from "./stage-three.module.css";

type Panel = "language" | "notification" | "message" | null;
type Phase = "decision" | "waiting" | "result";
type IconName = "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "cv" | "post" | "settings" | "arrow" | "check" | "lock" | "heart" | "x";

const DAY = 24 * 60 * 60 * 1000;
const DECISION_DURATION = 40 * DAY;
const ANNOUNCEMENT_DELAY = 3 * DAY;

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    x: <path d="m6 6 12 12M18 6 6 18"/>,
    arrow: <path d="m9 18 6-6-6-6"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function readStageTwo(uid: string) {
  try {
    const saved = localStorage.getItem(CONNECTION_STAGE_TWO_STORAGE_KEY);
    const values = saved ? JSON.parse(saved) as Record<string, StageTwoState> : {};
    return values[uid];
  } catch { return undefined; }
}

function readStageThree(uid: string): StageThreeState {
  try {
    const saved = localStorage.getItem(CONNECTION_STAGE_THREE_STORAGE_KEY);
    const values = saved ? JSON.parse(saved) as Record<string, StageThreeState> : {};
    if (values[uid]?.startedAt) return values[uid];
  } catch { /* Gunakan kondisi awal jika penyimpanan tidak valid. */ }
  return { startedAt: Date.now(), ownDecision: null, candidateDecision: "accept" };
}

function getTimeParts(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export default function StageThreeClient({ request }: { request: ConnectionRequest }) {
  const pathname = usePathname();
  const displayName = getDisplayName(request);
  const panelRef = useRef<HTMLDivElement>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [state, setState] = useState<StageThreeState | null>(null);
  const [now, setNow] = useState(0);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setAllowed(readStageTwo(request.uid)?.completionStatus === "approved");
      setState(readStageThree(request.uid));
      setNow(Date.now());
    });
    return () => cancelAnimationFrame(frame);
  }, [request.uid]);

  useEffect(() => {
    if (!state) return;
    try {
      const saved = localStorage.getItem(CONNECTION_STAGE_THREE_STORAGE_KEY);
      const values = saved ? JSON.parse(saved) as Record<string, StageThreeState> : {};
      localStorage.setItem(CONNECTION_STAGE_THREE_STORAGE_KEY, JSON.stringify({ ...values, [request.uid]: state }));
    } catch { /* Halaman tetap dapat digunakan ketika penyimpanan browser dibatasi. */ }
  }, [request.uid, state]);

  useEffect(() => {
    if (!state) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 2800);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const elapsed = state && now ? Math.max(0, now - state.startedAt) : 0;
  const phase: Phase = elapsed < DECISION_DURATION ? "decision" : elapsed < DECISION_DURATION + ANNOUNCEMENT_DELAY ? "waiting" : "result";
  const remaining = phase === "decision" ? DECISION_DURATION - elapsed : phase === "waiting" ? DECISION_DURATION + ANNOUNCEMENT_DELAY - elapsed : 0;
  const time = getTimeParts(remaining);
  const ownFinal = state?.ownDecision ?? "decline";
  const candidateFinal = state?.candidateDecision ?? "decline";
  const matched = phase === "result" && ownFinal === "accept" && candidateFinal === "accept";

  const chooseDecision = (decision: Exclude<StageThreeDecision, null>) => {
    if (!state || phase !== "decision") return;
    setState({ ...state, ownDecision: decision });
    setFeedback(decision === "accept" ? `Pilihan menikah dengan ${displayName} telah disimpan.` : `Pilihan menolak menikah dengan ${displayName} telah disimpan.`);
  };

  const notificationText = phase === "decision" ? `Masa keputusan bersama ${displayName} masih berlangsung.` : phase === "waiting" ? "Pilihan telah dikunci. Pengumuman sedang dipersiapkan." : "Hasil keputusan Tahap 3 telah tersedia.";

  return <div className={shell.page}>
    <header className={shell.header}><div className={shell.headerInner}>
      <button className={shell.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka menu akun"><Icon name="menu"/></button>
      <Link className={shell.logo} href="/feed"><span className={shell.logoMark}>oY</span><span>onYou</span></Link>
      <Link className={shell.feedLink} href="/feed">Feed</Link>
      <div className={shell.headerActions} ref={panelRef}>
        <button className={shell.language} onClick={() => setPanel(panel === "language" ? null : "language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={shell.iconButton} onClick={() => setPanel(panel === "notification" ? null : "notification")} aria-label="Notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>1</i></button>
        <button className={shell.iconButton} onClick={() => setPanel(panel === "message" ? null : "message")} aria-label="Pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>{CONNECTION_REQUESTS.length}</i></button>
        <span className={shell.headerAvatar}>ZN</span>
        {panel && <div className={shell.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={shell.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={shell.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={shell.notice}><span>3</span><div><b>Keputusan Tahap 3</b><p>{notificationText}</p><small>Baru saja</small></div></div></>}
          {panel === "message" && <><div className={shell.dropdownHead}><strong>Pesan masuk</strong><Link href="/pesan">Lihat semua</Link></div><div className={shell.notice}><span>{request.initials}</span><div><b>{displayName}</b><p>Proses keputusan akhir sedang berlangsung.</p><small>Hari ini</small></div></div></>}
        </div>}
      </div>
    </div></header>

    <div className={shell.shell}>
      <aside className={`${shell.sidebar} ${sidebarOpen ? shell.sidebarOpen : ""}`}>
        <div className={shell.sidebarTitle}><span>Menu akun</span><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><Icon name="close"/></button></div>
        <nav aria-label="Navigasi akun">{ACCOUNT_NAVIGATION.map((item) => {
          const active = isAccountNavigationActive(pathname, item.activePrefix);
          return <Link key={item.key} className={active ? shell.activeMenu : undefined} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setSidebarOpen(false)}><Icon name={item.icon}/>{item.label}{item.key === "messages" && <span>{CONNECTION_REQUESTS.length}</span>}</Link>;
        })}</nav>
        <div className={shell.sidebarInfo}><strong>Keputusan bersifat pribadi</strong><p>Pilihan Anda tidak akan dibuka kepada calon pasangan sebelum waktu pengumuman tiba.</p></div>
      </aside>
      {sidebarOpen && <button className={shell.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={shell.main}>
        <Link className={shell.backLink} href={`/pesan/${request.uid}/tahap-2`}><Icon name="arrow" size={15}/>Kembali ke Tahap 2</Link>
        {allowed === null || state === null ? <div className={styles.blocked}><p>Memeriksa status Tahap 2…</p></div> : !allowed ? <div className={styles.blocked}>
          <span><Icon name="lock"/></span><h1>Tahap 3 masih terkunci.</h1><p>Tahap keputusan baru dapat dibuka setelah Anda dan {displayName} menyetujui bahwa Perkenalan Lanjutan telah selesai.</p><Link href={`/pesan/${request.uid}/tahap-2`}>Kembali ke Tahap 2</Link>
        </div> : <>
          <ol className={shell.progress} aria-label="Tahapan koneksi">
            <li className={shell.completed}><span><Icon name="check" size={15}/></span><div><small>Tahap 1</small><strong>Review CV</strong></div></li>
            <li className={shell.completed}><span><Icon name="check" size={15}/></span><div><small>Tahap 2</small><strong>Perkenalan lanjutan</strong></div></li>
            <li className={shell.active}><span>3</span><div><small>Tahap 3</small><strong>Keputusan bersama</strong></div></li>
          </ol>

          <section className={styles.intro}>
            <span>Tahap 3 · Keputusan akhir</span>
            <h1>Waktu untuk mendengarkan hati dan keyakinan Anda.</h1>
            <p>Terima kasih sudah sampai ke Tahap 3. Waktu kalian 40 hari dari sekarang untuk mengambil keputusan memilih {displayName} sebagai pasangan hidup. Berdoalah bahwa apa yang kalian putuskan hari ini adalah hal yang terbaik bagi kalian.</p>
          </section>

          <section className={styles.countdown} aria-live="polite">
            <div className={styles.sectionHeading}><span>01</span><div><h2>{phase === "decision" ? "Waktu mengambil keputusan" : phase === "waiting" ? "Menunggu pengumuman" : "Masa keputusan telah selesai"}</h2><p>{phase === "decision" ? "Pilihan masih dapat diubah sampai hitung mundur berakhir." : phase === "waiting" ? "Pilihan kedua pihak telah dikunci selama masa tunggu 3 hari." : "Hasil akhir kini tersedia untuk kedua pihak."}</p></div></div>
            {phase !== "result" && <div className={styles.timer} data-phase={phase}>
              {[[time.days,"Hari"],[time.hours,"Jam"],[time.minutes,"Menit"],[time.seconds,"Detik"]].map(([value,label]) => <div key={label}><strong>{String(value).padStart(2,"0")}</strong><span>{label}</span></div>)}
            </div>}
            <div className={styles.timeline}><span className={phase === "decision" ? styles.current : styles.done}>40 hari keputusan</span><span className={phase === "waiting" ? styles.current : phase === "result" ? styles.done : ""}>3 hari masa tunggu</span><span className={phase === "result" ? styles.current : ""}>Pengumuman</span></div>
          </section>

          {phase !== "result" ? <section className={styles.decision}>
            <div className={styles.sectionHeading}><span>02</span><div><h2>Keputusan Anda</h2><p>Pilihan awal bersifat netral. Keputusan calon pasangan tetap dirahasiakan sampai pengumuman.</p></div></div>
            <div className={styles.choices} role="radiogroup" aria-label="Pilihan keputusan menikah">
              <button role="radio" aria-checked={state.ownDecision === "accept"} className={state.ownDecision === "accept" ? styles.acceptSelected : ""} disabled={phase !== "decision"} onClick={() => chooseDecision("accept")}><span><Icon name="heart"/></span><div><strong>Saya ingin menikah dengan {displayName}</strong><p>Saya siap melanjutkan niat ini menuju pernikahan.</p></div><i>{state.ownDecision === "accept" ? "Dipilih" : "Pilih"}</i></button>
              <button role="radio" aria-checked={state.ownDecision === "decline"} className={state.ownDecision === "decline" ? styles.declineSelected : ""} disabled={phase !== "decision"} onClick={() => chooseDecision("decline")}><span><Icon name="x"/></span><div><strong>Saya menolak menikah dengan {displayName}</strong><p>Saya memilih mengakhiri proses ini dengan baik.</p></div><i>{state.ownDecision === "decline" ? "Dipilih" : "Pilih"}</i></button>
            </div>
            <div className={styles.decisionStatus}><strong>{phase === "waiting" ? "Pilihan telah dikunci" : state.ownDecision ? "Pilihan tersimpan" : "Belum menentukan pilihan"}</strong><p>{phase === "waiting" ? "Hasil kedua pihak baru akan dibuka setelah masa tunggu pengumuman selesai." : state.ownDecision ? "Anda masih dapat mengganti pilihan selama waktu 40 hari tersisa." : "Anda dapat mempertimbangkan keputusan dengan tenang dan memilih kapan saja sebelum batas waktu."}</p></div>
          </section> : <section className={`${styles.result} ${matched ? styles.matched : styles.notMatched}`} data-result={matched ? "matched" : "not-matched"}>
            <span>{matched ? <Icon name="heart" size={27}/> : <Icon name="heart" size={27}/>}</span>
            <small>Pengumuman keputusan bersama</small>
            <h2>{matched ? `Selamat, Anda dan ${displayName} memilih untuk menikah.` : "Terima kasih telah menjalani proses ini dengan sungguh-sungguh."}</h2>
            <p>{matched ? "Semoga keputusan baik ini menjadi awal perjalanan yang penuh ketenangan, saling menjaga, dan keberkahan bagi kalian berdua." : `Keputusan Anda dan ${displayName} belum bertemu pada tujuan yang sama. Tetaplah percaya bahwa kejujuran hari ini membuka jalan menuju hal yang lebih baik.`}</p>
            <div><span>Keputusan Anda <strong>{ownFinal === "accept" ? "Ingin menikah" : "Tidak melanjutkan"}</strong></span><span>Keputusan {displayName} <strong>{candidateFinal === "accept" ? "Ingin menikah" : "Tidak melanjutkan"}</strong></span></div>
            <Link href="/pesan">Kembali ke Pesan Masuk</Link>
          </section>}
        </>}
      </main>
    </div>
    {feedback && <div className={shell.toast} role="status"><Icon name="check" size={16}/>{feedback}</div>}
  </div>;
}
