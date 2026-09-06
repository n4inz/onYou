"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ACCOUNT_NAVIGATION, isAccountNavigationActive } from "../account-navigation";
import styles from "./accounts-post.module.css";

type Post = { id: number; text: string; published: string; views: number };
type Panel = "language" | "notifications" | "messages" | null;

const INITIAL_POSTS: Post[] = [
  { id: 1, published: "5 September 2026", views: 284, text: "Saya percaya hubungan yang baik tumbuh dari niat yang jujur, komunikasi yang terbuka, dan kesediaan untuk saling mendengarkan. Di tengah kesibukan, saya selalu menyediakan waktu untuk keluarga, membaca buku, dan mencoba tempat makan baru. Saya berharap dapat mengenal seseorang yang hangat, mandiri, menghargai proses, serta memiliki tujuan yang sama untuk membangun keluarga dengan penuh tanggung jawab dan rasa syukur." },
  { id: 2, published: "28 Agustus 2026", views: 191, text: "Akhir pekan bagi saya adalah waktu untuk pulang, memasak bersama keluarga, atau menikmati perjalanan singkat. Sedang membuka hati untuk seseorang yang komunikatif, dewasa, dan punya visi hidup yang jelas." },
  { id: 3, published: "16 Agustus 2026", views: 346, text: "Tidak mencari seseorang yang sempurna. Saya ingin bertemu partner yang mau belajar, bertumbuh, dan menghadapi setiap musim kehidupan sebagai satu tim. Kejujuran dan konsistensi adalah dua hal yang paling saya hargai." },
  { id: 4, published: "3 Agustus 2026", views: 128, text: "Saya bekerja di bidang teknologi dan menikmati hal sederhana seperti kopi pagi, jalan kaki, serta percakapan panjang. Harapannya, perkenalan di sini bisa dimulai dengan santai tetapi tetap memiliki arah yang serius." },
  { id: 5, published: "21 Juli 2026", views: 423, text: "Keluarga selalu menjadi tempat pulang yang utama. Saya ingin membangun rumah yang hangat bersama seseorang yang bisa menjadi teman bertukar cerita, saling mendukung karier, dan tidak berhenti bertumbuh." },
  { id: 6, published: "9 Juli 2026", views: 267, text: "Menyukai perjalanan, fotografi, dan kegiatan sosial. Bagi saya, pasangan adalah sahabat yang bisa berbagi mimpi sekaligus tetap menghargai ruang pribadi satu sama lain." },
  { id: 7, published: "30 Juni 2026", views: 102, text: "Saya pribadi yang tenang dan lebih senang membuktikan perhatian melalui tindakan. Mencari seseorang yang tulus, dekat dengan keluarga, dan siap berproses tanpa terburu-buru." },
];

const PER_PAGE = 4;

