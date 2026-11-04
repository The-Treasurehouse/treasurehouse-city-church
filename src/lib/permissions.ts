// Roles come from the existing `church_role` enum in the Supabase project.
export type Role = "super_admin" | "pastor" | "administrator" | "finance_officer" | "member";

export const roleLabels: Record<Role, string> = {
  super_admin: "Super Admin",
  pastor: "Pastor",
  administrator: "Administrator",
  finance_officer: "Finance Officer",
  member: "Member",
};

// Highest first. A person with several roles gets the highest.
export const rolePrecedence: Role[] = ["super_admin", "pastor", "administrator", "finance_officer", "member"];

export const staffRoles: Role[] = ["super_admin", "pastor", "administrator", "finance_officer"];

/** Who may change records, by area. Reading is covered by the menu rules below. */
export const can = {
  manageMembers: ["super_admin", "pastor", "administrator"] as Role[],
  pastoralNotes: ["super_admin", "pastor"] as Role[],
  manageServices: ["super_admin", "pastor", "administrator"] as Role[],
  recordGiving: ["super_admin", "finance_officer"] as Role[],
  manageGroups: ["super_admin", "pastor", "administrator"] as Role[],
  manageEvents: ["super_admin", "pastor", "administrator"] as Role[],
  manageAnnouncements: ["super_admin", "pastor", "administrator"] as Role[],
  manageRoles: ["super_admin"] as Role[],
};

export type AdminNavItem = {
  label: string;
  href: string;
  icon:
    | "overview"
    | "members"
    | "attendance"
    | "finance"
    | "departments"
    | "followup"
    | "events"
    | "communication"
    | "settings";
  roles: Role[];
};

export const adminNav: AdminNavItem[] = [
  { label: "Overview", href: "/admin", icon: "overview", roles: staffRoles },
  { label: "Members", href: "/admin/members", icon: "members", roles: ["super_admin", "pastor", "administrator"] },
  { label: "Attendance & Services", href: "/admin/attendance", icon: "attendance", roles: ["super_admin", "pastor", "administrator"] },
  { label: "Giving", href: "/admin/finance", icon: "finance", roles: ["super_admin", "pastor", "finance_officer"] },
  { label: "Groups", href: "/admin/groups", icon: "departments", roles: ["super_admin", "pastor", "administrator"] },
  { label: "Events", href: "/admin/events", icon: "events", roles: ["super_admin", "pastor", "administrator"] },
  { label: "Communication", href: "/admin/communication", icon: "communication", roles: ["super_admin", "pastor", "administrator"] },
  { label: "Settings", href: "/admin/settings", icon: "settings", roles: ["super_admin"] },
];

export function canOpen(role: Role, href: string) {
  const item = adminNav.find((n) => n.href === href);
  return item ? item.roles.includes(role) : false;
}
