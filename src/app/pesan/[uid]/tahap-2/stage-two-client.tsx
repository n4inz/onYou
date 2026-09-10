"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChangeEvent, FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "@/app/accounts/account-navigation";
import {
  CONNECTION_REQUESTS,
  CONNECTION_REVIEW_STORAGE_KEY,
  CONNECTION_STAGE_TWO_STORAGE_KEY,
  CONNECTION_STATUS_STORAGE_KEY,
  ConnectionRequest,
  ConnectionReviewState,
  ConnectionStatus,
  StageTwoOption,
  StageTwoState,
  getDisplayName,
} from "@/lib/connection-requests";
import styles from "./stage-two.module.css";

type Panel = "language" | "notification" | "message" | null;
type IconName = "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "cv" | "post" | "settings" | "arrow" | "check" | "lock" | "photo" | "video" | "meeting" | "shield" | "upload" | "location" | "send";

const EMPTY_STAGE_TWO: StageTwoState = {
  option: null,
  mediaKind: null,
  requestStatus: "idle",
  ownMediaName: "",
  candidateMediaReady: false,
  mediaExchanged: false,
  messages: [],
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>, close: <path d="m6 6 12 12M18 6 6 18"/>, check: <path d="m5 12 4 4L19 6"/>, arrow: <path d="m9 18 6-6-6-6"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>, cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2L17 19.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    photo: <><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></>,
    video: <><rect x="3" y="5" width="13" height="14" rx="2"/><path d="m16 10 5-3v10l-5-3"/></>,
    meeting: <><circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2 21a6 6 0 0 1 12 0M13 21a5 5 0 0 1 9 0"/></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
    upload: <><path d="M12 16V4m-4 4 4-4 4 4"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
    send: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
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
    const values = saved ? JSON.parse(saved) as Record<string, ConnectionReviewState> : {};
    return values[uid] ?? { requestedFields: [], reviewSubmitted: false };
  } catch { return { requestedFields: [], reviewSubmitted: false }; }
}

function readStageTwo(uid: string) {
  try {
    const saved = localStorage.getItem(CONNECTION_STAGE_TWO_STORAGE_KEY);
    const values = saved ? JSON.parse(saved) as Record<string, StageTwoState> : {};
    return values[uid] ?? EMPTY_STAGE_TWO;
  } catch { return EMPTY_STAGE_TWO; }
}

function requestLabel(state: StageTwoState) {
  if (state.requestStatus === "pending") return "Menunggu persetujuan calon";
  if (state.requestStatus === "approved") return "Disetujui kedua pihak";
  if (state.requestStatus === "declined") return "Permintaan ditolak";
  return "Belum diajukan";
}

