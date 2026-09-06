"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./feed.module.css";

type Gender = "Pria" | "Wanita";
type Post = {
  id: number;
  initials: string;
  gender: Gender;
  age: number;
  location: string;
  province: string;
  job: string;
  education: string;
  marriageTarget: number;
  published: string;
  views: number;
  text: string;
};

const POSTS: Post[] = [
  { id: 1, initials: "AR", gender: "Pria", age: 29, location: "Bandung", province: "Jawa Barat", job: "Software Engineer", education: "S1", marriageTarget: 1, published: "12 menit lalu", views: 184, text: "Saya pribadi yang tenang, suka membaca dan menikmati akhir pekan dengan mencoba kedai kopi baru. Sedang mencari seseorang yang hangat, komunikatif, menyukai keluarga, dan siap bertumbuh bersama menuju hubungan serius. Bagi saya, hubungan yang baik dibangun dari kejujuran, rasa hormat, dan kesediaan untuk saling mendengarkan." },
  { id: 2, initials: "NS", gender: "Wanita", age: 27, location: "Yogyakarta", province: "DI Yogyakarta", job: "Arsitek", education: "S1", marriageTarget: 2, published: "35 menit lalu", views: 271, text: "Arsitek yang menyukai ruang-ruang tenang, museum, dan perjalanan spontan. Saya berharap bertemu pria dewasa, bertanggung jawab, punya tujuan hidup jelas, dan menghargai karier pasangannya." },
  { id: 3, initials: "DP", gender: "Pria", age: 32, location: "Surabaya", province: "Jawa Timur", job: "Pengusaha", education: "S1", marriageTarget: 1, published: "1 jam lalu", views: 392, text: "Membangun usaha kuliner bersama keluarga dan percaya bahwa rumah adalah tempat terbaik untuk pulang. Mencari pasangan yang sederhana, penyayang, dan siap menjalani proses dengan niat baik." },
  { id: 4, initials: "LA", gender: "Wanita", age: 25, location: "Denpasar", province: "Bali", job: "Content Strategist", education: "S1", marriageTarget: 3, published: "2 jam lalu", views: 318, text: "Saya suka pantai di pagi hari, fotografi, serta percakapan panjang tentang mimpi dan kehidupan. Ingin mengenal seseorang yang punya selera humor, berpikiran terbuka, tidak takut berkomunikasi secara jujur, dan memahami pentingnya ruang pribadi. Tidak perlu sempurna, cukup memiliki kemauan untuk terus belajar dan menjadi versi terbaik bersama-sama." },
  { id: 5, initials: "FK", gender: "Pria", age: 30, location: "Makassar", province: "Sulawesi Selatan", job: "Dokter", education: "S2", marriageTarget: 2, published: "3 jam lalu", views: 507, text: "Dokter yang senang bersepeda dan memasak untuk orang-orang terdekat. Saya mencari perempuan yang tulus, mandiri, dekat dengan keluarga, dan percaya bahwa komunikasi adalah fondasi hubungan." },
  { id: 6, initials: "RM", gender: "Wanita", age: 31, location: "Jakarta", province: "DKI Jakarta", job: "Product Manager", education: "S2", marriageTarget: 1, published: "4 jam lalu", views: 624, text: "Seorang product manager yang tetap menyempatkan diri untuk yoga, memasak, dan pulang menemui orang tua. Saya mencari partner hidup yang stabil secara emosi, suportif, setara dalam mengambil keputusan, dan siap membangun keluarga. Saya menghargai pria yang konsisten antara ucapan dan tindakan serta mau bertumbuh bersama." },
  { id: 7, initials: "IH", gender: "Pria", age: 28, location: "Semarang", province: "Jawa Tengah", job: "Guru", education: "S1", marriageTarget: 2, published: "5 jam lalu", views: 146, text: "Guru matematika, pecinta buku sejarah, dan sesekali mendaki gunung. Berharap bertemu seseorang yang sabar, rendah hati, dan punya semangat berbagi untuk sesama." },
  { id: 8, initials: "SA", gender: "Wanita", age: 29, location: "Medan", province: "Sumatera Utara", job: "Akuntan", education: "S1", marriageTarget: 1, published: "6 jam lalu", views: 455, text: "Akuntan yang teratur namun tetap suka kejutan kecil. Saya menghargai kesetiaan, kerja keras, dan keluarga. Mencari pria yang serius, tenang, serta mampu menyelesaikan perbedaan dengan dewasa." },
  { id: 9, initials: "BP", gender: "Pria", age: 34, location: "Balikpapan", province: "Kalimantan Timur", job: "Project Manager", education: "S1", marriageTarget: 1, published: "Kemarin", views: 811, text: "Saya bekerja di bidang konstruksi dan menikmati waktu luang dengan memancing atau berkebun. Mencari pasangan yang siap berkomitmen, menyukai kehidupan yang seimbang, dan ingin membangun rumah yang hangat. Saya percaya pasangan adalah tim: saling menjaga ketika lelah, merayakan kemajuan sekecil apa pun, dan selalu menyediakan ruang untuk berdialog." },
  { id: 10, initials: "KT", gender: "Wanita", age: 26, location: "Malang", province: "Jawa Timur", job: "Desainer Grafis", education: "S1", marriageTarget: 3, published: "Kemarin", views: 299, text: "Desainer visual yang suka ilustrasi, tanaman, dan konser kecil. Mencari seseorang yang kreatif, empatik, dan menghargai proses untuk saling mengenal tanpa terburu-buru." },
  { id: 11, initials: "YA", gender: "Pria", age: 27, location: "Bogor", province: "Jawa Barat", job: "Analis Data", education: "S1", marriageTarget: 2, published: "2 hari lalu", views: 365, text: "Analis data yang suka lari pagi dan eksplorasi kuliner. Saya mencari perempuan yang punya rasa ingin tahu, nyaman berdiskusi, dan serius membangun masa depan bersama." },
  { id: 12, initials: "MF", gender: "Wanita", age: 30, location: "Palembang", province: "Sumatera Selatan", job: "Apoteker", education: "S1", marriageTarget: 1, published: "2 hari lalu", views: 418, text: "Apoteker, anak pertama, dan penyuka film klasik. Ingin bertemu pria yang bertanggung jawab, penyayang kepada keluarga, dan memiliki kebiasaan hidup yang sehat." },
  { id: 13, initials: "RA", gender: "Pria", age: 31, location: "Tangerang", province: "Banten", job: "Konsultan", education: "S2", marriageTarget: 2, published: "3 hari lalu", views: 536, text: "Konsultan bisnis yang menikmati perjalanan singkat dan memasak sarapan. Mencari pasangan yang mandiri, hangat, bisa menjadi teman diskusi, dan memiliki visi keluarga yang sejalan." },
  { id: 14, initials: "DN", gender: "Wanita", age: 28, location: "Solo", province: "Jawa Tengah", job: "Dosen", education: "S2", marriageTarget: 3, published: "3 hari lalu", views: 242, text: "Dosen yang gemar menulis dan mengunjungi tempat bersejarah. Saya berharap menemukan pria yang rendah hati, menyukai belajar, dan mampu berkomunikasi dengan penuh respek." },
  { id: 15, initials: "HF", gender: "Pria", age: 35, location: "Banda Aceh", province: "Aceh", job: "Wiraswasta", education: "S1", marriageTarget: 1, published: "4 hari lalu", views: 687, text: "Menjalankan usaha keluarga dan aktif dalam kegiatan sosial. Mencari perempuan yang tulus, sederhana, menghormati keluarga, serta siap membangun kehidupan yang penuh syukur." },
  { id: 16, initials: "AZ", gender: "Wanita", age: 24, location: "Padang", province: "Sumatera Barat", job: "Perawat", education: "D3", marriageTarget: 4, published: "4 hari lalu", views: 193, text: "Perawat yang suka membaca novel dan membuat kue. Ingin mengenal pria yang sabar, suportif, punya niat serius, dan tidak keberatan menjalani proses perlahan." },
  { id: 17, initials: "GH", gender: "Pria", age: 26, location: "Pontianak", province: "Kalimantan Barat", job: "UI Designer", education: "S1", marriageTarget: 3, published: "5 hari lalu", views: 329, text: "UI designer, penikmat musik jazz, dan penggemar kucing. Mencari seseorang yang jujur, punya dunia dan mimpinya sendiri, serta senang bertukar cerita sederhana setiap hari." },
  { id: 18, initials: "PR", gender: "Wanita", age: 33, location: "Manado", province: "Sulawesi Utara", job: "Pengusaha", education: "S1", marriageTarget: 2, published: "5 hari lalu", views: 574, text: "Mengelola bisnis kecil di bidang kecantikan. Saya menyukai laut, keluarga, dan percakapan yang bermakna. Mencari pria dewasa yang jujur, stabil, serta mendukung pertumbuhan satu sama lain." },
  { id: 19, initials: "ES", gender: "Pria", age: 30, location: "Mataram", province: "Nusa Tenggara Barat", job: "Fotografer", education: "S1", marriageTarget: 2, published: "6 hari lalu", views: 407, text: "Fotografer perjalanan yang kini ingin lebih banyak menetap. Berharap bertemu perempuan yang fleksibel, penuh perhatian, dan antusias merancang masa depan bersama." },
  { id: 20, initials: "CL", gender: "Wanita", age: 27, location: "Kupang", province: "Nusa Tenggara Timur", job: "Pegawai Negeri", education: "S1", marriageTarget: 5, published: "1 minggu lalu", views: 216, text: "Pribadi ceria yang menikmati kegiatan luar ruang dan pelayanan sosial. Saya ingin mengenal seseorang yang memiliki integritas, rasa humor, dan kesiapan untuk bertumbuh sebagai sahabat sebelum menjadi pasangan." },
];

