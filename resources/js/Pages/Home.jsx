import { router } from "@inertiajs/react";
import { Bell, CheckCircle, Clock, Github, Instagram, Linkedin, Mail, MapPin, Moon, Phone, Share2, Sun, Twitter } from "lucide-react";
import { useEffect } from "react";
import useTheme from "../Components/useTheme";
// Home is a pure landing page; Login/Register/Dashboard are routed separately.

export default function Home() {
  const { theme, toggleTheme, mounted } = useTheme();
  

  useEffect(() => {
    // If user is already logged in, navigate to dashboard
    try {
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      if (token || userStr) {
        try {
          router.visit('/dashboard');
        } catch {
          window.location.href = '/dashboard';
        }
        return;
      }
    } catch {}
    window.scrollTo(0, 0);
  }, []);

  if (!mounted) return <div style={{ visibility: "hidden" }} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F5F5F5] dark:from-[#0F0F0F] dark:to-[#1A1A1A] transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-[#E8E8E8] dark:border-white/10 bg-white/80 dark:bg-black/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center shadow">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[#1A1A1A] dark:text-white font-medium">
              Semi Tugas
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[#E8E8E8] dark:border-white/20 bg-white dark:bg-white/10 hover:bg-[#F5F5F5] dark:hover:bg-white/20 transition"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-[#1A1A1A]" />
              ) : (
                <Sun className="w-5 h-5 text-yellow-300" />
              )}
            </button>

            <a
              href="/auth/login"
              className="px-6 py-2 text-[#1A1A1A] dark:text-white hover:bg-[#F5F5F5] dark:hover:bg-white/10 rounded-lg transition"
            >
              Masuk
            </a>

            <a
              href="/auth/register"
              className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition shadow-sm"
            >
              Daftar Akun
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block px-4 py-1.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-sm">
                ✨ Manajemen Tugas Cerdas
              </div>

              <h1 className="text-[#1A1A1A] dark:text-white text-4xl font-bold">
                Kelola tugas dengan mudah dan dapatkan pengingat Email tepat waktu.
              </h1>

              <p className="text-[#1A1A1A]/60 dark:text-white/60 text-lg leading-relaxed">
                Tetap terorganisir dengan manajemen tugas yang cerdas, notifikasi Email real-time, dan kolaborasi yang lancar. 
                Jangan pernah melewatkan tenggat waktu lagi.
              </p>

              <div className="flex flex-wrap gap-4">
                <a
                  href="/auth/register"
                  className="px-8 py-3 bg-[#4CAF50] text-white rounded-xl hover:bg-[#45a049] transition shadow-lg shadow-[#4CAF50]/20"
                >
                  Mulai Gratis
                </a>
                <a
                  href="/auth/login"
                  className="px-8 py-3 bg-white dark:bg-[#2A2A2A] text-[#1A1A1A] dark:text-white border border-[#E8E8E8] dark:border-white/10 rounded-xl hover:border-[#4CAF50] transition"
                >
                  Masuk
                </a>
              </div>
            </div>

            {/* Right Mockup */}
            <div className="relative">
              <div className="bg-white dark:bg-[#161616] rounded-2xl shadow-2xl p-6 border border-[#E8E8E8] dark:border-white/10">
                <div className="space-y-4">
                  {[{ title: "Kumpulkan tugas", time: "Jatuh tempo dalam 2 jam", priority: "high", done: false },
                    { title: "Persiapan rapat tim", time: "Jatuh tempo dalam 4 jam", priority: "medium", done: false },
                    { title: "Tinjau pull request", time: "Jatuh tempo besok", priority: "low", done: true }
                  ].map((task, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-4 bg-[#F5F5F5] dark:bg-white/5 rounded-xl hover:bg-[#E8E8E8]/50 dark:hover:bg-white/10 transition"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center ${task.done ? "bg-[#4CAF50] border-[#4CAF50]" : "border-[#E8E8E8] dark:border-white/20"}`}
                      >
                        {task.done && (
                          <CheckCircle className="w-3 h-3 text-white" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className={`text-[#1A1A1A] dark:text-white ${task.done ? "line-through opacity-50" : ""}`}>
                          {task.title}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-[#1A1A1A]/40 dark:text-white/40" />
                          <span className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                            {task.time}
                          </span>

                          <span className={`px-2 py-0.5 rounded-md text-xs ${
                            task.priority === "high"
                              ? "bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-400"
                              : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-600/20 dark:text-yellow-300"
                              : "bg-blue-100 text-blue-600 dark:bg-blue-600/20 dark:text-blue-300"
                          }`}>
                            {task.priority === "high" ? "tinggi" : task.priority === "medium" ? "sedang" : "rendah"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#121212] transition-colors">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-[#1A1A1A] dark:text-white mb-4 text-3xl font-semibold">
              Semua yang Anda perlukan untuk tetap terorganisir
            </h2>
            <p className="text-[#1A1A1A]/60 dark:text-white/60 max-w-2xl mx-auto">
              Fitur hebat yang dirancang untuk membantu Anda mengelola tugas secara efisien.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{ icon: CheckCircle, title: "Manajemen Tugas", description: "Buat, edit, dan susun tugas dengan mudah. Atur prioritas dan tenggat waktu." },
              { icon: Bell, title: "Pengingat Email", description: "Dapatkan notifikasi tepat waktu di Email sebelum tenggat tugas." },
              { icon: Share2, title: "Bagikan Tugas", description: "Bagikan daftar tugas dengan tim dan berkolaborasi secara efektif." },
              { icon: Clock, title: "Penjadwalan Pintar", description: "Pelacakan tenggat yang cerdas dengan hitung mundur dan peringatan." }
            ].map((feature, idx) => (
              <div key={idx} className="p-6 bg-[#F5F5F5] dark:bg-[#1B1B1B] rounded-xl hover:bg-[#E8E8E8]/50 dark:hover:bg-white/10 transition">
                <div className="w-12 h-12 bg-[#4CAF50]/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-[#4CAF50]" />
                </div>
                <h3 className="text-[#1A1A1A] dark:text-white mb-2">{feature.title}</h3>
                <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-2xl p-12 text-white shadow-xl">
            <h2 className="text-3xl font-semibold mb-4">Siap untuk mulai?</h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pengguna yang telah mengelola tugas mereka secara efisien.
            </p>
            <a
              href="/auth/register"
              className="px-8 py-3 bg-white text-[#4CAF50] rounded-xl hover:bg-[#F5F5F5] transition shadow-lg"
            >
              Mulai Gratis Hari Ini
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#E8E8E8] dark:border-white/10 bg-white dark:bg-[#121212] py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* About Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center shadow">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-[#1A1A1A] dark:text-white font-semibold">
                  Semi Tugas
                </span>
              </div>
              <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm leading-relaxed">
                Platform manajemen tugas yang cerdas dengan notifikasi Email untuk membantu Anda tetap terorganisir.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 bg-[#F5F5F5] dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#4CAF50] dark:hover:bg-[#4CAF50] hover:text-white transition group">
                  <Github className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60 group-hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-[#F5F5F5] dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#4CAF50] dark:hover:bg-[#4CAF50] hover:text-white transition group">
                  <Twitter className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60 group-hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-[#F5F5F5] dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#4CAF50] dark:hover:bg-[#4CAF50] hover:text-white transition group">
                  <Instagram className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60 group-hover:text-white" />
                </a>
                <a href="#" className="w-9 h-9 bg-[#F5F5F5] dark:bg-white/5 rounded-lg flex items-center justify-center hover:bg-[#4CAF50] dark:hover:bg-[#4CAF50] hover:text-white transition group">
                  <Linkedin className="w-4 h-4 text-[#1A1A1A]/60 dark:text-white/60 group-hover:text-white" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-[#1A1A1A] dark:text-white font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-3">
                {["Beranda", "Fitur", "Tentang Kami"].map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-[#1A1A1A] dark:text-white font-semibold mb-4">Dukungan</h3>
              <ul className="space-y-3">
                {["Pusat Bantuan", "Dokumentasi", "Kebijakan Privasi", "Syarat & Ketentuan", "Hubungi Kami"].map((link, idx) => (
                  <li key={idx}>
                    <a href="#" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-[#1A1A1A] dark:text-white font-semibold mb-4">Kontak Kami</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#4CAF50] mt-0.5 flex-shrink-0" />
                  <span className="text-[#1A1A1A]/60 dark:text-white/60 text-sm">
                    Jalan Sumantri Brojonegoro No. 1,<br />
                    Gedong Meneng, Rajabasa,<br />
                    Bandar Lampung, 35145.
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
                  <a href="mailto:support@semtu.com" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                    semtu@gmail.com
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#4CAF50] flex-shrink-0" />
                  <a href="tel:+6281234567890" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                    +62 812-3456-7890
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#E8E8E8] dark:border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-[#1A1A1A]/60 dark:text-white/60 text-sm text-center md:text-left">
                © 2025 Semi Tugas. Hak cipta dilindungi.
              </p>
              <div className="flex gap-6">
                <a href="#" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                  Kebijakan Privasi
                </a>
                <a href="#" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                  Ketentuan Layanan
                </a>
                <a href="#" className="text-[#1A1A1A]/60 dark:text-white/60 hover:text-[#4CAF50] dark:hover:text-[#4CAF50] text-sm transition">
                  Cookie
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
