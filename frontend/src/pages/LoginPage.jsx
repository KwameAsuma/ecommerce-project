import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = ({ isAdminLogin = false }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const isFormValid = email.trim() !== '' && password.trim() !== '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await login(email, password);
      const role = data?.user?.role || "customer";

      if (isAdminLogin && role !== "admin") {
        await logout();
        setError("Invalid email or password");
        return;
      }

      if (!isAdminLogin && role === "admin") {
        await logout();
        setError("Invalid email or password");
        return;
      }

      if (role === "admin") navigate("/admin");
      else if (role === "merchant") navigate("/merchant");
      else navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface-container p-4 md:p-8 font-body text-on-surface">
      <div className="w-full max-w-[1000px] min-h-[600px] md:h-[600px] bg-surface rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-outline-variant">
        
        {/* Left Panel - Form Area */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-12 py-4 relative bg-surface">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-2 mb-3 justify-center">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm">
              <img src="/app_icon.png" alt="Logo" className="w-5 h-5 rounded-md" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">TradeHub</span>
          </div>

          <h2 className="text-2xl font-black text-on-surface tracking-tight mb-6 text-center">
            {isAdminLogin ? "Secure Admin Portal" : "Log in to your account"}
          </h2>
          
          {error && (
            <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-xl mb-4 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-medium placeholder-on-surface-variant/60 bg-transparent"
                placeholder="Email Address"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-outline-variant rounded-xl px-4 py-3.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface font-medium placeholder-on-surface-variant/60 bg-transparent pr-12"
                placeholder="Password"
              />
              <span 
                className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface text-[20px]"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? 'visibility' : 'visibility_off'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-outline-variant w-4 h-4" />
                <span className="text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">Remember Me</span>
              </label>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={!isFormValid || isLoading}
                className={`w-full py-3 rounded-xl font-bold transition-all ${!isFormValid || isLoading ? 'bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed' : 'bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90 active:scale-[0.98]'}`}
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <span className="text-on-surface-variant text-sm font-medium">Don't have an account? </span>
            <Link to="/register" className="text-primary font-bold hover:underline text-sm">Sign Up</Link>
          </div>
        </div>

        {/* Right Panel - Illustration Area */}
        <div className="hidden md:flex md:w-1/2 bg-surface-container-lowest flex-col relative overflow-hidden border-l border-outline-variant">
          
          {/* Header Links */}
        <div className="absolute top-8 right-8 flex gap-6 z-20">
          <Link to="/" className="text-on-surface-variant hover:text-primary text-base font-bold transition-colors">Home</Link>
          <Link to="/" className="text-on-surface-variant hover:text-primary text-base font-bold transition-colors">Catalog</Link>
          <Link to="/#about" className="text-on-surface-variant hover:text-primary text-base font-bold transition-colors">About Us</Link>
        </div>

          {/* Decorative Background Blob */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-30">
            <div className="w-[300px] h-[300px] rounded-full bg-primary/20 blur-[60px]"></div>
          </div>

          {/* Illustration */}
          <div className="flex-1 flex items-center justify-center z-10 p-6">
            <img 
              src="/checkout_illustration.png" 
              alt="TradeHub Illustration" 
              className="w-full max-w-[250px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700" 
            />
          </div>

          {/* Bottom Text - Reinstated and shrunk */}
          <div className="absolute bottom-8 left-8 right-8 z-10 text-center">
            <h2 className="text-lg font-black text-on-surface leading-tight tracking-tight mb-1">
              Empowering Ghanaian Commerce.
            </h2>
            <p className="text-on-surface-variant text-xs font-medium leading-relaxed max-w-[280px] mx-auto">
              Access premium export-quality goods from verified local merchants.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
