"use client";

import Link from "next/link";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { CONNECTION_REQUESTS, getDisplayName } from "@/lib/connection-requests";
import { POSTS } from "./feed/feed-client";
import styles from "./landing.module.css";

type Panel = "language" | "notification" | "message" | null;
type IconName = "globe" | "bell" | "chat" | "chevron" | "arrow" | "eye" | "shield" | "heart" | "people" | "menu" | "close";

const CV_VIEW_COUNTS: Record<string, number> = {
  "aulia-s": 1864, "rizky-a": 1739, "nadia-p": 1628, "fajar-m": 1517,
  "salsa-n": 1432, "dimas-h": 1318, "putri-r": 1226, "bagas-k": 1194,
  "intan-l": 1087, "arief-s": 996, "maya-f": 914, "yusuf-r": 865, "citra-a": 792,
};

const TESTIMONIALS = [
  { initials: "RA", location: "Bandung", duration: "Menikah setelah 9 bulan", quote: "Kami memulai dari percakapan tentang nilai keluarga. Proses yang bertahap membuat kami lebih tenang untuk saling mengenal." },
  { initials: "DN", location: "Surabaya", duration: "Menikah setelah 11 bulan", quote: "CV Nikah membantu kami membicarakan hal-hal penting sejak awal, tanpa kehilangan ruang untuk bertumbuh secara alami." },
  { initials: "FM", location: "Makassar", duration: "Menikah setelah 8 bulan", quote: "Bukan sekadar menemukan profil yang menarik, kami menemukan seseorang yang siap berjalan menuju tujuan yang sama." },
];

