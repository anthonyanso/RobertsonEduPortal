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
import Admin from "./pages/Admin";
import NotFound from "./pages/not-found";

type Page = "home" | "about" | "news" | "admission" | "results" | "contact" | "admin";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  // Simple routing based on URL hash
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) as Page;
      if (["home", "about", "news", "admission", "results", "contact", "admin"].includes(hash)) {
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
        return <Admin />;
      default:
        return <NotFound />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
            {renderPage()}
          </Layout>
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
