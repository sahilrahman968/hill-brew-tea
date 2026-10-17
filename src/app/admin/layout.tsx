import { headers } from "next/headers";
import { isAdminPanelRole } from "@/lib/auth/permissions";
import { CLIENT_ADMIN_USER } from "@/lib/admin-auth";
import AdminShell from "./components/AdminShell";

export const metadata = {
  title: "Admin Panel | E-Com",
  description: "E-Com store administration panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const userRole = headersList.get("x-user-role") || "";

  if (!isAdminPanelRole(userRole)) {
    return <>{children}</>;
  }

  return (
    <AdminShell
      userName={CLIENT_ADMIN_USER.name}
      userRole={userRole}
      permissions={["*"]}
    >
      {children}
    </AdminShell>
  );
}
