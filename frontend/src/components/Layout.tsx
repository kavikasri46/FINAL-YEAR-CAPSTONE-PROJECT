import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  // ⭐ New Feature: Smart Timetable Notification
  const [notifications, setNotifications] = useState<string[]>([]);

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />

        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <header className="h-14 border-b border-border/30 bg-transparent glass-card flex items-center justify-between px-4 sticky top-0 z-20 neon-glow">
            <div className="flex items-center gap-3">
              <SidebarTrigger />

              <div>
                <p className="text-sm font-medium">
                  Welcome back,
                  <span className="text-gradient font-semibold">
                    {" "}
                    {user.name}
                  </span>
                </p>

                <p className="text-[11px] text-muted-foreground capitalize">
                  {user.role} Dashboard
                </p>
              </div>
            </div>

            {/* Right Header Actions */}
            <div className="flex items-center gap-2">
              <Link
                to="/landing"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-300 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/25 transition-all shadow-sm"
              >
                <Globe className="h-3.5 w-3.5 text-pink-400" /> Landing Page
              </Link>

              {/* 🔔 Notification Bell */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </div>

          </header>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 overflow-auto">

            {/* ⭐ Smart Timetable Notification Box */}
            {notifications.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-muted text-sm border border-border/40">
                {notifications.map((note, index) => (
                  <p key={index}>🔔 {note}</p>
                ))}
              </div>
            )}

            {children}

          </main>

        </div>
      </div>
    </SidebarProvider>
  );
}