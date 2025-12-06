import { ArrowLeft, CheckCircle, Lock, Phone } from "lucide-react";
import { useState } from "react";
import useTheme from "../Components/useTheme";
import { Head } from '@inertiajs/react';
import api, { setToken } from "../api/client";

export default function LoginPage() {
  const { theme, mounted } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // Initialize Sanctum CSRF cookie for session auth
      await api.initCsrf();
      const resp = await api.login({ phone_number: phoneNumber, password });
      // Store user and token in localStorage for future requests
      if (resp?.user) {
        try {
          localStorage.setItem("auth_user", JSON.stringify(resp.user));
        } catch {}
      }
      if (resp?.token) {
        setToken(resp.token);
      }
      // Redirect to dashboard after successful login.
      // Prefer Inertia visit; if it fails (e.g., version mismatch), hard navigate.
      window.location.href = "/dashboard";
    } catch (err) {
      // Berikan pesan yang lebih jelas ketika server mengembalikan HTML atau masalah CSRF
      const msg = typeof err?.data === "string" ? err.data : (err?.data?.message || err.message);
      const hint = err?.status === 419
        ? " (CSRF tidak cocok: coba segarkan halaman)"
        : "";
      setError((msg || "Gagal masuk") + hint);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return <div style={{ visibility: "hidden" }} />;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'light' ? 'from-white to-[#F5F5F5]' : 'from-[#0F0F0F] to-[#1A1A1A]'} flex items-center justify-center px-4 py-8 transition-colors`}>
      <Head title="Login" />
      <div className="w-full max-w-md">
        <a
          href="/"
          className={`flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]' : 'text-white/60 hover:text-white'} mb-8 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Kembali ke beranda</span>
        </a>

        <div className={`${theme === 'light' ? 'bg-white border-[#E8E8E8]' : 'bg-[#161616] border-white/10'} rounded-2xl shadow-xl shadow-black/5 p-8 border transition-colors`}>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-white'} font-medium`}>SemTu</span>
          </div>

          <div className="text-center mb-8">
            <h1 className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-white'} mb-2`}>Selamat datang kembali</h1>
            <p className={`${theme === 'light' ? 'text-[#1A1A1A]/60' : 'text-white/60'}`}>Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-red-500 text-sm" role="alert">
                {error}
              </div>
            )}
            <div>
              <label className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-white'} text-sm mb-2 block`}>Nomor Telepon</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-[#1A1A1A]/40' : 'text-white/40'}`} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Nomor Telepon"
                  className={`w-full pl-11 pr-4 py-3 ${theme === 'light' ? 'bg-[#F5F5F5] border-[#E8E8E8] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:bg-white' : 'bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10'} rounded-xl focus:outline-none focus:border-[#4CAF50] transition-all`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-gray-600'} text-sm mb-2 block`}>Kata Sandi</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-[#1A1A1A]/40' : 'text-white/40'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className={`w-full pl-11 pr-4 py-3 ${theme === 'light' ? 'bg-[#F5F5F5] border-[#E8E8E8] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:bg-white' : 'bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10'} rounded-xl focus:outline-none focus:border-[#4CAF50] transition-all`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition-all shadow-lg shadow-[#4CAF50]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Masuk...
                </span>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className={`${theme === 'light' ? 'text-[#1A1A1A]/60' : 'text-white/60'} text-sm`}>Belum punya akun? </span>
            <a
              href="/auth/register"
              className="text-[#4CAF50] text-sm hover:underline"
            >
              Daftar
            </a>
          </div>

          <p className={`text-center text-xs mt-6 ${theme === 'light' ? 'text-[#1A1A1A]/40' : 'text-white/40'}`}>
            Dilindungi oleh enkripsi end-to-end
          </p>
        </div>
      </div>
    </div>
  );
}
