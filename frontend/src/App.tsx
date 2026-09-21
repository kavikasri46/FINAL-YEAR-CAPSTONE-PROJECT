import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Students from "./pages/Students";
import Mentors from "./pages/Mentors";
import Analytics from "./pages/Analytics";
import Sessions from "./pages/Sessions";
import Notifications from "./pages/Notifications";
import DataUpload from "./pages/DataUpload";
import ParentAlerts from "./pages/ParentAlerts";
import NotFound from "./pages/NotFound";
import ERPDashboard from "./pages/erp/ERPDashboard";
import SyncERP from "./pages/erp/SyncERP";
import AcademicRecords from "./pages/erp/AcademicRecords";
import AttendancePage from "./pages/erp/AttendancePage";
import InternalMarksPage from "./pages/erp/InternalMarksPage";
import SemesterResults from "./pages/erp/SemesterResults";
import AIAnalytics from "./pages/erp/AIAnalytics";
import AcademicReports from "./pages/erp/AcademicReports";
import ERPCharts from "./pages/erp/ERPCharts";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return <Layout>{children}</Layout>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/students" element={<ProtectedRoute><Students /></ProtectedRoute>} />
      <Route path="/mentors" element={<ProtectedRoute><Mentors /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/sessions" element={<ProtectedRoute><Sessions /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><DataUpload /></ProtectedRoute>} />
      <Route path="/parent-alerts" element={<ProtectedRoute><ParentAlerts /></ProtectedRoute>} />
      {/* ERP Integration Routes */}
      <Route path="/erp" element={<ProtectedRoute><ERPDashboard /></ProtectedRoute>} />
      <Route path="/erp/sync" element={<ProtectedRoute><SyncERP /></ProtectedRoute>} />
      <Route path="/erp/academic-records" element={<ProtectedRoute><AcademicRecords /></ProtectedRoute>} />
      <Route path="/erp/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
      <Route path="/erp/internal-marks" element={<ProtectedRoute><InternalMarksPage /></ProtectedRoute>} />
      <Route path="/erp/semester-results" element={<ProtectedRoute><SemesterResults /></ProtectedRoute>} />
      <Route path="/erp/ai-analytics" element={<ProtectedRoute><AIAnalytics /></ProtectedRoute>} />
      <Route path="/erp/reports" element={<ProtectedRoute><AcademicReports /></ProtectedRoute>} />
      <Route path="/erp/charts" element={<ProtectedRoute><ERPCharts /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
