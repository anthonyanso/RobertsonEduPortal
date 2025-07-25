import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { useMaintenanceCheck } from "./hooks/useMaintenanceCheck";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import Admission from "./pages/Admission";
import Results from "./pages/Results";
import Contact from "./pages/Contact";
import Maintenance from "./pages/Maintenance";
import AuthLayout from "./pages/auth/AuthLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import NotFound from "./pages/not-found";

type Page = "home" | "about" | "news" | "admission" | "results" | "contact" | "admin" | "auth" | "maintenance";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
  // Check for maintenance mode
  useMaintenanceCheck();

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Simple routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page;
      if (["home", "about", "news", "admission", "results", "contact", "admin", "auth", "maintenance"].includes(hash)) {
        setCurrentPage(hash);
      } else {
        setCurrentPage("home");
      }
    };

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    
    // Handle initial load
    handleHashChange();

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const handleAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    setCurrentPage("admin");
    window.location.hash = "admin";
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    localStorage.removeItem("adminToken");
    setCurrentPage("home");
    window.location.hash = "home";
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <Home />;
      case "about":
        return <About />;
      case "news":
        return <News />;
      case "admission":
        return <Admission />;
      case "results":
        return <Results />;
      case "contact":
        return <Contact />;
      case "maintenance":
        return <Maintenance />;
      case "admin":
        if (isAdminAuthenticated) {
          return <AdminLayout onLogout={handleAdminLogout} />;
        } else {
          return <AuthLayout onAuthSuccess={handleAuthSuccess} />;
        }
      case "auth":
        return <AuthLayout onAuthSuccess={handleAuthSuccess} />;
      default:
        return <NotFound />;
    }
  };

  // Admin, auth, and maintenance pages don't need the main layout
  if (currentPage === "admin" || currentPage === "auth" || currentPage === "maintenance") {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background">
            {renderPage()}
            <Toaster />
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Layout currentPage={currentPage} setCurrentPage={(page: string) => setCurrentPage(page as Page)}>
            {renderPage()}
          </Layout>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
