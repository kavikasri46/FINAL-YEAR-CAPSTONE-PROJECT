import { useAuth } from "@/contexts/AuthContext";
import AdminDashboard from "@/pages/AdminDashboard";
import StudentDashboard from "@/pages/StudentDashboard";
import MentorDashboard from "@/pages/MentorDashboard";
import ParentDashboard from "@/pages/ParentDashboard";

export default function Index() {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case "admin": return <AdminDashboard />;
    case "student": return <StudentDashboard />;
    case "mentor": return <MentorDashboard />;
    case "parent": return <ParentDashboard />;
    default: return <AdminDashboard />;
  }
}
