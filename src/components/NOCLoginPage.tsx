import React, { useState, useEffect } from 'react';
import { TMOneNOCBrand } from './TMOneNOCBrand';
import { UserSession, UserRole } from '../types/nocSystem';
import {
  Lock,
  Mail,
  Shield,
  AlertCircle,
  ArrowRight,
  Sun,
  Moon,
  Building,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';

interface NOCLoginPageProps {
  onLogin: (session: UserSession, remember: boolean) => void;
  onUnauthorizedAttempt: (email: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const NOCLoginPage: React.FC<NOCLoginPageProps> = ({
  onLogin,
  onUnauthorizedAttempt,
  isDarkMode,
  onToggleTheme,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check URL query parameters for invitation links
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteEmail = urlParams.get('email');
      if (inviteEmail) {
        setEmail(inviteEmail);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const inputEmail = email.trim().toLowerCase();
    const inputPwd = password.trim();

    if (!inputEmail) {
      setErrorMessage('Please enter your organizational email address.');
      return;
    }

    if (!inputPwd) {
      setErrorMessage('Please enter your organizational account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Check unauthorized domain or test email
      if (inputEmail.includes('external') || inputEmail.includes('guest') || inputEmail.includes('unauthorized')) {
        onUnauthorizedAttempt(inputEmail);
        return;
      }

      // Check dynamic authorizedUsers from saved Admin config
      let matchedUser: any = null;
      try {
        const savedConfig = localStorage.getItem('tm_noc_admin_config_v3');
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          if (parsed && Array.isArray(parsed.authorizedUsers)) {
            matchedUser = parsed.authorizedUsers.find((u: any) =>
              u.email.toLowerCase() === inputEmail ||
              u.email.toLowerCase().split('@')[0] === inputEmail.split('@')[0]
            );
          }
        }
      } catch {
        // fallback
      }

      if (matchedUser) {
        if (!matchedUser.isActive || !matchedUser.isPermitted) {
          onUnauthorizedAttempt(inputEmail);
          return;
        }

        const roleTitleMap: Record<UserRole, string> = {
          NOC_USER: 'NOC',
          OPS_EXECUTIVE: 'Operations Executive',
          ADMIN: 'NOC System Administrator',
        };

        const session: UserSession = {
          id: matchedUser.id,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          roleTitle: roleTitleMap[matchedUser.role as UserRole] || 'NOC',
          department: matchedUser.department || 'Network Operations Center',
          team: matchedUser.role === 'NOC_USER' ? 'NOC' : (matchedUser.team || 'NOC'),
          isPermitted: true,
        };

        onLogin(session, rememberMe);
        return;
      }

      const isOps = inputEmail.includes('ops') || inputEmail.includes('executive') || inputEmail.includes('manager');
      const isAdmin = inputEmail.includes('admin') || inputEmail.includes('sys');
      const session: UserSession = {
        id: isOps ? 'USR-003' : isAdmin ? 'USR-002' : 'USR-001',
        name: isOps
          ? 'Norazlan Shah (Ops Executive)'
          : isAdmin
          ? 'Ahmad Fadzil (Admin)'
          : 'Izzul Dinie (NOC)',
        email: inputEmail.includes('@') ? inputEmail : `${inputEmail}@scicom.com.my`,
        role: isOps ? 'OPS_EXECUTIVE' : isAdmin ? 'ADMIN' : 'NOC_USER',
        roleTitle: isOps
          ? 'Operations Executive'
          : isAdmin
          ? 'NOC System Administrator'
          : 'NOC',
        department: isOps
          ? 'Operations & Service Management'
          : isAdmin
          ? 'Network Operations Center'
          : 'Network Operations Center',
        team: isOps ? 'Executive Leadership' : isAdmin ? 'Tier 3 Voice Core' : 'NOC',
        isPermitted: true,
      };

      onLogin(session, rememberMe);
    }, 500);
  };

  const handleQuickSelect = (roleType: 'noc' | 'admin' | 'ops' | 'unauthorized') => {
    if (roleType === 'unauthorized') {
      onUnauthorizedAttempt('guest.vendor@external.com');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (roleType === 'ops') {
        onLogin(
          {
            id: 'USR-003',
            name: 'Norazlan Shah',
            email: 'ops.executive@scicom.com.my',
            role: 'OPS_EXECUTIVE',
            roleTitle: 'Operations Executive',
            department: 'Operations & Service Management',
            team: 'Executive Leadership',
            isPermitted: true,
          },
          true
        );
      } else if (roleType === 'admin') {
        onLogin(
          {
            id: 'USR-002',
            name: 'Ahmad Fadzil',
            email: 'ahmad.fadzil@scicom.com.my',
            role: 'ADMIN',
            roleTitle: 'NOC System Administrator',
            department: 'NOC Systems Administration',
            team: 'Tier 3 Voice Core',
            isPermitted: true,
          },
          true
        );
      } else {
        onLogin(
          {
            id: 'USR-001',
            name: 'Izzul Dinie',
            email: 'izzul.dinie@scicom.com.my',
            role: 'NOC_USER',
            roleTitle: 'NOC',
            department: 'Network Operations Center',
            team: 'NOC',
            isPermitted: true,
          },
          true
        );
      }
    }, 300);
  };

  const handleAutoFill = (roleType: 'ops' | 'noc' | 'admin') => {
    if (roleType === 'ops') {
      setEmail('ops.executive@scicom.com.my');
      setPassword('password123');
    } else if (roleType === 'noc') {
      setEmail('izzul.dinie@scicom.com.my');
      setPassword('password123');
    } else {
      setEmail('ahmad.fadzil@scicom.com.my');
      setPassword('password123');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${
        isDarkMode ? 'bg-[#121214] text-slate-100' : 'bg-[#F8FAFC] text-[#1E293B]'
      } transition-colors duration-200`}
    >
      {/* Top Banner */}
      <header
        className={`border-b ${
          isDarkMode ? 'bg-[#18181B] border-neutral-800' : 'bg-white border-slate-200'
        } px-6 py-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <TMOneNOCBrand size="md" theme={isDarkMode ? 'dark' : 'light'} />

          <div className="flex items-center gap-4">
            <span
              className={`hidden md:inline-flex items-center gap-2 text-xs font-medium ${
                isDarkMode ? 'text-neutral-400' : 'text-slate-500'
              }`}
            >
              <Shield className="w-4 h-4 text-[#034DA1]" />
              Enterprise SSO Protected
            </span>

            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                isDarkMode
                  ? 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:text-white'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-black'
              }`}
              title="Toggle Light / Dark Mode"
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isDarkMode ? 'Light' : 'Dark'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div
            className={`rounded-2xl border shadow-xl overflow-hidden transition-all ${
              isDarkMode
                ? 'bg-[#1C1C1F] border-neutral-800 shadow-black/50'
                : 'bg-white border-slate-200 shadow-slate-200/60'
            }`}
          >
            {/* Top Red Corporate Header Line */}
            <div className="h-1.5 bg-[#D71920] w-full" />

            <div className="p-8">
              {/* Title and Description */}
              <div className="text-center mb-6">
                <div className="flex flex-col items-center justify-center mb-3">
                  <div className="p-2.5 rounded-2xl bg-white shadow-sm border border-slate-200/80">
                    <img
                      src="/assets/aistudio/telekom-malaysia-2023-seeklogo_8d5f5015.png"
                      alt="Telekom Malaysia"
                      className="h-12 w-auto object-contain"
                    />
                  </div>
                </div>

                <h1 className="text-lg font-bold tracking-tight text-[#1E293B] dark:text-white">
                  Incident Tracking System
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1 leading-relaxed">
                  Centralized platform for incident registration, monitoring, notification, and resolution.
                </p>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D71920]" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Organizational Microsoft / NOC Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. user@scicom.com.my or @tm.com.my"
                      className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-xs transition-colors outline-none font-medium ${
                        isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#D71920]'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-neutral-300 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter organizational password"
                      className={`w-full pl-9 pr-10 py-2.5 rounded-xl border text-xs transition-colors outline-none font-medium ${
                        isDarkMode
                          ? 'bg-neutral-900 border-neutral-700 text-white focus:border-[#D71920]'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-[#D71920] focus:ring-1 focus:ring-[#D71920]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#D71920] focus:ring-[#D71920]"
                    />
                    <span className="text-slate-600 dark:text-neutral-400">Remember credentials</span>
                  </label>
                  <span className="text-[11px] text-slate-400">No public registration</span>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#D71920] hover:bg-[#b5141a] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In with Organizational Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Sign-In Switcher for Instant Testing */}
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-neutral-800">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-neutral-500 mb-2.5 text-center flex items-center justify-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#034DA1]" />
                  <span>Authorized Credentials &amp; Quick Access</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* OPS EXECUTIVE CREDENTIALS */}
                  <div
                    className={`p-3 rounded-xl border transition-colors ${
                      isDarkMode
                        ? 'bg-neutral-900/90 border-emerald-500/30 hover:border-emerald-500'
                        : 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-400'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          OPS
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-neutral-100 flex items-center gap-1.5">
                            <span>Ops Executive</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold">
                              Monthly Summary
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                            ops.executive@scicom.com.my &bull; password123
                          </div>
                          <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                            Straightforward monthly summary for non-technical leadership
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-neutral-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAutoFill('ops')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-[10px] font-bold text-slate-600 dark:text-neutral-300 cursor-pointer"
                      >
                        Auto-Fill Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('ops')}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Sign In as Ops &rarr;
                      </button>
                    </div>
                  </div>

                  {/* NOC USER CREDENTIALS */}
                  <div
                    className={`p-3 rounded-xl border transition-colors ${
                      isDarkMode
                        ? 'bg-neutral-900 border-neutral-700 hover:border-[#034DA1]'
                        : 'bg-slate-50 border-slate-200 hover:border-[#034DA1]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#034DA1] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          NOC
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-neutral-100">
                            NOC Engineer (Izzul Dinie)
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                            izzul.dinie@scicom.com.my &bull; password123
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">
                            Manual entry SOP, ongoing issue reminders, resolve confirmation
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-neutral-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAutoFill('noc')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-[10px] font-bold text-slate-600 dark:text-neutral-300 cursor-pointer"
                      >
                        Auto-Fill Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('noc')}
                        className="px-3 py-1 rounded-lg bg-[#034DA1] hover:bg-[#023a7a] text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Sign In as NOC &rarr;
                      </button>
                    </div>
                  </div>

                  {/* ADMIN CREDENTIALS */}
                  <div
                    className={`p-3 rounded-xl border transition-colors ${
                      isDarkMode
                        ? 'bg-neutral-900 border-neutral-700 hover:border-[#D71920]'
                        : 'bg-slate-50 border-slate-200 hover:border-[#D71920]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[#D71920] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          ADM
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-neutral-100">
                            System Administrator (Ahmad Fadzil)
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 dark:text-neutral-400">
                            ahmad.fadzil@scicom.com.my &bull; password123
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-neutral-400 mt-0.5">
                            System configuration, authorized users, SLAs &amp; schedules
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-neutral-800 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAutoFill('admin')}
                        className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-[10px] font-bold text-slate-600 dark:text-neutral-300 cursor-pointer"
                      >
                        Auto-Fill Form
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickSelect('admin')}
                        className="px-3 py-1 rounded-lg bg-[#D71920] hover:bg-[#b5141a] text-white text-[10px] font-bold cursor-pointer transition-colors shadow-xs"
                      >
                        Sign In as Admin &rarr;
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickSelect('unauthorized')}
                    type="button"
                    className={`w-full flex items-center justify-between p-2 rounded-xl border border-dashed text-left transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'bg-neutral-900/40 border-neutral-700 hover:border-red-500 text-neutral-400'
                        : 'bg-slate-50 border-slate-300 hover:border-red-500 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-xs">Test Unauthorized Access Page</span>
                    </div>
                    <span className="text-[10px] text-red-500 font-mono">Simulate</span>
                  </button>
                </div>
              </div>

              {/* Access Restriction Notice */}
              <div className="mt-6 p-3 rounded-xl bg-slate-100 dark:bg-neutral-900/60 border border-slate-200 dark:border-neutral-800 text-[11px] text-slate-500 dark:text-neutral-400 leading-relaxed">
                <div className="font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-1.5 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#D71920]" />
                  <span>Access Restriction Notice</span>
                </div>
                Restricted to authorized Telekom Malaysia / SciCom Network Operations Center personnel. All incident actions, updates, and timestamps are recorded for audit compliance under TM One IT Security Policy.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-4 px-6 text-center text-xs ${
          isDarkMode
            ? 'border-neutral-800 text-neutral-500 bg-[#141416]'
            : 'border-slate-200 text-slate-500 bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TM One / SciCom (MSC) Berhad &middot; Corporate Network</span>
          <span>NOC Incident Management System &middot; Operational Edition</span>
        </div>
      </footer>
    </div>
  );
};
