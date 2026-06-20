import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminLogin from "@/pages/AdminLogin";

function AdminGuard() {
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem("admin_token"));
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    fetch("/api/admin/check", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then(({ valid }) => {
        if (!valid) {
          sessionStorage.removeItem("admin_token");
          setToken(null);
        }
      })
      .catch(() => {
        sessionStorage.removeItem("admin_token");
        setToken(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse text-slate-400">Memeriksa sesi...</div>
      </div>
    );
  }

  if (!token) {
    return (
      <AdminLogin
        onSuccess={(t) => {
          setToken(t);
        }}
      />
    );
  }

  return <AdminDashboard adminToken={token} onLogout={() => {
    fetch("/api/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } });
    sessionStorage.removeItem("admin_token");
    setToken(null);
  }} />;
}

function Router({ adminPath }: { adminPath: string }) {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path={adminPath} component={AdminGuard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [adminPath, setAdminPath] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((cfg) => setAdminPath(cfg.adminPath || "/admin"))
      .catch(() => setAdminPath("/admin"));
  }, []);

  if (!adminPath) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router adminPath={adminPath} />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
