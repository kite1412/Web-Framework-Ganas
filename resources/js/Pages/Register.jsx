import { useState } from "react";
import { User, Mail, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import useTheme from "../Components/useTheme";

export default function RegisterPage({ onNavigate }) {
  const { theme, mounted } = useTheme();
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsChecked, setTermsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!mounted) return <div style={{ visibility: "hidden" }} />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password harus sama");
      return;
    }
    if (!termsChecked) {
      setError("Anda harus menyetujui Terms & Privacy");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Registrasi berhasil!");
      onNavigate("login");
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${theme === "light" ? "bg-gradient-to-br from-white to-[#F5F5F5]" : "bg-gradient-to-br from-[#0F0F0F] to-[#1A1A1A]"}`}>
      <div className={`max-w-md w-full p-8 rounded-2xl shadow-2xl border ${theme === "light" ? "bg-white border-[#E8E8E8]" : "bg-[#161616] border-white/10"} transition-colors duration-300`}>
        <button
          onClick={() => onNavigate("landing")}
          className={`flex items-center mb-6 ${theme === "light" ? "text-gray-600 hover:text-gray-800" : "text-white/70 hover:text-white"}`}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </button>

        <h2 className={`text-2xl font-bold mb-6 ${theme === "light" ? "text-[#1A1A1A]" : "text-white"}`}>
          Create Account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#4CAF50] transition-colors ${theme === "light" ? "border-gray-300" : "border-white/20"}`}>
            <User className={`w-5 h-5 mr-3 ${theme === "light" ? "text-gray-400" : "text-white/50"}`} />
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`w-full flex items-center border rounded-lg p-3 ${theme === "light" ? "text-gray-700" : "text-white bg-transparent"}`}
              required
            />
          </div>

          <div className={`flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#4CAF50] transition-colors ${theme === "light" ? "border-gray-300" : "border-white/20"}`}>
            <Mail className={`w-5 h-5 mr-3 ${theme === "light" ? "text-gray-400" : "text-white/50"}`} />
            <input
              type="tel"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className={`w-full flex items-center border rounded-lg p-3 ${theme === "light" ? "text-gray-700" : "text-white bg-transparent"}`}
              required
            />
          </div>

          <div className={`flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#4CAF50] transition-colors ${theme === "light" ? "border-gray-300" : "border-white/20"}`}>
            <Lock className={`w-5 h-5 mr-3 ${theme === "light" ? "text-gray-400" : "text-white/50"}`} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full flex items-center border rounded-lg p-3 ${theme === "light" ? "text-gray-700" : "text-white bg-transparent"}`}
              required
            />
          </div>

          <div className={`flex items-center border rounded-lg p-3 focus-within:ring-2 focus-within:ring-[#4CAF50] transition-colors ${theme === "light" ? "border-gray-300" : "border-white/20"}`}>
            <Lock className={`w-5 h-5 mr-3 ${theme === "light" ? "text-gray-400" : "text-white/50"}`} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full flex items-center border rounded-lg p-3 ${theme === "light" ? "text-gray-700" : "text-white bg-transparent"}`}
              required
            />
          </div>

          <label className={`flex items-center space-x-2 ${theme === "light" ? "text-gray-600" : "text-white/70"}`}>
            <input
              type="checkbox"
              checked={termsChecked}
              onChange={(e) => setTermsChecked(e.target.checked)}
              className="w-4 h-4 text-[#4CAF50] border-gray-300 rounded focus:ring-2 focus:ring-[#4CAF50]"
            />
            <span className="text-sm">
              I agree to the <span className="text-[#4CAF50] underline">Terms & Privacy</span>
            </span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-lg shadow flex items-center justify-center transition ${theme === "light" ? "bg-[#4CAF50] hover:bg-[#45a049] text-white" : "bg-[#4CAF50] hover:bg-[#45a049] text-white"} disabled:opacity-50`}
          >
            {loading ? (
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
            ) : (
              "Register"
            )}
          </button>
        </form>

        <p className={`text-sm mt-4 text-center ${theme === "light" ? "text-gray-600" : "text-white/70"}`}>
          Already have an account?{" "}
          <span
            onClick={() => onNavigate("login")}
            className="text-[#4CAF50] font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