function Icon({ name, size = 19 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<IconName, ReactNode> = {
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.4"/></>,
    shield: <path d="M12 3 4.5 6v5.2c0 4.7 3.2 8.1 7.5 9.8 4.3-1.7 7.5-5.1 7.5-9.8V6Z"/>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.4-7 6-7s6 3 6 7"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17 14c2.5.8 4 3 4 6"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function formatViews(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export default function LandingClient() {
  const [panel, setPanel] = useState<Panel>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const popularPosts = useMemo(() => [...POSTS].sort((a, b) => b.views - a.views).slice(0, 5), []);
  const popularCvs = useMemo(() => [...CONNECTION_REQUESTS].sort((a, b) => (CV_VIEW_COUNTS[b.uid] ?? 0) - (CV_VIEW_COUNTS[a.uid] ?? 0)).slice(0, 5), []);

  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <Link className={styles.logo} href="/" aria-label="onYou halaman utama"><span>oY</span><strong>onYou</strong></Link>
      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ""}`} aria-label="Navigasi utama"><Link href="/feed">Feed</Link><a href="#cara-kerja">Cara kerja</a><a href="#cerita">Cerita mereka</a><Link className={styles.mobileAuth} href="/login">Masuk</Link><Link className={styles.mobileAuth} href="/register">Daftar</Link></nav>
      <div className={styles.actions} ref={panelRef}>
        <button className={styles.language} onClick={() => setPanel(panel === "language" ? null : "language")} aria-expanded={panel === "language"}><Icon name="globe"/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "notification" ? null : "notification")} aria-label="Buka notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>2</i></button>
        <button className={styles.iconButton} onClick={() => setPanel(panel === "message" ? null : "message")} aria-label="Buka pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>3</i></button>
        <Link className={styles.login} href="/login">Masuk</Link><Link className={styles.register} href="/register">Daftar</Link>
        <button className={styles.menuButton} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Tutup menu" : "Buka menu"}><Icon name={menuOpen ? "close" : "menu"}/></button>
        {panel && <div className={styles.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>CV</span><div><b>CV Anda dilihat</b><p>12 orang melihat CV publik Anda minggu ini.</p><small>Hari ini</small></div></div><div className={styles.notice}><span>01</span><div><b>Permintaan baru</b><p>Seseorang ingin terhubung dengan Anda.</p><small>Kemarin</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><Link href="/pesan">Lihat semua</Link></div><div className={styles.notice}><span>AS</span><div><b>Aulia S.</b><p>Mengirim permintaan untuk terhubung.</p><small>Baru saja</small></div></div></>}
        </div>}
      </div>
    </div></header>

    <main>
      <section className={styles.hero}><div className={styles.heroGlow} aria-hidden="true"/><div className={styles.heroInner}>
        <div className={styles.heroCopy}><span className={styles.eyebrow}>Hubungan serius dimulai dari niat yang jelas</span><h1>Bukan sekadar bertemu.<br/><em>Temukan yang sejalan.</em></h1><p>onYou membantu Anda mengenal seseorang melalui nilai, kesiapan, dan tujuan hidup—dengan proses yang lebih tenang, aman, dan bermakna.</p><div className={styles.heroActions}><Link href="/register">Mulai perjalanan <Icon name="arrow"/></Link><Link href="/feed">Jelajahi Feed</Link></div><small>Kenali dengan jujur · Putuskan tanpa tekanan · Jaga privasi bersama</small></div>
        <div className={styles.heroVisual} aria-label="Gambaran proses menemukan pasangan sejalan"><div className={styles.orbit}><span>AS</span><span>NZ</span><i><Icon name="heart" size={23}/></i></div><p>Berawal dari nilai yang sama</p><strong>Menuju keputusan bersama</strong></div>
      </div></section>

      <section className={styles.values} id="cara-kerja"><div className={styles.sectionIntro}><span className={styles.eyebrow}>Mengapa onYou</span><h2>Teknologi yang tetap menempatkan manusia di pusatnya.</h2><p>Kami merancang ruang untuk percakapan yang bernilai, batas privasi yang jelas, dan keputusan yang tetap berada di tangan Anda.</p></div><div className={styles.valueGrid}>
        <article><span>01</span><Icon name="people"/><h3>Kenali nilai, bukan hanya profil</h3><p>Mulai dari cerita, prinsip hidup, dan visi pernikahan yang membantu percakapan menjadi lebih bermakna.</p></article>
        <article><span>02</span><Icon name="shield"/><h3>Privasi tumbuh bersama kepercayaan</h3><p>Anda menentukan informasi yang dibagikan, sementara tahapan koneksi membantu kedua pihak bergerak dengan nyaman.</p></article>
        <article><span>03</span><Icon name="heart"/><h3>Keputusan tanpa tekanan</h3><p>Ambil waktu untuk mengenal, melibatkan keluarga, dan memilih berdasarkan kesiapan yang nyata.</p></article>
      </div></section>

      <section className={styles.popular}><div className={styles.sectionHeader}><div><span className={styles.eyebrow}>Sedang banyak dibaca</span><h2>Feed populer</h2></div><Link href="/feed">Lihat semua Feed <Icon name="arrow" size={16}/></Link></div><div className={styles.postList}>{popularPosts.length ? popularPosts.map((post, index) => <Link href="/feed" className={styles.postRow} key={post.id}><span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span><span className={`${styles.avatar} ${post.gender === "Wanita" ? styles.woman : ""}`}>{post.initials}</span><div><strong>{post.initials} · {post.age} tahun</strong><small>{post.location}, {post.province} · {post.published}</small><p>{post.text}</p></div><span className={styles.views}><Icon name="eye" size={15}/>{formatViews(post.views)}</span></Link>) : <p className={styles.empty}>Belum ada Feed populer untuk ditampilkan.</p>}</div></section>

      <section className={styles.popularCvs}><div className={styles.sectionHeader}><div><span className={styles.eyebrow}>Profil publik pilihan komunitas</span><h2>CV Nikah paling banyak dilihat</h2></div><p>Informasi yang tampil mengikuti pilihan privasi pemilik CV.</p></div><div className={styles.cvList}>{popularCvs.length ? popularCvs.map((cv, index) => <Link className={styles.cvRow} href={`/cv-nikah/${cv.uid}`} key={cv.uid}><span className={styles.rank}>{String(index + 1).padStart(2, "0")}</span><span className={`${styles.avatar} ${cv.gender === "Wanita" ? styles.woman : ""}`}>{cv.initials}</span><div><strong>{getDisplayName(cv)}</strong><small>{cv.age} tahun · {cv.location}</small><p>{cv.cv.job} · Target menikah {cv.cv.marriageTarget.toLowerCase()}</p></div><span className={styles.views}><Icon name="eye" size={15}/>{formatViews(CV_VIEW_COUNTS[cv.uid] ?? 0)}</span><Icon name="chevron" size={16}/></Link>) : <p className={styles.empty}>Belum ada CV Nikah publik untuk ditampilkan.</p>}</div></section>

      <section className={styles.stories} id="cerita"><div className={styles.sectionIntro}><span className={styles.eyebrow}>Cerita yang memberi harapan</span><h2>Ketika niat baik menemukan jalannya.</h2><p>Contoh testimoni untuk tahap desain. Konten final hanya boleh menggunakan cerita pasangan yang telah memberi izin publikasi.</p></div><div className={styles.storyGrid}>{TESTIMONIALS.map((story) => <blockquote key={story.initials}><span>Contoh testimoni</span><p>“{story.quote}”</p><footer><i>{story.initials}</i><div><strong>{story.initials} · {story.location}</strong><small>{story.duration}</small></div></footer></blockquote>)}</div></section>

      <section className={styles.cta}><span className={styles.eyebrow}>Langkah kecil, tujuan yang berarti</span><h2>Siap mengenal seseorang dengan cara yang lebih jujur?</h2><p>Mulai dari cerita Anda. Temukan seseorang yang tidak hanya menarik perhatian, tetapi juga memahami arah hidup yang ingin dibangun.</p><div><Link href="/register">Buat akun gratis <Icon name="arrow"/></Link><Link href="/feed">Lihat cerita pengguna</Link></div></section>
    </main>

    <footer className={styles.footer}><div><Link className={styles.logo} href="/"><span>oY</span><strong>onYou</strong></Link><p>Ruang untuk menemukan pasangan melalui nilai, kesiapan, dan tujuan yang sejalan.</p></div><nav aria-label="Tautan footer"><Link href="/feed">Feed</Link><Link href="/login">Masuk</Link><Link href="/register">Daftar</Link><a href="#cara-kerja">Cara kerja</a></nav><small>© 2025–2026 onYou. Dibuat untuk hubungan yang lebih bermakna.</small></footer>
  </div>;
}
