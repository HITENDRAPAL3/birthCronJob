import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Cake, Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import registerGif from '../assets/flowerFieldRegisterPage.gif';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(name, email, password);

    if (result.success) {
      toast.success('Account created successfully! 🎉');
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
        {/* Background GIF */}
        <img
          src={registerGif}
          alt="Register Background"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient Blur Overlay */}
        <div
          className="absolute inset-0 bg-black/20 backdrop-blur-md"
          style={{
            maskImage: 'linear-gradient(to right, black 20%, rgba(0,0,0,0.5) 40%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, black 10%, rgba(0,0,0,0.5) 40%, transparent 100%)'
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center p-12">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="p-3 rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #db276cff 0%, #a1355fff 35%, #930a3cff 70%, #EF88AD 100%)' }}
            >
              <Cake size={32} className="text-white" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white drop-shadow-2xl">Birthday Reminder</h1>
          </div>

          <h2 className="text-4xl font-display font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Start tracking <br />
            <span
              className="bg-clip-text text-transparent brightness-125"
              style={{ backgroundImage: 'linear-gradient(135deg, #aa2457ff 0%, #a11248ff 35%, #A53860 70%, #EF88AD 100%)' }}
            >
              birthdays
            </span> today!
          </h2>

          <p className="text-xl text-white font-medium mb-8 max-w-md drop-shadow-lg">
            Never miss your loved ones' special days.
          </p>

          {/* <div className="space-y-4">
            <div className="flex items-center gap-3 text-white drop-shadow-md">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/10">
                <Sparkles size={18} className="text-primary-400" />
              </div>
              <span className="font-medium">Unlimited birthday entries</span>
            </div>
            <div className="flex items-center gap-3 text-white drop-shadow-md">
              <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/10">
                <Sparkles size={18} className="text-accent-400" />
              </div>
              <span className="font-medium">Customizable email reminders</span>
            </div>
          </div> */}
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            <h2 className="text-3xl font-display font-bold text-white mb-2">Create account</h2>
            <p className="text-dark-300">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="animate-slide-up">
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input pl-12"
                  placeholder="Palacio"
                  required
                />
              </div>
            </div>

            <div className="animate-slide-up animate-delay-100">
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

            <div className="animate-slide-up animate-delay-200">
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
                  minLength={6}
                />
              </div>
            </div>

            <div className="animate-slide-up animate-delay-300">
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input pl-12"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-accent w-full py-3.5 text-base animate-slide-up animate-delay-400"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Create account
                  <ArrowRight size={20} />
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-dark-300 animate-slide-up animate-delay-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
