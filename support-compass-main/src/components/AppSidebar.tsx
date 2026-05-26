import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, BarChart3, Bell, Calendar, LogOut, ChevronDown, Shield, Upload, AlertTriangle
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UserRole } from "@/lib/types";

const adminNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Students", url: "/students", icon: GraduationCap },
  { title: "Mentors", url: "/mentors", icon: UserCheck },
  { title: "Data Upload", url: "/upload", icon: Upload },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Sessions", url: "/sessions", icon: Calendar },
  { title: "Parent Alerts", url: "/parent-alerts", icon: AlertTriangle },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const studentNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Performance", url: "/analytics", icon: BarChart3 },
  { title: "Sessions", url: "/sessions", icon: Calendar },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const mentorNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Students", url: "/students", icon: GraduationCap },
  { title: "Sessions", url: "/sessions", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const parentNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Alerts", url: "/parent-alerts", icon: AlertTriangle },
  { title: "Sessions", url: "/sessions", icon: Calendar },
  { title: "Notifications", url: "/notifications", icon: Bell },
];

const roleNavMap: Record<UserRole, typeof adminNav> = {
  admin: adminNav, student: studentNav, mentor: mentorNav, parent: parentNav,
};

export function AppSidebar() {
  const { user, logout, switchRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  if (!user) return null;
  const navItems = roleNavMap[user.role];

  return (
    <Sidebar className="border-r-0 sidebar-glow">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center neon-outline">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display font-bold text-sm text-sidebar-primary-foreground">EduGuard</h2>
            <p className="text-[10px] text-sidebar-foreground/60 uppercase tracking-wider">Dropout Prevention</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 text-[10px] uppercase tracking-widest px-3">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:text-sidebar-primary-foreground hover:bg-sidebar-accent transition-all text-sm"
                      activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium neon-item-active"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors">
            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {user.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-sidebar-primary-foreground">{user.name}</p>
              <p className="text-[10px] text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-sidebar-foreground/40" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(["admin", "student", "mentor", "parent"] as UserRole[]).map(role => (
              <DropdownMenuItem key={role} onClick={() => { switchRole(role); navigate("/"); }} className="capitalize">
                Switch to {role}
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem onClick={logout} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