export default function StageTwoClient({ request }: { request: ConnectionRequest }) {
  const pathname = usePathname();
  const displayName = getDisplayName(request);
  const panelRef = useRef<HTMLDivElement>(null);
  const mediaUrlRef = useRef<string | null>(null);
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [reviewReady, setReviewReady] = useState<boolean | null>(null);
  const [stage, setStage] = useState<StageTwoState | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [message, setMessage] = useState("");
  const [mediaPreview, setMediaPreview] = useState("");

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setStatus(readStatuses()[request.uid] ?? request.status);
      const review = readReview(request.uid);
      setReviewReady(review.reviewSubmitted && review.candidateApproved === true);
      setStage(readStageTwo(request.uid));
    });
    return () => cancelAnimationFrame(frame);
  }, [request.status, request.uid]);

  useEffect(() => {
    if (!stage) return;
    const saved = localStorage.getItem(CONNECTION_STAGE_TWO_STORAGE_KEY);
    const values = saved ? JSON.parse(saved) as Record<string, StageTwoState> : {};
    localStorage.setItem(CONNECTION_STAGE_TWO_STORAGE_KEY, JSON.stringify({ ...values, [request.uid]: stage }));
  }, [request.uid, stage]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => () => {
    if (mediaUrlRef.current) URL.revokeObjectURL(mediaUrlRef.current);
  }, []);

  useEffect(() => {
    if (stage?.requestStatus !== "pending") return;
    const timer = window.setTimeout(() => {
      setStage((current) => current ? { ...current, requestStatus: "approved" } : current);
      setFeedback(`${displayName} menyetujui pilihan Tahap 2.`);
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [displayName, stage?.requestStatus]);

  useEffect(() => {
    if (!stage?.ownMediaName || stage.candidateMediaReady || stage.requestStatus !== "approved") return;
    const timer = window.setTimeout(() => {
      setStage((current) => current ? { ...current, candidateMediaReady: true, mediaExchanged: true } : current);
      setFeedback(`Media dari ${displayName} diterima. Pertukaran telah dibuka.`);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [displayName, stage?.candidateMediaReady, stage?.ownMediaName, stage?.requestStatus]);

  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(""), 3000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const chooseOption = (option: StageTwoOption) => {
    setStage((current) => ({ ...EMPTY_STAGE_TWO, ...current, option, mediaKind: option === "media" ? current?.mediaKind ?? "photo" : null, requestStatus: "idle", ownMediaName: "", candidateMediaReady: false, mediaExchanged: false, messages: current?.messages ?? [] }));
  };

  const submitRequest = () => {
    if (!stage?.option || (stage.option === "media" && !stage.mediaKind)) return;
    setStage({ ...stage, requestStatus: "pending" });
    setFeedback(`Permintaan dikirim kepada ${displayName}.`);
  };

  const handleMedia = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !stage?.mediaKind) return;
    const valid = stage.mediaKind === "photo" ? file.type.startsWith("image/") : file.type.startsWith("video/");
    if (!valid || file.size > 25 * 1024 * 1024) {
      setFeedback(`Pilih ${stage.mediaKind === "photo" ? "foto" : "video"} berukuran maksimal 25 MB.`);
      event.target.value = "";
      return;
    }
    if (mediaUrlRef.current) URL.revokeObjectURL(mediaUrlRef.current);
    const url = URL.createObjectURL(file);
    mediaUrlRef.current = url;
    setMediaPreview(url);
    setStage({ ...stage, ownMediaName: file.name, candidateMediaReady: false, mediaExchanged: false });
    setFeedback("Media Anda disimpan sementara dan menunggu calon pasangan.");
  };

  const sendMessage = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !stage) return;
    setStage({ ...stage, messages: [...stage.messages, { id: crypto.randomUUID(), sender: "me", text, sentAt: "Baru saja" }] });
    setMessage("");
  };

  const shareLocation = () => {
    if (!navigator.geolocation || !stage) {
      setFeedback("Lokasi perangkat tidak tersedia.");
      return;
    }
    setFeedback("Meminta izin lokasi perangkat…");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const locationUrl = `https://www.google.com/maps?q=${coords.latitude},${coords.longitude}`;
      setStage((current) => current ? { ...current, messages: [...current.messages, { id: crypto.randomUUID(), sender: "me", text: "Saya membagikan titik lokasi pertemuan melalui Maps.", sentAt: "Baru saja", locationUrl }] } : current);
      setFeedback("Lokasi Maps berhasil dibagikan.");
    }, () => setFeedback("Izin lokasi ditolak. Aktifkan izin lokasi untuk berbagi Maps."), { enableHighAccuracy: false, timeout: 8000 });
  };

  const accessAllowed = status === "accepted" && reviewReady === true;
  const approved = stage?.requestStatus === "approved";
  const notificationText = stage?.requestStatus === "pending" ? `Permintaan Tahap 2 menunggu jawaban ${displayName}.` : stage?.requestStatus === "approved" ? `${displayName} menyetujui pilihan Tahap 2.` : "Belum ada permintaan Tahap 2.";

  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <button className={styles.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka menu akun"><Icon name="menu"/></button>
      <Link className={styles.logo} href="/feed"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
      <Link className={styles.feedLink} href="/feed">Feed</Link>
      <div className={styles.headerActions} ref={panelRef}>
        <button className={styles.language} onClick={() => setPanel(panel === "language" ? null : "language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "notification" ? null : "notification")} aria-label="Notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>1</i></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "message" ? null : "message")} aria-label="Pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>{CONNECTION_REQUESTS.length}</i></button>
        <span className={styles.headerAvatar}>ZN</span>
        {panel && <div className={styles.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>✦</span><div><b>Status Tahap 2</b><p>{notificationText}</p><small>Baru saja</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><Link href="/pesan">Lihat semua</Link></div><div className={styles.notice}><span>{request.initials}</span><div><b>{displayName}</b><p>Proses perkenalan Tahap 2</p><small>Hari ini</small></div></div></>}
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
        <div className={styles.sidebarInfo}><strong>Persetujuan dua pihak</strong><p>Fitur lanjutan hanya terbuka setelah Anda dan calon pasangan menyetujui pilihan yang sama.</p></div>
      </aside>
      {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={styles.main}>
        <Link className={styles.backLink} href={`/pesan/${request.uid}`}><Icon name="arrow" size={15}/>Kembali ke review CV</Link>
        {status === null || reviewReady === null || stage === null ? <div className={styles.blocked}><p>Memuat Tahap 2…</p></div> : !accessAllowed ? <div className={styles.blocked}>
          <span><Icon name="lock"/></span><h1>Tahap 2 belum tersedia.</h1><p>Terima koneksi dan selesaikan review CV pada Tahap 1 terlebih dahulu sebelum melanjutkan proses perkenalan.</p><Link href={`/pesan/${request.uid}`}>Kembali ke Tahap 1</Link>
        </div> : <>
          <ol className={styles.progress} aria-label="Tahapan koneksi">
            <li className={styles.completed}><span><Icon name="check" size={15}/></span><div><small>Tahap 1</small><strong>Review CV</strong></div></li>
            <li className={styles.active}><span>2</span><div><small>Tahap 2</small><strong>Perkenalan lanjutan</strong></div></li>
            <li><span>3</span><div><small>Tahap 3</small><strong>Keputusan bersama</strong></div></li>
          </ol>

          <section className={styles.intro}>
            <div><span>Tahap 2 bersama {displayName}</span><h1>Pilih cara berkenalan berikutnya.</h1><p>Ajukan satu pilihan. Proses baru terbuka setelah Anda dan {displayName} sama-sama menyetujuinya.</p></div>
            <div className={styles.status}><small>Status permintaan</small><strong>{requestLabel(stage)}</strong></div>
          </section>

          <section className={styles.options} aria-labelledby="option-title">
            <div className={styles.sectionHeading}><span>01</span><div><h2 id="option-title">Pilih proses lanjutan</h2><p>Pilihan dapat diubah sebelum permintaan disetujui.</p></div></div>
            <div className={styles.optionList}>
              <button className={stage.option === "media" ? styles.optionSelected : ""} onClick={() => chooseOption("media")} disabled={stage.requestStatus === "pending" || approved} aria-pressed={stage.option === "media"}><span><Icon name="photo"/></span><div><strong>Pertukaran foto atau video</strong><p>Kirim media secara setara dan buka bersamaan setelah keduanya tersedia.</p></div><i>{stage.option === "media" ? "Dipilih" : "Pilih"}</i></button>
              <button className={stage.option === "meeting" ? styles.optionSelected : ""} onClick={() => chooseOption("meeting")} disabled={stage.requestStatus === "pending" || approved} aria-pressed={stage.option === "meeting"}><span><Icon name="meeting"/></span><div><strong>Rencana pertemuan</strong><p>Sepakati tempat, waktu, pendamping, dan bagikan lokasi melalui Maps.</p></div><i>{stage.option === "meeting" ? "Dipilih" : "Pilih"}</i></button>
            </div>

            {stage.option === "media" && <div className={styles.mediaKinds}><span>Jenis media yang diajukan</span><div><button className={stage.mediaKind === "photo" ? styles.kindSelected : ""} onClick={() => setStage({ ...stage, mediaKind: "photo" })} disabled={stage.requestStatus !== "idle"}><Icon name="photo" size={17}/>Foto</button><button className={stage.mediaKind === "video" ? styles.kindSelected : ""} onClick={() => setStage({ ...stage, mediaKind: "video" })} disabled={stage.requestStatus !== "idle"}><Icon name="video" size={17}/>Video perkenalan</button></div></div>}

            {stage.option && stage.requestStatus === "idle" && <div className={styles.requestAction}><p>Notifikasi persetujuan akan dikirim kepada {displayName}.</p><button onClick={submitRequest}>Kirim permintaan</button></div>}
          </section>

          {stage.requestStatus !== "idle" && <section className={styles.consent} aria-labelledby="consent-title">
            <div className={styles.sectionHeading}><span>02</span><div><h2 id="consent-title">Persetujuan bersama</h2><p>Kedua pihak wajib menyetujui sebelum fitur berikutnya dibuka.</p></div></div>
            <div className={styles.consentRows}><div><span className={styles.check}><Icon name="check" size={14}/></span><div><strong>Persetujuan Anda</strong><p>Pilihan telah diajukan.</p></div><b>Disetujui</b></div><div><span className={approved ? styles.check : styles.wait}><Icon name={approved ? "check" : "lock"} size={14}/></span><div><strong>Persetujuan {displayName}</strong><p>{approved ? "Calon pasangan menyetujui pilihan yang sama." : "Notifikasi telah dikirim dan menunggu jawaban."}</p></div><b>{approved ? "Disetujui" : "Menunggu"}</b></div></div>
          </section>}

          {approved && stage.option === "media" && <section className={styles.mediaExchange} aria-labelledby="media-title">
            <div className={styles.sectionHeading}><span>03</span><div><h2 id="media-title">Pertukaran {stage.mediaKind === "video" ? "video" : "foto"}</h2><p>Media hanya dibuka setelah kedua pihak menyelesaikan unggahan.</p></div></div>
            <div className={styles.privacyNote}><Icon name="shield"/><div><strong>Privasi Anda dijaga.</strong><p>Untuk menjaga keamanan dan privasi, foto/video Anda akan disimpan sementara dan hanya akan diteruskan setelah {displayName} mengirimkan foto/video sebagai bagian dari proses pertukaran.</p></div></div>
            <div className={styles.uploadRows}>
              <div><span><Icon name="upload"/></span><div><strong>Media Anda</strong><p>{stage.ownMediaName || `Belum mengirim ${stage.mediaKind === "video" ? "video" : "foto"}`}</p></div><label>{stage.ownMediaName ? "Ganti media" : "Pilih media"}<input type="file" accept={stage.mediaKind === "video" ? "video/*" : "image/*"} onChange={handleMedia}/></label></div>
              <div><span className={stage.candidateMediaReady ? styles.ready : ""}><Icon name={stage.candidateMediaReady ? "check" : "lock"}/></span><div><strong>Media {displayName}</strong><p>{stage.candidateMediaReady ? "Sudah dikirim ke sistem" : "Belum diterima oleh sistem"}</p></div><b>{stage.candidateMediaReady ? "Siap" : "Menunggu"}</b></div>
            </div>
            {stage.mediaExchanged ? <div className={styles.exchangeResult}><Icon name="check"/><div><strong>Pertukaran media berhasil dibuka.</strong><p>Kedua pihak telah mengirim media. Anda kini dapat melihat media masing-masing secara bersamaan.</p></div>{mediaPreview && (stage.mediaKind === "video" ? <video controls src={mediaPreview}/> : <Image unoptimized width={220} height={130} src={mediaPreview} alt="Pratinjau media Anda"/>)}</div> : <p className={styles.waitingText}>Media Anda tetap terkunci sampai media dari kedua pihak tersedia.</p>}
          </section>}

          {approved && stage.option === "meeting" && <section className={styles.meeting} aria-labelledby="meeting-title">
            <div className={styles.sectionHeading}><span>03</span><div><h2 id="meeting-title">Diskusikan rencana pertemuan</h2><p>Sepakati lokasi yang aman, waktu, dan pendamping bersama.</p></div></div>
            <div className={styles.safety}><Icon name="shield"/><p>Utamakan pertemuan dengan sepengetahuan keluarga, pilih lokasi yang aman, dan bagikan lokasi hanya jika Anda merasa nyaman.</p></div>
            <div className={styles.chatLog} aria-live="polite">
              <div className={styles.candidateMessage}><span>{request.initials}</span><div><strong>{displayName}</strong><p>Terima kasih sudah menyetujui pertemuan. Kita bisa mendiskusikan waktu dan lokasi yang nyaman untuk keluarga.</p><small>Hari ini</small></div></div>
              {stage.messages.map((item) => <div key={item.id} className={item.sender === "me" ? styles.myMessage : styles.candidateMessage}><span>{item.sender === "me" ? "ZN" : request.initials}</span><div><strong>{item.sender === "me" ? "Anda" : displayName}</strong><p>{item.text}</p>{item.locationUrl && <a href={item.locationUrl} target="_blank" rel="noreferrer"><Icon name="location" size={15}/>Buka lokasi di Maps</a>}<small>{item.sentAt}</small></div></div>)}
            </div>
            <form className={styles.chatForm} onSubmit={sendMessage}><label><span className="sr-only">Tulis pesan</span><input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Diskusikan waktu, tempat, atau pendamping…" maxLength={500}/></label><button type="button" className={styles.locationButton} onClick={shareLocation}><Icon name="location" size={18}/><span>Bagikan lokasi</span></button><button type="submit" className={styles.sendButton} disabled={!message.trim()} aria-label="Kirim pesan"><Icon name="send" size={18}/></button></form>
          </section>}
        </>}
      </main>
    </div>
    {feedback && <div className={styles.toast} role="status"><Icon name="check" size={16}/>{feedback}</div>}
  </div>;
}
