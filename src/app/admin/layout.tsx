
import Link from "next/link";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";

import Logo from "@/components/logo";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="flex items-center justify-center p-2 group-data-[collapsible=icon]:p-0">
          <div className="w-32 group-data-[collapsible=icon]:hidden transition-all duration-200">
            <Logo />
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full p-2">
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/admin" passHref>
                <SidebarMenuButton tooltip="Dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/services" passHref>
                <SidebarMenuButton tooltip="Servicios">
                  <Briefcase />
                  <span>Servicios</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/quotes" passHref>
                <SidebarMenuButton tooltip="Cotizaciones">
                  <FileText />
                  <span>Cotizaciones</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/customers" passHref>
                <SidebarMenuButton tooltip="Clientes">
                  <Users />
                  <span>Clientes</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/admin/settings" passHref>
                <SidebarMenuButton tooltip="Configuración">
                  <Settings />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                 <SidebarMenuItem>
                    <SidebarTrigger />
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <Link href="/login" passHref>
                        <SidebarMenuButton tooltip="Salir">
                            <LogOut />
                            <span>Salir</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="p-4 sm:p-6 lg:p-8 flex items-center gap-4">
            <SidebarTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                    <Menu />
                </Button>
            </SidebarTrigger>
            <div className="flex-1" />
            <SidebarTrigger className="hidden group-data-[collapsible=offcanvas]:hidden md:flex" />
        </header>
        <div className="p-4 sm:p-6 lg:p-8 pt-0">
            {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
