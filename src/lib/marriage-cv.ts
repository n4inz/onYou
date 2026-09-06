export type MarriageCvFieldKey =
  | "name"
  | "birth"
  | "domicile"
  | "religion"
  | "maritalStatus"
  | "education"
  | "job"
  | "income"
  | "height"
  | "weight"
  | "about"
  | "family"
  | "dependents"
  | "lifestyle"
  | "interests"
  | "worship"
  | "smoking"
  | "otherInfo"
  | "marriageVision"
  | "residencePlan"
  | "financePlan"
  | "childrenPlan"
  | "householdRoles"
  | "partnerExpectation"
  | "marriageTarget"
  | "preparation";

export type MarriageCvField = {
  key: MarriageCvFieldKey;
  label: string;
  value: string;
};

export type MarriageCvSection = {
  title: string;
  description: string;
  fields: MarriageCvField[];
};

export const DEMO_CV_UID = "nz-2026";
export const CV_PRIVACY_STORAGE_KEY = "onyou-cv-privacy-v1";

export const DEMO_FORM_VALUES: Record<string, string> = {
  fullName: "Naufal Zain",
  birthPlace: "Makassar",
  birthDate: "1996-02-14",
  domicile: "Bandung, Jawa Barat",
  religion: "Islam",
  maritalStatus: "Belum pernah menikah",
  education: "S1 Teknik Informatika",
  job: "Product Designer",
  income: "12000000",
  height: "174",
  weight: "68",
  about: "Pribadi yang tenang, terbuka, dan senang bertumbuh melalui pengalaman baru. Saya menghargai komunikasi yang jujur, waktu bersama keluarga, dan keseimbangan antara pekerjaan serta kehidupan pribadi.",
  childOrder: "2",
  siblingCount: "3",
  familyOverview: "Tumbuh di keluarga yang hangat dan terbiasa berdiskusi. Kami saling mendukung pendidikan, pekerjaan, dan pilihan hidup masing-masing.",
  dependents: "Membantu kebutuhan orang tua secara rutin.",
  lifestyle: "Bekerja pada hari kerja, berolahraga tiga kali seminggu, dan menghabiskan akhir pekan bersama keluarga atau teman dekat.",
  interests: "Membaca, fotografi, lari, dan mencoba tempat makan baru.",
  worship: "Menjaga ibadah wajib dan terus belajar memperbaiki kualitas ibadah sehari-hari.",
  smoking: "Tidak merokok",
  otherInfo: "Terbuka untuk berdomisili di kota lain setelah berdiskusi bersama.",
  marriageVision: "Membangun rumah tangga yang menjadi tempat aman untuk bertumbuh, beribadah, dan saling mendukung tujuan hidup.",
  residencePlan: "Terbuka tinggal mandiri di Bandung atau kota lain sesuai kebutuhan bersama.",
  financePlan: "Keuangan dikelola secara transparan melalui anggaran bersama, dana darurat, tabungan, dan ruang untuk kebutuhan pribadi.",
  childrenPlan: "Menginginkan anak dan sepakat bahwa pengasuhan merupakan tanggung jawab bersama yang perlu terus dipelajari.",
  householdRoles: "Pembagian peran dilakukan berdasarkan kemampuan, waktu, dan kesepakatan bersama, bukan semata berdasarkan gender.",
  partnerExpectation: "Seseorang yang hangat, komunikatif, bertanggung jawab, dekat dengan keluarga, dan siap bertumbuh bersama.",
  marriageTarget: "Dalam 1–2 tahun",
  preparation: "Menyiapkan dana, memperkuat kesiapan emosional, belajar komunikasi, dan berdiskusi dengan keluarga.",
};

export const MARRIAGE_CV_SECTIONS: MarriageCvSection[] = [
  {
    title: "Data Pribadi",
    description: "Informasi dasar untuk mengenal pemilik CV.",
    fields: [
      { key: "name", label: "Nama", value: DEMO_FORM_VALUES.fullName },
      { key: "birth", label: "Tempat, tanggal lahir", value: "Makassar, 14 Februari 1996" },
      { key: "domicile", label: "Domisili sekarang", value: DEMO_FORM_VALUES.domicile },
      { key: "religion", label: "Agama", value: DEMO_FORM_VALUES.religion },
      { key: "maritalStatus", label: "Status pernikahan", value: DEMO_FORM_VALUES.maritalStatus },
      { key: "education", label: "Pendidikan terakhir", value: DEMO_FORM_VALUES.education },
      { key: "job", label: "Pekerjaan", value: DEMO_FORM_VALUES.job },
      { key: "income", label: "Pendapatan bulanan", value: "Rp12.000.000" },
      { key: "height", label: "Tinggi badan", value: `${DEMO_FORM_VALUES.height} cm` },
      { key: "weight", label: "Berat badan", value: `${DEMO_FORM_VALUES.weight} kg` },
    ],
  },
  {
    title: "Tentang Saya",
    description: "Latar belakang keluarga, keseharian, dan nilai pribadi.",
    fields: [
      { key: "about", label: "Tentang saya", value: DEMO_FORM_VALUES.about },
      { key: "family", label: "Latar belakang keluarga", value: `Anak ke-${DEMO_FORM_VALUES.childOrder} dari ${DEMO_FORM_VALUES.siblingCount} bersaudara. ${DEMO_FORM_VALUES.familyOverview}` },
      { key: "dependents", label: "Tanggungan keluarga", value: DEMO_FORM_VALUES.dependents },
      { key: "lifestyle", label: "Keseharian dan gaya hidup", value: DEMO_FORM_VALUES.lifestyle },
      { key: "interests", label: "Hobi dan minat", value: DEMO_FORM_VALUES.interests },
      { key: "worship", label: "Kebiasaan beribadah", value: DEMO_FORM_VALUES.worship },
      { key: "smoking", label: "Kebiasaan merokok", value: DEMO_FORM_VALUES.smoking },
      { key: "otherInfo", label: "Hal penting lainnya", value: DEMO_FORM_VALUES.otherInfo },
    ],
  },
  {
    title: "Visi Pernikahan",
    description: "Pandangan dan rencana kehidupan setelah menikah.",
    fields: [
      { key: "marriageVision", label: "Visi pernikahan", value: DEMO_FORM_VALUES.marriageVision },
      { key: "residencePlan", label: "Rencana tempat tinggal", value: DEMO_FORM_VALUES.residencePlan },
      { key: "financePlan", label: "Pengelolaan keuangan", value: DEMO_FORM_VALUES.financePlan },
      { key: "childrenPlan", label: "Anak dan pengasuhan", value: DEMO_FORM_VALUES.childrenPlan },
      { key: "householdRoles", label: "Pembagian peran rumah tangga", value: DEMO_FORM_VALUES.householdRoles },
    ],
  },
  {
    title: "Harapan & Kesiapan",
    description: "Harapan terhadap pasangan dan kesiapan menuju pernikahan.",
    fields: [
      { key: "partnerExpectation", label: "Harapan terhadap pasangan", value: DEMO_FORM_VALUES.partnerExpectation },
      { key: "marriageTarget", label: "Target waktu menikah", value: DEMO_FORM_VALUES.marriageTarget },
      { key: "preparation", label: "Persiapan yang sedang dilakukan", value: DEMO_FORM_VALUES.preparation },
    ],
  },
];

export const DEFAULT_VISIBLE_CV_FIELDS: MarriageCvFieldKey[] = [
  "name",
  "birth",
  "domicile",
  "religion",
  "maritalStatus",
  "education",
  "job",
  "height",
  "weight",
];

export function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
