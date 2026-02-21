import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cake, Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import loginImg from '../assets/LoginImageLeft.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background Image */}
        <img
          src={loginImg}
          alt="Login Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Blur Overlay - Concentrates blur behind text and fades out to the right */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-md"
          style={{
            maskImage: 'linear-gradient(to right, black 10%, rgba(0,0,0,0.5) 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 10%, rgba(0,0,0,0.5) 60%, transparent 100%)'
          }}
        />

        {/* Optional: Keeping the floating effects but with lower opacity */}
        <div className="absolute inset-0 opacity-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float animate-delay-300" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-lg">
              <Cake size={32} className="text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white drop-shadow-2xl">Birthday Reminder</h1>
          </div>

          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Never forget a <br />
            <span className="gradient-text brightness-125">birthday</span> again!
          </h2>

          <p className="text-xl text-white font-medium mb-8 max-w-md drop-shadow-lg">
            Keep track of all your friends and family birthdays with smart email reminders.
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl">
              <Sparkles size={16} className="text-primary-400" />
              <span>Email Notifications</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-dark-900/60 backdrop-blur-md border border-white/10 rounded-full text-white shadow-xl">
              <Sparkles size={16} className="text-accent-400" />
              <span>Configurable Reminders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-dark-900">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl">
              <Cake size={28} className="text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">Birthday Reminder</h1>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome back</h2>
            <p className="text-dark-300">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-slide-up">
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-12"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="animate-slide-up animate-delay-100">
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base animate-slide-up animate-delay-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Sign in
                  <ArrowRight size={20} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-dark-300 animate-slide-up animate-delay-300">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
