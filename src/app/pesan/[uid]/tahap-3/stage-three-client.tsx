"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CONNECTION_STAGE_TWO_STORAGE_KEY,
  ConnectionRequest,
  StageTwoState,
  getDisplayName,
} from "@/lib/connection-requests";
import styles from "./stage-three.module.css";

export default function StageThreeClient({ request }: { request: ConnectionRequest }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const saved = localStorage.getItem(CONNECTION_STAGE_TWO_STORAGE_KEY);
        const values = saved ? JSON.parse(saved) as Record<string, StageTwoState> : {};
        setAllowed(values[request.uid]?.completionStatus === "approved");
      } catch {
        setAllowed(false);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [request.uid]);

  return <main className={styles.page}>
    <div className={styles.inner}>
      <span className={styles.brand}>onYou</span>
      {allowed === null ? <section><p>Memeriksa status Tahap 2…</p></section> : !allowed ? <section>
        <small>Tahap 3 masih terkunci</small>
        <h1>Selesaikan persetujuan bersama terlebih dahulu.</h1>
        <p>Tahap 3 baru dapat dibuka setelah Anda dan {getDisplayName(request)} menyetujui bahwa Perkenalan Lanjutan telah selesai.</p>
        <Link href={`/pesan/${request.uid}/tahap-2`}>Kembali ke Tahap 2</Link>
      </section> : <>
        <ol aria-label="Tahapan koneksi">
          <li><span>✓</span><div><small>Tahap 1</small><strong>Review CV</strong></div></li>
          <li><span>✓</span><div><small>Tahap 2</small><strong>Perkenalan lanjutan</strong></div></li>
          <li className={styles.active}><span>3</span><div><small>Tahap 3</small><strong>Keputusan bersama</strong></div></li>
        </ol>
        <section>
          <small>Tahap berikutnya telah terbuka</small>
          <h1>Keputusan bersama dengan {getDisplayName(request)}</h1>
          <p>Anda dan calon pasangan telah menyetujui penyelesaian Perkenalan Lanjutan. Rangkaian keputusan akhir akan dilengkapi pada pengembangan Tahap 3.</p>
          <Link href={`/pesan/${request.uid}/tahap-2`}>Kembali ke Tahap 2</Link>
        </section>
      </>}
    </div>
  </main>;
}
