export type StudioNavItem = {
  label: string;
  href: string;
  description: string;
};

export const studioNavItems: StudioNavItem[] = [
  {
    label: "Fragrance Database",
    description: "One-button FragDB scan, update, and automatic perfume discovery.",
    href: "/studio",
  },
  {
    label: "Users",
    href: "/studio/users",
    description: "Create, reset and delete platform users.",
  },
];
