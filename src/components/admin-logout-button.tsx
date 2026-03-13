"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function AdminLogoutButton() {
  const router = useRouter();

  const onLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  };

  return (
    <SidebarMenuButton tooltip="Salir" onClick={onLogout}>
      <LogOut />
      <span>Salir</span>
    </SidebarMenuButton>
  );
}
