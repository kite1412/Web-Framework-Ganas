import { useState } from "react";
import { CheckCircle, Mail, Lock, ArrowLeft } from "lucide-react";
import useTheme from "../Components/useTheme";

export default function LoginPage({ onNavigate, onLogin }) {
  const { theme, mounted } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      onLogin(phoneNumber);
    }, 1000);
  };

  if (!mounted) return <div style={{ visibility: "hidden" }} />;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme === 'light' ? 'from-white to-[#F5F5F5]' : 'from-[#0F0F0F] to-[#1A1A1A]'} flex items-center justify-center px-4 py-8 transition-colors`}>
      <div className="w-full max-w-md">
        <button
          onClick={() => onNavigate('landing')}
          className={`flex items-center gap-2 ${theme === 'light' ? 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]' : 'text-white/60 hover:text-white'} mb-8 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to home</span>
        </button>

        <div className={`${theme === 'light' ? 'bg-white border-[#E8E8E8]' : 'bg-[#161616] border-white/10'} rounded-2xl shadow-xl shadow-black/5 p-8 border transition-colors`}>
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#4CAF50] rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-white'} font-medium`}>SemTu</span>
          </div>

          <div className="text-center mb-8">
            <h1 className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-white'} mb-2`}>Welcome back</h1>
            <p className={`${theme === 'light' ? 'text-[#1A1A1A]/60' : 'text-white/60'}`}>Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-white'} text-sm mb-2 block`}>Phone Number</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-[#1A1A1A]/40' : 'text-white/40'}`} />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                  className={`w-full pl-11 pr-4 py-3 ${theme === 'light' ? 'bg-[#F5F5F5] border-[#E8E8E8] text-[#1A1A1A] placeholder:text-[#1A1A1A]/40 focus:bg-white' : 'bg-white/5 border-white/20 text-white placeholder:text-white/40 focus:bg-white/10'} rounded-xl focus:outline-none focus:border-[#4CAF50] transition-all`}
                  required
                />
              </div>
            </div>

            <div>
              <label className={`${theme === 'light' ? 'text-[#1A1A1A]' : 'text-gray-600'} text-sm mb-2 block`}>Password</label>
              <div className="relative">
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'light' ? 'text-[#1A1A1A]/40' : 'text-white/40'}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="text-center mt-6">
            <span className={`${theme === 'light' ? 'text-[#1A1A1A]/60' : 'text-white/60'} text-sm`}>Don't have an account? </span>
            <button
              onClick={() => onNavigate('register')}
              className="text-[#4CAF50] text-sm hover:underline"
            >
              Sign up
            </button>
          </div>

          <p className={`text-center text-xs mt-6 ${theme === 'light' ? 'text-[#1A1A1A]/40' : 'text-white/40'}`}>
            Protected by end-to-end encryption
          </p>
        </div>
      </div>
    </div>
  );
}
