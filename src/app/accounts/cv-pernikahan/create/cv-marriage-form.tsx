"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import styles from "./cv-marriage.module.css";

type Panel = "language" | "notification" | "message" | null;
type Values = Record<string, string>;

const STEPS = [
  { number: 1, short: "Pribadi", title: "Data Pribadi", description: "Informasi dasar mengenai diri Anda." },
  { number: 2, short: "Tentang", title: "Tentang Saya & Keluarga", description: "Ceritakan latar belakang dan keseharian Anda." },
  { number: 3, short: "Visi", title: "Visi Pernikahan", description: "Bagikan pandangan dan rencana setelah menikah." },
  { number: 4, short: "Kesiapan", title: "Harapan & Kesiapan", description: "Lengkapi harapan pasangan dan target menikah." },
];

const REQUIRED: Record<number, string[]> = {
  1: ["fullName", "birthPlace", "birthDate", "domicile", "religion", "maritalStatus", "education", "job"],
  2: [],
  3: [],
  4: [],
};

function cx(...names: Array<string | false | undefined>) {
  return names.filter(Boolean).join(" ");
}

function Icon({ name, size = 20 }: { name: "menu" | "close" | "globe" | "bell" | "chat" | "chevron" | "post" | "cv" | "settings" | "check" | "arrow"; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<typeof name, ReactNode> = {
    menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
    close: <path d="m6 6 12 12M18 6 6 18"/>,
    globe: <><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    chat: <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5"/>,
    post: <><path d="M6 3h9l4 4v14H6Z"/><path d="M14 3v5h5M9 12h6M9 16h6"/></>,
    cv: <><rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="2"/><path d="M8 16c1-3 7-3 8 0"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19 15a2 2 0 0 0 .4 2l-2.4 2.4a2 2 0 0 0-2-.4 2 2 0 0 0-1 2h-4a2 2 0 0 0-1-2 2 2 0 0 0-2 .4L4.6 17A2 2 0 0 0 5 15a2 2 0 0 0-2-1v-4a2 2 0 0 0 2-1 2 2 0 0 0-.4-2L7 4.6A2 2 0 0 0 9 5a2 2 0 0 0 1-2h4a2 2 0 0 0 1 2 2 2 0 0 0 2-.4L19.4 7A2 2 0 0 0 19 9a2 2 0 0 0 2 1v4a2 2 0 0 0-2 1Z"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

type ControlProps = { label: string; name: string; value: string; onChange: (name: string, value: string) => void; required?: boolean; placeholder?: string; error?: boolean };

function Field({ label, name, value, onChange, required, placeholder, error, type = "text", suffix }: ControlProps & { type?: string; suffix?: string }) {
  return <label className={styles.field}>
    <span>{label}{required ? <b>Wajib</b> : <em>Opsional</em>}</span>
    <div className={cx(styles.inputWrap, error && styles.invalid)}><input name={name} type={type} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} required={required} aria-invalid={error}/>{suffix && <small>{suffix}</small>}</div>
    {error && <i>{label} perlu diisi.</i>}
  </label>;
}

function TextArea({ label, name, value, onChange, required, placeholder, error, rows = 4 }: ControlProps & { rows?: number }) {
  return <label className={cx(styles.field, styles.full)}>
    <span>{label}{required ? <b>Wajib</b> : <em>Opsional</em>}</span>
    <textarea name={name} value={value} onChange={(event) => onChange(name, event.target.value)} placeholder={placeholder} rows={rows} className={error ? styles.invalid : ""} required={required} aria-invalid={error}/>
    {error && <i>{label} perlu diisi.</i>}
  </label>;
}

export default function CvMarriageForm() {
  const [step, setStep] = useState(1);
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Set<string>>(new Set());
  const [panel, setPanel] = useState<Panel>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) setPanel(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const update = (name: string, nextValue: string) => {
    setValues((current) => ({ ...current, [name]: nextValue }));
    setErrors((current) => { const nextErrors = new Set(current); nextErrors.delete(name); return nextErrors; });
  };
  const value = (name: string) => values[name] ?? "";
  const validate = (currentStep: number) => {
    const missing = REQUIRED[currentStep].filter((name) => !value(name).trim());
    setErrors(new Set(missing));
    return missing.length === 0;
  };
  const next = () => {
    if (validate(step)) {
      setStep((current) => Math.min(4, current + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const previous = () => { setErrors(new Set()); setStep((current) => Math.max(1, current - 1)); };
  const submit = (event: FormEvent) => { event.preventDefault(); if (validate(4)) setSubmitted(true); };
  const togglePanel = (target: Exclude<Panel, null>) => setPanel((current) => current === target ? null : target);
  const completed = Object.values(values).filter(Boolean).length;

  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <button className={styles.mobileMenu} onClick={() => setSidebarOpen(true)} aria-label="Buka menu akun"><Icon name="menu"/></button>
      <Link className={styles.logo} href="/feed"><span className={styles.logoMark}>oY</span><span>onYou</span></Link>
      <Link className={styles.feedLink} href="/feed">Feed</Link>
      <div className={styles.headerActions} ref={panelRef}>
        <button className={styles.language} onClick={() => togglePanel("language")} aria-expanded={panel === "language"}><Icon name="globe" size={18}/><span>ID</span><Icon name="chevron" size={12}/></button>
        <button className={styles.iconButton} onClick={() => togglePanel("notification")} aria-label="Notifikasi" aria-expanded={panel === "notification"}><Icon name="bell"/><i>2</i></button>
        <button className={styles.iconButton} onClick={() => togglePanel("message")} aria-label="Pesan masuk" aria-expanded={panel === "message"}><Icon name="chat"/><i>3</i></button>
        <span className={styles.avatar}>NZ</span>
        {panel && <div className={styles.dropdown}>
          {panel === "language" && <><strong>Pilih bahasa</strong><button className={styles.selected}>Bahasa Indonesia <span>✓</span></button><button>English</button></>}
          {panel === "notification" && <><div className={styles.dropdownHead}><strong>Notifikasi</strong><button>Tandai dibaca</button></div><div className={styles.notice}><span>✦</span><div><b>CV hampir lengkap</b><p>Lanjutkan pengisian CV Pernikahan Anda.</p><small>10 menit lalu</small></div></div><div className={styles.notice}><span>♥</span><div><b>Aktivitas baru</b><p>Profil Anda baru saja dilihat.</p><small>1 jam lalu</small></div></div></>}
          {panel === "message" && <><div className={styles.dropdownHead}><strong>Pesan masuk</strong><button>Lihat semua</button></div><div className={styles.notice}><span>AS</span><div><b>Aulia S.</b><p>Halo, salam kenal dari saya…</p><small>8 menit lalu</small></div></div><div className={styles.notice}><span>RA</span><div><b>Rizky A.</b><p>Terima kasih sudah membalas.</p><small>Kemarin</small></div></div></>}
        </div>}
      </div>
    </div></header>

    <div className={styles.shell}>
      <aside className={cx(styles.sidebar, sidebarOpen && styles.sidebarOpen)}>
        <div className={styles.sidebarTitle}><span>Menu akun</span><button onClick={() => setSidebarOpen(false)} aria-label="Tutup menu"><Icon name="close"/></button></div>
        <nav aria-label="Navigasi akun">
          <Link className={styles.activeMenu} href="/accounts/cv-pernikahan/create"><Icon name="cv"/>CV Nikah</Link>
          <Link href="/accounts/post"><Icon name="post"/>Postingan</Link>
          <Link href="#"><Icon name="chat"/>Pesan Masuk<span>3</span></Link>
          <Link href="#"><Icon name="settings"/>Pengaturan</Link>
        </nav>
        <div className={styles.sidebarInfo}><strong>Privasi Anda penting</strong><p>Informasi sensitif hanya ditampilkan sesuai pengaturan privasi yang Anda pilih.</p></div>
      </aside>
      {sidebarOpen && <button className={styles.overlay} onClick={() => setSidebarOpen(false)} aria-label="Tutup menu akun"/>}

      <main className={styles.main}>
        <div className={styles.intro}><span>CV Pernikahan</span><h1>Kenalkan diri dengan lebih bermakna.</h1><p>Lengkapi informasi secara jujur dan nyaman. Anda dapat kembali ke tahap sebelumnya kapan saja.</p></div>
        <ol className={styles.steps}>{STEPS.map((item) => <li key={item.number} className={cx(step === item.number && styles.currentStep, step > item.number && styles.doneStep)}><button type="button" onClick={() => item.number < step && setStep(item.number)} disabled={item.number > step}><span>{step > item.number ? <Icon name="check" size={15}/> : item.number}</span><small>{item.short}</small></button></li>)}</ol>

        <form onSubmit={submit} noValidate>
          <div className={styles.sectionHead}><div><span>Tahap {step} dari 4</span><h2>{STEPS[step - 1].title}</h2><p>{STEPS[step - 1].description}</p></div></div>

          {step === 1 && <div className={styles.fields}>
            <Field label="Nama lengkap" name="fullName" value={value("fullName")} onChange={update} required placeholder="Masukkan nama lengkap" error={errors.has("fullName")}/>
            <Field label="Tempat lahir" name="birthPlace" value={value("birthPlace")} onChange={update} required placeholder="Contoh: Makassar" error={errors.has("birthPlace")}/>
            <Field label="Tanggal lahir" name="birthDate" value={value("birthDate")} onChange={update} required type="date" error={errors.has("birthDate")}/>
            <Field label="Domisili sekarang" name="domicile" value={value("domicile")} onChange={update} required placeholder="Kota tempat tinggal" error={errors.has("domicile")}/>
            <Field label="Agama" name="religion" value={value("religion")} onChange={update} required placeholder="Masukkan agama" error={errors.has("religion")}/>
            <label className={styles.field}><span>Status pernikahan<b>Wajib</b></span><select name="maritalStatus" value={value("maritalStatus")} onChange={(event) => update("maritalStatus", event.target.value)} className={errors.has("maritalStatus") ? styles.invalid : ""} required aria-invalid={errors.has("maritalStatus")}><option value="">Pilih status</option><option>Belum pernah menikah</option><option>Pernah menikah</option></select>{errors.has("maritalStatus") && <i>Status pernikahan perlu dipilih.</i>}</label>
            <Field label="Pendidikan terakhir" name="education" value={value("education")} onChange={update} required placeholder="Jenjang dan jurusan" error={errors.has("education")}/>
            <Field label="Pekerjaan" name="job" value={value("job")} onChange={update} required placeholder="Profesi atau bidang pekerjaan" error={errors.has("job")}/>
            <Field label="Pendapatan bulanan" name="income" value={value("income")} onChange={update} type="number" placeholder="0" suffix="Rupiah"/>
            <Field label="Tinggi badan" name="height" value={value("height")} onChange={update} type="number" placeholder="0" suffix="cm"/>
            <Field label="Berat badan" name="weight" value={value("weight")} onChange={update} type="number" placeholder="0" suffix="kg"/>
          </div>}

          {step === 2 && <div className={styles.fields}>
            <TextArea label="Tentang saya" name="about" value={value("about")} onChange={update} placeholder="Ceritakan karakter, nilai hidup, dan hal yang penting bagi Anda…"/>
            <div className={styles.subheading}><h3>Latar Belakang Keluarga</h3><p>Informasi singkat mengenai keluarga dan keseharian Anda.</p></div>
            <Field label="Anak ke" name="childOrder" value={value("childOrder")} onChange={update} type="number" placeholder="1"/>
            <Field label="Dari jumlah bersaudara" name="siblingCount" value={value("siblingCount")} onChange={update} type="number" placeholder="3"/>
            <TextArea label="Gambaran keluarga" name="familyOverview" value={value("familyOverview")} onChange={update} placeholder="Ceritakan suasana, kebiasaan, dan nilai keluarga…"/>
            <TextArea label="Tanggungan dalam keluarga saat ini" name="dependents" value={value("dependents")} onChange={update} placeholder="Jika ada dan ingin disampaikan…"/>
            <TextArea label="Keseharian dan gaya hidup" name="lifestyle" value={value("lifestyle")} onChange={update} placeholder="Ceritakan rutinitas dan gaya hidup Anda…"/>
            <Field label="Hobi dan minat" name="interests" value={value("interests")} onChange={update} placeholder="Hal yang Anda sukai"/>
            <TextArea label="Kebiasaan beribadah" name="worship" value={value("worship")} onChange={update} placeholder="Ceritakan jika Anda merasa nyaman…"/>
            <label className={styles.field}><span>Kebiasaan merokok<em>Opsional</em></span><select name="smoking" value={value("smoking")} onChange={(event) => update("smoking", event.target.value)}><option value="">Pilih jawaban</option><option>Tidak merokok</option><option>Kadang-kadang</option><option>Merokok</option></select></label>
            <TextArea label="Hal penting lainnya" name="otherInfo" value={value("otherInfo")} onChange={update} placeholder="Tambahkan informasi lain yang ingin disampaikan…"/>
          </div>}

          {step === 3 && <div className={styles.fields}>
            <TextArea label="Visi pernikahan" name="marriageVision" value={value("marriageVision")} onChange={update} placeholder="Apa arti dan tujuan pernikahan bagi Anda?" rows={5}/>
            <div className={styles.subheading}><h3>Rencana Setelah Menikah</h3><p>Bagikan harapan Anda sebagai bahan diskusi bersama pasangan.</p></div>
            <TextArea label="Tempat tinggal" name="residencePlan" value={value("residencePlan")} onChange={update} placeholder="Harapan tempat tinggal atau keterbukaan untuk berdiskusi…"/>
            <TextArea label="Pengelolaan keuangan" name="financePlan" value={value("financePlan")} onChange={update} placeholder="Pandangan mengenai pemasukan, pengeluaran, dan tabungan…"/>
            <TextArea label="Pandangan tentang anak dan pengasuhan" name="childrenPlan" value={value("childrenPlan")} onChange={update} placeholder="Harapan mengenai anak dan pola pengasuhan…"/>
            <TextArea label="Pembagian peran rumah tangga" name="householdRoles" value={value("householdRoles")} onChange={update} placeholder="Pandangan mengenai pembagian tanggung jawab…"/>
          </div>}

          {step === 4 && <div className={styles.fields}>
            <TextArea label="Harapan terhadap pasangan" name="partnerExpectation" value={value("partnerExpectation")} onChange={update} placeholder="Ceritakan nilai, karakter, dan harapan Anda…" rows={5}/>
            <Field label="Target waktu menikah" name="marriageTarget" value={value("marriageTarget")} onChange={update} placeholder="Contoh: dalam 1–2 tahun"/>
            <TextArea label="Persiapan yang sedang dilakukan" name="preparation" value={value("preparation")} onChange={update} placeholder="Ceritakan persiapan pribadi, finansial, atau keluarga…"/>
            <section className={styles.review}><div><span><Icon name="check" size={17}/></span><div><h3>Siap untuk ditinjau</h3><p>Anda telah mengisi {completed} informasi. Periksa kembali setiap tahap sebelum menyimpan CV.</p></div></div><button type="button" onClick={() => setStep(1)}>Tinjau dari awal</button></section>
          </div>}

          {errors.size > 0 && <div className={styles.errorSummary}>Lengkapi {errors.size} kolom wajib yang ditandai sebelum melanjutkan.</div>}
          <div className={styles.formActions}>{step > 1 ? <button type="button" className={styles.backButton} onClick={previous}><Icon name="arrow" size={17}/>Kembali</button> : <span/>}{step < 4 ? <button type="button" className={styles.nextButton} onClick={next}>Lanjutkan<Icon name="arrow" size={17}/></button> : <button type="submit" className={styles.nextButton}>Simpan CV<Icon name="check" size={17}/></button>}</div>
        </form>
      </main>
    </div>

    {submitted && <div className={styles.modalBackdrop}><section className={styles.successModal} role="dialog" aria-modal="true" aria-labelledby="success-title"><span><Icon name="check" size={27}/></span><h2 id="success-title">CV berhasil disimpan</h2><p>Informasi CV Pernikahan Anda sudah tersimpan dan dapat diperbarui kembali melalui menu akun.</p><button onClick={() => setSubmitted(false)}>Kembali ke CV Pernikahan</button></section></div>}
  </div>;
}
