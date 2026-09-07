export type AccountNavigationKey = "cv" | "posts" | "messages" | "settings";

export const ACCOUNT_NAVIGATION = [
  {
    key: "cv",
    label: "CV Nikah",
    href: "/accounts/cv-pernikahan",
    activePrefix: "/accounts/cv-pernikahan",
    icon: "cv",
  },
  {
    key: "posts",
    label: "Postingan",
    href: "/accounts/post",
    activePrefix: "/accounts/post",
    icon: "post",
  },
  {
    key: "messages",
    label: "Pesan Masuk",
    href: "#",
    activePrefix: "/accounts/messages",
    icon: "chat",
  },
  {
    key: "settings",
    label: "Pengaturan",
    href: "#",
    activePrefix: "/accounts/settings",
    icon: "settings",
  },
] as const;

export function isAccountNavigationActive(pathname: string, activePrefix: string) {
  return pathname === activePrefix || pathname.startsWith(`${activePrefix}/`);
}
