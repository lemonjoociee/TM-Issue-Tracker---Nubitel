import React, { useState } from 'react';
import { TMLogo } from './TMLogo';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  Server,
  Activity,
  UserCheck,
} from 'lucide-react';

export interface UserSession {
  name: string;
  email: string;
  role: 'NOC_ENGINEER' | 'OPS_EXECUTIVE' | 'ADMIN';
  roleTitle: string;
  department: string;
}

interface LoginPageProps {
  onLogin: (session: UserSession, remember: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  isDarkMode,
  onToggleTheme,
}) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitted, setResetSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = emailOrUsername.trim().toLowerCase();
    const pwd = password.trim();

    if (!identifier) {
      setErrorMessage('Please enter your Telekom Malaysia enterprise email or staff ID.');
      return;
    }

    if (!pwd) {
      setErrorMessage('Please enter your portal password.');
      return;
    }

    if (pwd.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate enterprise LDAP / SSO authentication
    setTimeout(() => {
      setIsLoading(false);

      // Determine role from username/email
      let role: 'NOC_ENGINEER' | 'OPS_EXECUTIVE' | 'ADMIN' = 'NOC_ENGINEER';
      let roleTitle = 'NOC Tier 2 Operations Engineer';
      let department = 'Network Operations Center (NOC)';
      let name = 'Izzul Dinie (NOC Engineer)';

      if (identifier.includes('ops') || identifier.includes('exec') || identifier.includes('mgmt')) {
        role = 'OPS_EXECUTIVE';
        roleTitle = 'Executive Manager - Ops & Assurance';
        department = 'Network & IT Operations Assurance';
        name = 'Ahmad Fadzil (OPS Lead)';
      } else if (identifier.includes('admin') || identifier.includes('sys')) {
        role = 'ADMIN';
        roleTitle = 'Portal Super Administrator';
        department = 'TM Enterprise IT Infrastructure';
        name = 'Norazlina H. (System Admin)';
      } else if (identifier.includes('@')) {
        name = identifier.split('@')[0].replace('.', ' ').toUpperCase();
      }

      onLogin(
        {
          name,
          email: identifier.includes('@') ? identifier : `${identifier}@tm.com.my`,
          role,
          roleTitle,
          department,
        },
        rememberMe
      );
    }, 650);
  };

  const handleQuickLogin = (role: 'NOC_ENGINEER' | 'OPS_EXECUTIVE' | 'ADMIN') => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'NOC_ENGINEER') {
        onLogin(
          {
            name: 'Izzul Dinie (NOC Lead)',
            email: 'noc.operations@tm.com.my',
            role: 'NOC_ENGINEER',
            roleTitle: 'NOC Incident Response Lead',
            department: 'Network Operations Center (NOC)',
          },
          true
        );
      } else if (role === 'OPS_EXECUTIVE') {
        onLogin(
          {
            name: 'Dato’ Azman (Head of Ops)',
            email: 'ops.executive@tm.com.my',
            role: 'OPS_EXECUTIVE',
            roleTitle: 'Head of Network Operations & Assurance',
            department: 'Enterprise Operations & Assurance',
          },
          true
        );
      } else {
        onLogin(
          {
            name: 'Siti Aminah (SysAdmin)',
            email: 'portal.admin@tm.com.my',
            role: 'ADMIN',
            roleTitle: 'Enterprise Portal Administrator',
            department: 'TM IT Infrastructure & Security',
          },
          true
        );
      }
    }, 400);
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between ${isDarkMode ? 'bg-[#18181b] text-slate-100' : 'bg-[#F5F5F5] text-[#4A4A4A]'} transition-colors duration-200`}>
      {/* Top Banner with official TM Logo and Theme switch */}
      <header className={`border-b ${isDarkMode ? 'bg-[#202024] border-neutral-800' : 'bg-white border-neutral-200'} px-6 py-3.5 transition-colors`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TMLogo variant={isDarkMode ? 'white' : 'color'} size="md" />
            <span className="hidden sm:inline-block w-px h-5 bg-neutral-300 dark:bg-neutral-700" />
            <span className="hidden sm:inline-block text-xs font-semibold tracking-wide text-[#4A4A4A] dark:text-neutral-300">
              Telekom Malaysia Berhad
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              TM NOC SSO Gateway Online
            </span>
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-300 hover:text-white'
                  : 'bg-neutral-100 border-neutral-200 text-neutral-700 hover:text-black'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-200 ${
            isDarkMode
              ? 'bg-[#222226] border-neutral-800 shadow-black/40'
              : 'bg-white border-neutral-200 shadow-neutral-200/80'
          }`}>
            {/* TM Red Accent Header Stripe */}
            <div className="h-1.5 bg-[#D71920] w-full" />

            <div className="p-8">
              {/* TM Logo Prominently Displayed */}
              <div className="text-center mb-6">
                <div className="inline-flex justify-center mb-4">
                  <TMLogo variant={isDarkMode ? 'white' : 'color'} size="xl" showSubtitle={false} />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-[#4A4A4A] dark:text-white">
                  TM NOC &amp; OPS Management Portal
                </h1>
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="text-xs font-semibold text-[#D71920]">
                    TM OneTrack
                  </span>
                  <span className="text-xs text-neutral-400">&bull;</span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    NOC Incident Management System
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#034DA1] text-white font-mono">
                    Core v4.2
                  </span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                  Telekom Malaysia &middot; Scicom (MSC) Berhad Operations Portal
                </p>
              </div>

              {/* Validation / Error Message */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D71920]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username or Email */}
                <div>
                  <label className="block text-xs font-semibold text-[#4A4A4A] dark:text-neutral-300 mb-1.5">
                    Staff Email or Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={emailOrUsername}
                      onChange={(e) => setEmailOrUsername(e.target.value)}
                      placeholder="e.g. izzul.a@tm.com.my or staff ID"
                      className={`w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border transition-all outline-none ${
                        isDarkMode
                          ? 'bg-[#18181b] border-neutral-700 text-white placeholder-neutral-500 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
                          : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
                      }`}
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password with Show/Hide toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-[#4A4A4A] dark:text-neutral-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPasswordOpen(true)}
                      className="text-[11px] font-medium text-[#D71920] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your TM operational credentials"
                      className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-xl border transition-all outline-none ${
                        isDarkMode
                          ? 'bg-[#18181b] border-neutral-700 text-white placeholder-neutral-500 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
                          : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
                      }`}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D71920] focus:ring-[#D71920] accent-[#D71920] cursor-pointer"
                    />
                    <span className="text-xs text-[#4A4A4A] dark:text-neutral-300 font-medium">
                      Remember Me on this device
                    </span>
                  </label>
                </div>

                {/* Sign In Button with loading state */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-[#D71920] hover:bg-[#BF151B] active:bg-[#A31015] shadow-md shadow-[#D71920]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating with TM Gateway...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to TM Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Enterprise Role Switcher for seamless testing */}
              <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2.5 text-center">
                  Quick Internal Access (Authorized Roles)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickLogin('NOC_ENGINEER')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isDarkMode
                        ? 'bg-neutral-800/60 border-neutral-700/80 hover:border-[#D71920]'
                        : 'bg-neutral-50 border-neutral-200 hover:border-[#D71920]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D71920]">
                      <Server className="w-3.5 h-3.5" />
                      <span>NOC</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      Operations
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('OPS_EXECUTIVE')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isDarkMode
                        ? 'bg-neutral-800/60 border-neutral-700/80 hover:border-[#D71920]'
                        : 'bg-neutral-50 border-neutral-200 hover:border-[#D71920]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D71920]">
                      <Activity className="w-3.5 h-3.5" />
                      <span>OPS</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      Executive
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickLogin('ADMIN')}
                    className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                      isDarkMode
                        ? 'bg-neutral-800/60 border-neutral-700/80 hover:border-[#D71920]'
                        : 'bg-neutral-50 border-neutral-200 hover:border-[#D71920]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#D71920]">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Admin</span>
                    </div>
                    <div className="text-[10px] text-neutral-500 dark:text-neutral-400 truncate">
                      Governance
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className={`px-8 py-3 text-center text-[11px] border-t ${
              isDarkMode
                ? 'bg-neutral-900/60 border-neutral-800 text-neutral-400'
                : 'bg-neutral-50 border-neutral-200 text-neutral-500'
            }`}>
              Scicom (MSC) Berhad Corporate Network &middot; Internal Restricted System
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`w-full max-w-sm rounded-2xl p-6 border shadow-2xl ${
            isDarkMode ? 'bg-[#222226] border-neutral-700 text-white' : 'bg-white border-neutral-200 text-[#4A4A4A]'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <TMLogo variant={isDarkMode ? 'white' : 'color'} size="sm" />
              <div className="text-sm font-bold">TM Identity Self-Service</div>
            </div>

            {resetSubmitted ? (
              <div className="space-y-4 text-center py-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-sm">Reset Verification Sent</h4>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  Password reset link has been dispatched to <strong>{resetEmail}</strong> via TM Enterprise Outlook.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetSubmitted(false);
                    setResetEmail('');
                  }}
                  className="w-full py-2 bg-[#D71920] hover:bg-[#BF151B] text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Enter your registered Telekom Malaysia corporate email address. Your TM Network Security profile will receive a one-time verification token.
                </p>
                <div>
                  <label className="block text-xs font-semibold mb-1">Corporate Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@tm.com.my"
                    className={`w-full px-3 py-2 text-sm rounded-lg border outline-none ${
                      isDarkMode
                        ? 'bg-[#18181b] border-neutral-700 text-white focus:border-[#D71920]'
                        : 'bg-white border-neutral-300 text-black focus:border-[#D71920]'
                    }`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(false)}
                    className="flex-1 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (resetEmail.trim()) {
                        setResetSubmitted(true);
                      }
                    }}
                    className="flex-1 py-2 text-xs font-bold rounded-lg bg-[#D71920] hover:bg-[#BF151B] text-white cursor-pointer"
                  >
                    Send Token
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
