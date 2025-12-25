import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import CommitteeLogin from "./pages/CommitteeLogin";
import GoogleCallback from "./pages/GoogleCallback";
import SubmitData from "./pages/SubmitData";
import MySubmissions from "./pages/MySubmissions";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/admin/Dashboard";
import FieldAdmins from "./pages/admin/FieldAdmins";
import MyProfile from "./pages/MyProfile";
import Directory from "./pages/Directory";
import Reports from "./pages/Reports";
import Events from "./pages/Events";
import EventAttendance from "./pages/EventAttendance";

// Protected route component
const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireSuperAdmin = false,
  requireVerified = false,
}) => {
  const { user, loading, isAdmin, isVerified } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (requireSuperAdmin && user?.role !== "SUPER_ADMIN") {
    return <Navigate to="/unauthorized" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  if (requireVerified && !isVerified) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/committee-login" element={<CommitteeLogin />} />
      <Route path="/auth/callback" element={<GoogleCallback />} />

      {/* Protected routes */}
      <Route
        path="/submit"
        element={
          <ProtectedRoute>
            <SubmitData />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-submissions"
        element={
          <ProtectedRoute>
            <MySubmissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/my-profile"
        element={
          <ProtectedRoute requireVerified>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/directory"
        element={
          <ProtectedRoute requireAdmin>
            <Directory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/field-admins"
        element={
          <ProtectedRoute requireSuperAdmin>
            <FieldAdmins />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reports"
        element={
          <ProtectedRoute requireAdmin>
            <Reports />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedRoute requireVerified>
            <Events />
          </ProtectedRoute>
        }
      />

      <Route
        path="/events/:eventId/attendance"
        element={
          <ProtectedRoute requireAdmin>
            <EventAttendance />
          </ProtectedRoute>
        }
      />

      {/* Unauthorized access page */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600 mb-4">
                Access Denied
              </h1>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this page.
              </p>
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Go Back
              </button>
            </div>
          </div>
        }
      />

      {/* Dashboard placeholder - will be replaced in Phase 4 */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireVerified>
            <div className="p-8">
              <h1 className="text-2xl font-bold mb-4">Alumni Directory</h1>
              <p>
                Coming in Phase 4: Complete directory with search and filters
              </p>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}



function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      {isAuthenticated && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          user={user}
          isAuthenticated={isAuthenticated}
        />
      )}
      
      <div className={`flex-1 flex flex-col min-w-0 ${isAuthenticated ? "lg:pl-[280px]" : ""}`}>
        {isAuthenticated && (
          <Navigation onOpenSidebar={() => setIsSidebarOpen(true)} />
        )}
        
        <main className="flex-1">
          <AppRoutes />
        </main>
        
        {!isAuthenticated && <Footer />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;
