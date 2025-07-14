
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";

// Components
import Header from "@/components/layout/Header";
import EcoConnect from "@/components/auth/EcoConnect";

// Pages
import Index from "@/pages/Index";
import Communities from "@/pages/Communities";
import Stories from "@/pages/Stories";
import Blogs from "@/pages/Blogs";
import Challenges from "@/pages/Challenges";
import Marketplace from "@/pages/Marketplace";

const queryClient = new QueryClient();

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <Toaster />
            <BrowserRouter>
              <EcoConnect />
            </BrowserRouter>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/communities" element={<Communities />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/blogs" element={<Blogs />} />
                  <Route path="/challenges" element={<Challenges />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