const PER_PAGE = 10;

function Icon({ name, size = 18 }: { name: "search" | "pin" | "eye" | "filter" | "chevron" | "menu" | "close"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
  if (name === "pin") return <svg {...common}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>;
  if (name === "eye") return <svg {...common}><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.4"/></svg>;
  if (name === "filter") return <svg {...common}><path d="M4 6h16M7 12h10M10 18h4"/></svg>;
  if (name === "chevron") return <svg {...common}><path d="m9 18 6-6-6-6"/></svg>;
  if (name === "close") return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
}

function Avatar({ post }: { post: Post }) {
  return (
    <div className={`${styles.avatar} ${post.gender === "Wanita" ? styles.avatarWoman : styles.avatarMan}`} aria-label={`Avatar ${post.gender.toLowerCase()}`}>
      <svg aria-hidden="true" viewBox="0 0 64 64">
        <circle cx="32" cy="23" r="12" fill="currentColor" opacity=".92" />
        {post.gender === "Wanita" ? <path d="M17 25c0-13 6-20 15-20s15 7 15 20c-3-8-8-13-15-13S20 17 17 25Zm2 32c2-13 7-20 13-20s11 7 13 20Z" fill="currentColor" opacity=".45" /> : <path d="M13 59c2-15 9-22 19-22s17 7 19 22Z" fill="currentColor" opacity=".45" />}
      </svg>
      <span>{post.initials}</span>
    </div>
  );
}

export default function FeedClient() {
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("Semua");
  const [location, setLocation] = useState("Semua lokasi");
  const [age, setAge] = useState("Semua umur");
  const [job, setJob] = useState("Semua pekerjaan");
  const [education, setEducation] = useState("Semua pendidikan");
  const [target, setTarget] = useState("Semua target");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filterOpen, setFilterOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [language, setLanguage] = useState<"ID" | "EN">("ID");

  const filtered = useMemo(() => POSTS.filter((post) => {
    const text = `${post.initials} ${post.location} ${post.province} ${post.job} ${post.text}`.toLowerCase();
    const [minAge, maxAge] = age === "24–27" ? [24, 27] : age === "28–31" ? [28, 31] : age === "32–35" ? [32, 35] : [0, 99];
    return text.includes(query.toLowerCase())
      && (gender === "Semua" || post.gender === gender)
      && (location === "Semua lokasi" || post.province === location)
      && post.age >= minAge && post.age <= maxAge
      && (job === "Semua pekerjaan" || post.job === job)
      && (education === "Semua pendidikan" || post.education === education)
      && (target === "Semua target" || post.marriageTarget === Number(target));
  }), [query, gender, location, age, job, education, target]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const visiblePosts = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const updateFilter = (setter: (value: string) => void, value: string) => { setter(value); setPage(1); };
  const resetFilters = () => { setGender("Semua"); setLocation("Semua lokasi"); setAge("Semua umur"); setJob("Semua pekerjaan"); setEducation("Semua pendidikan"); setTarget("Semua target"); setPage(1); };
  const toggleExpanded = (id: number) => setExpanded((current) => {
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });

  const filters = (
    <>
      <div className={styles.filterHeading}><div><span className={styles.eyebrow}>Pencarian khusus</span><h2>Filter pasangan</h2></div><button className={styles.mobileClose} onClick={() => setFilterOpen(false)} aria-label="Tutup filter"><Icon name="close" /></button></div>
      <div className={styles.filterGroup}><label htmlFor="location">Lokasi</label><select id="location" value={location} onChange={(e) => updateFilter(setLocation, e.target.value)}><option>Semua lokasi</option>{[...new Set(POSTS.map((post) => post.province))].map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className={styles.filterGroup}><span>Gender</span><div className={styles.segmented}>{["Semua", "Pria", "Wanita"].map((item) => <button key={item} className={gender === item ? styles.activeSegment : ""} onClick={() => updateFilter(setGender, item)}>{item}</button>)}</div></div>
      <div className={styles.filterGroup}><label htmlFor="age">Umur</label><select id="age" value={age} onChange={(e) => updateFilter(setAge, e.target.value)}><option>Semua umur</option><option>24–27</option><option>28–31</option><option>32–35</option></select></div>
      <div className={styles.filterGroup}><label htmlFor="job">Pekerjaan</label><select id="job" value={job} onChange={(e) => updateFilter(setJob, e.target.value)}><option>Semua pekerjaan</option>{[...new Set(POSTS.map((post) => post.job))].sort().map((item) => <option key={item}>{item}</option>)}</select></div>
      <div className={styles.filterGroup}><label htmlFor="education">Pendidikan</label><select id="education" value={education} onChange={(e) => updateFilter(setEducation, e.target.value)}><option>Semua pendidikan</option><option>D3</option><option>S1</option><option>S2</option></select></div>
      <div className={styles.filterGroup}><span>Target menikah</span><div className={styles.yearGrid}>{[1, 2, 3, 4, 5].map((year) => <button key={year} className={target === String(year) ? styles.activeYear : ""} onClick={() => updateFilter(setTarget, String(year))}>{year} thn</button>)}</div></div>
      <button className={styles.resetButton} onClick={resetFilters}>Reset semua filter</button>
    </>
  );

  return (
    <div className={styles.page}>
      <header className={styles.navbar}>
        <div className={styles.navInner}>
          <Link className={styles.logo} href="/feed" aria-label="onYou home"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
          <nav className={`${styles.navLinks} ${navOpen ? styles.navOpen : ""}`} aria-label="Navigasi utama">
            <Link className={styles.activeNav} href="/feed">Home</Link><Link href="#">Dashboard</Link><Link href="#">Pengaturan</Link>
          </nav>
          <div className={styles.navActions}>
            <label className={styles.search}><Icon name="search" /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Cari seseorang..." aria-label="Cari postingan" /></label>
            <div className={styles.language} aria-label="Pilih bahasa">{(["ID", "EN"] as const).map((item) => <button key={item} onClick={() => setLanguage(item)} className={language === item ? styles.activeLanguage : ""}>{item}</button>)}</div>
            <Link className={styles.login} href="#">Login</Link><Link className={styles.register} href="#">Register</Link>
            <button className={styles.menuButton} onClick={() => setNavOpen((open) => !open)} aria-label="Buka menu"><Icon name={navOpen ? "close" : "menu"} /></button>
          </div>
        </div>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroInner}><span className={styles.heroTag}>Temukan yang sejalan</span><h1>Cerita nyata.<br/><em>Niat yang sama.</em></h1><p>Kenali seseorang melalui nilai, mimpi, dan tujuan hidupnya—bukan sekadar foto.</p><div className={styles.heroStats}><div><strong>20</strong><span>cerita hari ini</span></div><div><strong>14</strong><span>kota di Indonesia</span></div><div><strong>100%</strong><span>niat serius</span></div></div></div>
      </section>

      <main className={styles.main}>
        <button className={styles.mobileFilterButton} onClick={() => setFilterOpen(true)}><Icon name="filter" /> Filter pasangan</button>
        <aside className={`${styles.sidebar} ${filterOpen ? styles.sidebarOpen : ""}`}>{filters}</aside>
        {filterOpen && <button className={styles.overlay} onClick={() => setFilterOpen(false)} aria-label="Tutup filter" />}

        <section className={styles.feed} aria-labelledby="feed-title">
          <div className={styles.feedHeader}><div><span className={styles.eyebrow}>Pilihan terbaru</span><h2 id="feed-title">Temukan ceritanya</h2></div><span className={styles.resultCount}>{filtered.length} postingan</span></div>
          {visiblePosts.length ? <div className={styles.postList}>{visiblePosts.map((post) => {
            const isLong = post.text.length > 255;
            const isExpanded = expanded.has(post.id);
            const shownText = isLong && !isExpanded ? `${post.text.slice(0, 255).trimEnd()}…` : post.text;
            return <article className={styles.postCard} key={post.id}>
              <div className={styles.postTop}><Avatar post={post}/><div className={styles.identity}><div><strong>{post.initials}</strong><span className={post.gender === "Wanita" ? styles.womanBadge : styles.manBadge}>{post.gender}, {post.age}</span></div><p>{post.job} · {post.education}</p></div><time>{post.published}</time></div>
              <p className={styles.postText}>{shownText}</p>
              {isLong && <button className={styles.readMore} onClick={() => toggleExpanded(post.id)}>{isExpanded ? "Tampilkan lebih sedikit" : "Lihat selengkapnya"}<Icon name="chevron" size={15}/></button>}
              <div className={styles.postMeta}><span><Icon name="pin" size={16}/>{post.location}, {post.province}</span><span><Icon name="eye" size={16}/>{post.views.toLocaleString("id-ID")} dilihat</span><span className={styles.targetChip}>Target {post.marriageTarget} tahun</span></div>
            </article>;
          })}</div> : <div className={styles.empty}><span>✦</span><h3>Belum ada cerita yang cocok</h3><p>Coba ubah kata pencarian atau reset filter Anda.</p><button onClick={resetFilters}>Reset filter</button></div>}

          {pages > 1 && <nav className={styles.pagination} aria-label="Pagination feed"><button onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1} aria-label="Halaman sebelumnya"><Icon name="chevron" /></button>{Array.from({length: pages}, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? styles.activePage : ""} onClick={() => { setPage(number); window.scrollTo({top: 400, behavior: "smooth"}); }}>{number}</button>)}<button onClick={() => setPage((value) => Math.min(pages, value + 1))} disabled={page === pages} aria-label="Halaman berikutnya"><Icon name="chevron" /></button></nav>}
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerTop}><div><Link className={styles.footerLogo} href="/feed"><span className={styles.logoMark}>oY</span><span>onYou</span></Link><p>Ruang yang aman untuk menemukan seseorang dengan tujuan yang sama.</p></div><div className={styles.socials}>{[["f","Facebook"],["in","LinkedIn"],["𝕏","X"],["▶","YouTube"],["◎","Instagram"],["♪","TikTok"]].map(([icon,label]) => <a key={label} href="#" aria-label={label}>{icon}</a>)}</div></div>
        <div className={styles.footerBottom}><p>© 2025–2026 onYou</p><nav aria-label="Tautan legal">{["Terms of Service","Privacy Policy","CA Notice at Collection","Your Privacy Choices","Accessibility","Sitemap"].map((item) => <a key={item} href="#">{item}</a>)}</nav></div>
      </footer>
    </div>
  );
}