function Icon({ name, size = 20 }: { name: "bell" | "chat" | "globe" | "chevron" | "more" | "edit" | "trash" | "plus" | "eye" | "calendar" | "menu" | "close" | "post" | "cv" | "settings"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<typeof name, React.ReactNode> = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
    trash: <><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
    eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H3v-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V3h4v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

export default function AccountsPostClient() {
  const pathname = usePathname();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editor, setEditor] = useState<{ mode: "create" | "edit"; post?: Post } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [draft, setDraft] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  const visiblePosts = useMemo(() => posts.slice((page - 1) * PER_PAGE, page * PER_PAGE), [page, posts]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const openEditor = (post?: Post) => {
    setDraft(post?.text ?? "");
    setEditor({ mode: post ? "edit" : "create", post });
    setOpenMenu(null);
  };

  const savePost = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    if (editor?.mode === "edit" && editor.post) {
      setPosts((current) => current.map((post) => post.id === editor.post?.id ? { ...post, text } : post));
    } else {
      setPosts((current) => [{ id: Date.now(), text, published: "Hari ini", views: 0 }, ...current]);
      setPage(1);
    }
    setEditor(null);
  };

  const deletePost = () => {
    if (!deleteTarget) return;
    const next = posts.filter((post) => post.id !== deleteTarget.id);
    setPosts(next);
    setPage(Math.min(page, Math.max(1, Math.ceil(next.length / PER_PAGE))));
    setDeleteTarget(null);
  };

  const togglePanel = (next: Exclude<Panel, null>) => setPanel((current) => current === next ? null : next);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button className={styles.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka navigasi akun"><Icon name="menu" /></button>
          <Link className={styles.logo} href="/feed" aria-label="onYou"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
          <nav className={styles.headerNav} aria-label="Navigasi utama"><Link href="/feed">Feed</Link></nav>
          <div className={styles.headerActions} ref={panelRef}>
            <button className={styles.languageButton} onClick={() => togglePanel("language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={13}/></button>
            <button className={styles.iconButton} onClick={() => togglePanel("notifications")} aria-label="Notifikasi" aria-expanded={panel === "notifications"}><Icon name="bell"/><span className={styles.badge}>2</span></button>
            <button className={styles.iconButton} onClick={() => togglePanel("messages")} aria-label="Pesan masuk" aria-expanded={panel === "messages"}><Icon name="chat"/><span className={styles.badge}>3</span></button>
            <div className={styles.avatar}>NZ</div>
            {panel && <div className={styles.dropdown}>
              {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selectedOption}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
              {panel === "notifications" && <><div className={styles.dropdownTitle}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>✦</span><div><b>Postingan Anda dilihat</b><p>12 orang baru melihat postingan Anda.</p><small>10 menit lalu</small></div></div><div className={styles.notice}><span>♥</span><div><b>Ada respons baru</b><p>Seseorang tertarik dengan cerita Anda.</p><small>1 jam lalu</small></div></div></>}
              {panel === "messages" && <><div className={styles.dropdownTitle}><strong>Pesan masuk</strong><button>Lihat semua</button></div><div className={styles.notice}><span className={styles.miniAvatar}>AS</span><div><b>Aulia S.</b><p>Halo, saya tertarik mengenal lebih jauh…</p><small>8 menit lalu</small></div></div><div className={styles.notice}><span className={styles.miniAvatar}>RA</span><div><b>Rizky A.</b><p>Terima kasih sudah membalas pesan saya.</p><small>Kemarin</small></div></div></>}
            </div>}
          </div>
        </div>
      </header>

      <div className={styles.shell}>
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHead}><span>Menu akun</span><button onClick={() => setSidebarOpen(false)} aria-label="Tutup navigasi"><Icon name="close"/></button></div>
          <nav aria-label="Navigasi akun">
            {ACCOUNT_NAVIGATION.map((item) => {
              const active = isAccountNavigationActive(pathname, item.activePrefix);
              return <Link key={item.key} className={active ? styles.activeMenu : undefined} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setSidebarOpen(false)}><Icon name={item.icon}/>{item.label}{item.key === "posts" && <span>{posts.length}</span>}{item.key === "messages" && <span>3</span>}</Link>;
            })}
          </nav>
          <div className={styles.sidebarHelp}><span>Butuh bantuan?</span><p>Temukan jawaban atau hubungi tim dukungan onYou.</p><a href="#">Pusat Bantuan</a></div>
        </aside>
        {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup navigasi"/>}

        <main className={styles.content}>
          <div className={styles.titleRow}>
            <div><span className={styles.eyebrow}>Area akun</span><h1>Postingan Saya</h1><p>Kelola cerita yang telah Anda bagikan dengan komunitas onYou.</p></div>
            <button className={styles.createButton} onClick={() => openEditor()}><Icon name="plus" size={18}/>Buat postingan</button>
          </div>

          <div className={styles.summary}><span><b>{posts.length}</b> total postingan</span><span><b>{posts.reduce((sum, post) => sum + post.views, 0).toLocaleString("id-ID")}</b> total dilihat</span></div>

          {visiblePosts.length > 0 ? <div className={styles.postList}>{visiblePosts.map((post) => {
            const long = post.text.length > 255;
            const open = expanded.has(post.id);
            const text = long && !open ? `${post.text.slice(0, 255).trimEnd()}…` : post.text;
            return <article className={styles.post} key={post.id}>
              <div className={styles.postHeader}><div className={styles.postAuthor}><div className={styles.avatar}>NZ</div><div><strong>Postingan Anda</strong><span>Publik</span></div></div><div className={styles.postActions}><button onClick={() => setOpenMenu((current) => current === post.id ? null : post.id)} aria-label="Menu postingan" aria-expanded={openMenu === post.id}><Icon name="more"/></button>{openMenu === post.id && <div className={styles.actionMenu}><button onClick={() => openEditor(post)}><Icon name="edit" size={17}/>Edit postingan</button><button className={styles.danger} onClick={() => { setDeleteTarget(post); setOpenMenu(null); }}><Icon name="trash" size={17}/>Hapus postingan</button></div>}</div></div>
              <p className={styles.postText}>{text}</p>
              {long && <button className={styles.readMore} onClick={() => setExpanded((current) => { const next = new Set(current); if (next.has(post.id)) next.delete(post.id); else next.add(post.id); return next; })}>{open ? "Tampilkan lebih sedikit" : "Lihat selengkapnya"}</button>}
              <div className={styles.meta}><span><Icon name="calendar" size={16}/>{post.published}</span><span><Icon name="eye" size={17}/>{post.views.toLocaleString("id-ID")} kali dilihat</span></div>
            </article>;
          })}</div> : <div className={styles.empty}><Icon name="post" size={36}/><h2>Belum ada postingan</h2><p>Bagikan cerita pertama Anda untuk mulai dikenal.</p><button onClick={() => openEditor()}><Icon name="plus" size={17}/>Buat postingan</button></div>}

          {totalPages > 1 && <nav className={styles.pagination} aria-label="Navigasi halaman"><button onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1} aria-label="Halaman sebelumnya"><Icon name="chevron"/></button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} className={page === number ? styles.activePage : ""} onClick={() => setPage(number)} aria-current={page === number ? "page" : undefined}>{number}</button>)}<button onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page === totalPages} aria-label="Halaman berikutnya"><Icon name="chevron"/></button></nav>}
        </main>
      </div>

      {editor && <div className={styles.modalBackdrop} role="presentation"><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="editor-title"><div className={styles.modalHeader}><div><span className={styles.eyebrow}>Cerita Anda</span><h2 id="editor-title">{editor.mode === "edit" ? "Edit postingan" : "Buat postingan"}</h2></div><button onClick={() => setEditor(null)} aria-label="Tutup"><Icon name="close"/></button></div><form onSubmit={savePost}><label htmlFor="post-draft">Isi postingan</label><textarea id="post-draft" autoFocus value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ceritakan tentang diri, nilai, dan tujuan Anda…" rows={7}/><div className={styles.editorFooter}><span>{draft.length.toLocaleString("id-ID")} karakter</span><div><button type="button" className={styles.cancelButton} onClick={() => setEditor(null)}>Batal</button><button type="submit" className={styles.saveButton} disabled={!draft.trim()}>{editor.mode === "edit" ? "Simpan perubahan" : "Publikasikan"}</button></div></div></form></section></div>}

      {deleteTarget && <div className={styles.modalBackdrop} role="presentation"><section className={`${styles.modal} ${styles.confirmModal}`} role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><div className={styles.deleteIcon}><Icon name="trash"/></div><h2 id="delete-title">Hapus postingan?</h2><p>Postingan yang dihapus tidak dapat dikembalikan. Apakah Anda yakin ingin melanjutkan?</p><div className={styles.confirmActions}><button className={styles.cancelButton} onClick={() => setDeleteTarget(null)}>Batal</button><button className={styles.deleteButton} onClick={deletePost}>Ya, hapus</button></div></section></div>}
    </div>
  );
}
