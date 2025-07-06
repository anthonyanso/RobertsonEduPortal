import { useState, useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import About from "./pages/About";
import News from "./pages/News";
import Admission from "./pages/Admission";
import Results from "./pages/Results";
import Contact from "./pages/Contact";
import SimpleAuth from "./pages/auth/SimpleAuth";
import AdminLayout from "./pages/admin/AdminLayout";
import NotFound from "./pages/not-found";

type Page = "home" | "about" | "news" | "admission" | "results" | "contact" | "admin" | "auth";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    const authStatus = localStorage.getItem("isAdminAuthenticated");
    if (authStatus === "true") {
      setIsAdminAuthenticated(true);
    }
  }, []);

  // Simple routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page;
      if (["home", "about", "news", "admission", "results", "contact", "admin", "auth"].includes(hash)) {
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
      case "admin":
        if (isAdminAuthenticated) {
          return <AdminLayout onLogout={handleAdminLogout} />;
        } else {
          return <SimpleAuth onSuccess={handleAuthSuccess} />;
        }
      case "auth":
        return <SimpleAuth onSuccess={handleAuthSuccess} />;
      default:
        return <NotFound />;
    }
  };

  // Admin and auth pages don't need the main layout
  if (currentPage === "admin" || currentPage === "auth") {
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
