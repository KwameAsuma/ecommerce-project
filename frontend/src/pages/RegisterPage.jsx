import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const RegisterPage = () => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("BUYER");
  const [momoNumber, setMomoNumber] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("role") === "merchant") {
      setRole("MERCHANT");
    }
  }, [location]);

  const isStep1Valid = name.trim() !== '' && email.trim() !== '' && phone.length === 10 && password.trim() !== '' && confirmPassword.trim() !== '';
  const isStep2Valid = momoNumber.length === 10;

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password || !confirmPassword) {
      setError("Please fill in all basic information fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    if (role === "MERCHANT") {
      setStep(2);
    } else {
      handleSubmit(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register", { name, email, phone, password, role, momo_number: momoNumber });
      const data = await login(email, password);
      const userRole = data?.user?.role || "customer";
      navigate(userRole === "merchant" ? "/merchant" : "/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-surface-container flex items-center justify-center p-4 md:p-8 font-body text-on-surface">
      
      {/* Back to Home Link (Absolute Top Left) */}
      <Link to="/" className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold z-10 bg-surface/50 backdrop-blur-md px-4 py-2 rounded-full">
        <span className="material-symbols-outlined text-[20px]">arrow_back</span>
        Home
      </Link>

      {/* Centered Modal */}
      <div className="w-full max-w-[1000px] min-h-[600px] md:h-[600px] bg-surface rounded-[32px] shadow-2xl flex flex-col md:flex-row overflow-hidden relative border border-outline-variant">
        
        {/* Left Side - Image Coverage */}
        <div className="hidden md:block md:w-[45%] relative bg-black">
          {/* Overlay to give brand tint */}
          <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          
          <img 
            src="/hero_business.png" 
            alt="Business professionals" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Quote/Text over image */}
          <div className="absolute bottom-8 left-8 right-8 z-20 text-white">
            <h3 className="text-2xl font-display font-black leading-tight mb-2">Join the ecosystem of verified traders.</h3>
            <p className="text-white/80 font-medium text-sm">Safe, escrow-protected commerce designed for the Ghanaian market.</p>
          </div>
        </div>

        {/* Right Side - Form Area */}
        <div className="w-full md:w-[55%] p-6 flex flex-col justify-center">
          <div className="max-w-[400px] w-full mx-auto">
            
            {/* Logo/Icon at Top Center */}
            <div className="flex items-center justify-center gap-2.5 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary shadow-sm">
                <img src="/app_icon.png" alt="Logo" className="w-5 h-5 rounded-md" />
              </div>
              <span className="font-bold text-2xl tracking-tight text-primary">TradeHub</span>
            </div>

            <h2 className="text-xl md:text-2xl font-black text-center text-on-surface tracking-tight mb-4">
              {step === 1 ? "Create an account" : "Merchant Setup"}
            </h2>

            {error && (
              <div className="bg-error/10 border border-error text-error px-2 py-1.5 rounded-lg mb-2 text-xs text-center font-medium">
                {error}
              </div>
            )}

            {/* STEP 1 FORM */}
            {step === 1 && (
              <form onSubmit={handleNextStep} className="space-y-2.5">
                <div>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                    placeholder="Full Name"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/60 bg-transparent text-sm"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="flex-1">
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      placeholder="Email Address"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/60 bg-transparent text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="tel" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                      required 
                      maxLength="10"
                      placeholder="Phone Number"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/60 bg-transparent text-sm"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => { setPassword(e.target.value); setError(""); }} 
                    required 
                    placeholder="Create Password"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/60 bg-transparent pr-12 text-sm"
                  />
                  <span 
                    className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface text-[18px]"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </div>
                
                <div>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword} 
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} 
                      required 
                      placeholder="Confirm Password"
                      className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-on-surface placeholder-on-surface-variant/60 bg-transparent pr-12 text-sm"
                    />
                    <span 
                      className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface text-[18px]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </div>
                </div>
                
                <div className="pt-0.5">
                  <div className="flex gap-3">
                    <label className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border-2 rounded-xl cursor-pointer transition-all ${role === 'BUYER' ? 'border-primary bg-primary/5' : 'border-outline-variant hover:border-primary/50'}`}>
                      <input type="radio" name="role" value="BUYER" checked={role === "BUYER"} onChange={() => setRole("BUYER")} className="hidden" />
                      <span className="material-symbols-outlined text-[18px]" style={{color: role === 'BUYER' ? 'var(--primary)' : 'var(--text-secondary)'}}>shopping_bag</span>
                      <span className={`font-bold text-xs ${role === 'BUYER' ? 'text-primary' : 'text-on-surface-variant'}`}>Customer</span>
                    </label>
                    
                    <label className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 border-2 rounded-xl cursor-pointer transition-all ${role === 'MERCHANT' ? 'border-amber-500 bg-amber-500/10' : 'border-outline-variant hover:border-amber-500/50'}`}>
                      <input type="radio" name="role" value="MERCHANT" checked={role === "MERCHANT"} onChange={() => setRole("MERCHANT")} className="hidden" />
                      <span className="material-symbols-outlined text-[18px]" style={{color: role === 'MERCHANT' ? '#f59e0b' : 'var(--text-secondary)'}}>storefront</span>
                      <span className={`font-bold text-xs ${role === 'MERCHANT' ? 'text-amber-500' : 'text-on-surface-variant'}`}>Merchant</span>
                    </label>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={!isStep1Valid}
                  className={`w-full py-2 rounded-xl font-bold transition-all mt-3 ${!isStep1Valid ? 'bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed' : `text-on-primary shadow-md hover:opacity-90 active:scale-[0.98] ${role === 'MERCHANT' ? 'bg-amber-500 shadow-amber-500/20' : 'bg-primary shadow-primary/20'}`}`}
                >
                  {role === "MERCHANT" ? "Continue Setup →" : "Create an account"}
                </button>
              </form>
            )}

            {/* STEP 2 FORM (Merchants Only) */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 mb-3">
                  <p className="text-xs text-on-surface font-medium leading-relaxed">
                    Please provide your MoMo number where your sales funds will be disbursed upon successful deliveries.
                  </p>
                </div>

                <div>
                  <input 
                    type="tel" 
                    value={momoNumber} 
                    onChange={(e) => setMomoNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    required 
                    maxLength="10"
                    placeholder="MoMo Number (e.g. 0541234567)"
                    className="w-full border border-outline-variant rounded-xl px-4 py-3 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all text-on-surface font-medium tracking-wide placeholder-on-surface-variant/60 bg-transparent text-sm"
                  />
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container transition-colors text-sm">
                    Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={!isStep2Valid}
                    className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${!isStep2Valid ? 'bg-outline-variant/50 text-on-surface-variant/50 cursor-not-allowed' : 'bg-amber-500 text-on-primary shadow-lg shadow-amber-500/20 hover:opacity-90 active:scale-[0.98]'}`}
                  >
                    Complete Registration
                  </button>
                </div>
              </form>
            )}

            <div className="mt-3 text-center">
              <span className="text-on-surface-variant text-sm font-medium">Already have an account? </span>
              <Link to="/login" className="text-primary font-bold hover:underline text-sm">Login</Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
