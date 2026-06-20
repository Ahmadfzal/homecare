import { useState } from "react";
import { HeartPulse, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface AdminLoginProps {
  onSuccess: (token: string) => void;
}

export default function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const { token } = await res.json();
        sessionStorage.setItem("admin_token", token);
        onSuccess(token);
      } else {
        const { message } = await res.json();
        toast({ title: "Gagal Masuk", description: message || "Sandi salah", variant: "destructive" });
        setPassword("");
      }
    } catch {
      toast({ title: "Error", description: "Tidak dapat terhubung ke server", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001a5c] via-[#003fa3] to-[#0057c8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 mb-4">
            <HeartPulse className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">
            Oki<span className="text-orange-400">HomeCare</span>
          </h1>
          <p className="text-white/60 mt-1 text-sm">Panel Admin</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Lock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Masuk ke Dashboard</h2>
              <p className="text-slate-500 text-xs">Masukkan sandi untuk melanjutkan</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan sandi admin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-12 text-base"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700"
              disabled={loading || !password.trim()}
            >
              {loading ? "Memeriksa..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            Sandi dapat diubah di pengaturan environment <code className="bg-slate-100 px-1 rounded">ADMIN_PASSWORD</code>
          </p>
        </div>
      </div>
    </div>
  );
}
