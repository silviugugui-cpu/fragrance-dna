export type StudioNavItem = {
  label: string;
  href: string;
  description: string;
};

export const studioNavItems: StudioNavItem[] = [
  {
    label: "Fragrance Database",
    description: "Search and manage canonical fragrance records.",
    href: "/studio",
  },
  {
    label: "Users",
    href: "/studio/users",
    description: "Create, reset and delete platform users.",
  },
];
