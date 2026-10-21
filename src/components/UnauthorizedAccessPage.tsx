import React from 'react';
import { ShieldAlert, ArrowLeft, Mail, Phone, Lock } from 'lucide-react';
import { TMOneNOCBrand } from './TMOneNOCBrand';

interface UnauthorizedAccessPageProps {
  attemptedEmail: string;
  onReturnToLogin: () => void;
  isDarkMode: boolean;
}

export const UnauthorizedAccessPage: React.FC<UnauthorizedAccessPageProps> = ({
  attemptedEmail,
  onReturnToLogin,
  isDarkMode,
}) => {
  return (
    <div
      className={`min-h-screen flex flex-col justify-between ${
        isDarkMode ? 'bg-[#121214] text-slate-100' : 'bg-[#F8FAFC] text-[#1E293B]'
      } transition-colors duration-200`}
    >
      <header
        className={`border-b ${
          isDarkMode ? 'bg-[#18181B] border-neutral-800' : 'bg-white border-slate-200'
        } px-6 py-4`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <TMOneNOCBrand size="md" theme={isDarkMode ? 'dark' : 'light'} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <div
            className={`rounded-2xl border shadow-xl overflow-hidden ${
              isDarkMode
                ? 'bg-[#1C1C1F] border-red-900/40 shadow-black/60'
                : 'bg-white border-red-200 shadow-slate-200/60'
            }`}
          >
            {/* Top Warning Banner */}
            <div className="bg-[#D71920] px-6 py-4 text-white flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <div>
                <h2 className="text-base font-bold leading-tight">403 Access Denied: Unauthorized Personnel</h2>
                <p className="text-xs text-red-100 mt-0.5">TM One / SciCom IT Security Enforcement</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-[#D71920] mx-auto flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white">
                  Access Restricted to NOC Personnel
                </h1>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-2 max-w-md mx-auto leading-relaxed">
                  The account <strong className="text-slate-800 dark:text-neutral-200 font-mono">{attemptedEmail}</strong> does not have an active NOC clearance profile or organizational permission to access this incident tracking system.
                </p>
              </div>

              {/* Information Card */}
              <div
                className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  isDarkMode
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Required Access Clearance:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-neutral-400">
                  <li>Active TM One / SciCom NOC Engineer or Incident Manager credentials</li>
                  <li>Tier 1, Tier 2, or Voice Core Operations membership</li>
                  <li>Designated SharePoint Excel and Power Automate workflow role</li>
                </ul>
              </div>

              {/* Support Contact */}
              <div className="text-xs text-slate-500 dark:text-neutral-400 space-y-1.5 border-t border-slate-200 dark:border-neutral-800 pt-4">
                <p className="font-semibold text-slate-700 dark:text-neutral-300">
                  Need access to this portal?
                </p>
                <p>
                  Contact the NOC Lead Administrator to request account provisioning:
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1 font-mono text-[11px]">
                  <span className="flex items-center gap-1.5 text-[#034DA1] dark:text-blue-400">
                    <Mail className="w-3.5 h-3.5" />
                    tmnoc-admin@scicom.com.my
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600 dark:text-neutral-400">
                    <Phone className="w-3.5 h-3.5" />
                    +603-2289-4000 (Ext 810)
                  </span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                <button
                  onClick={onReturnToLogin}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In Page</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        className={`border-t py-4 px-6 text-center text-xs ${
          isDarkMode ? 'border-neutral-800 text-neutral-500' : 'border-slate-200 text-slate-500'
        }`}
      >
        <span>Scicom (MSC) Berhad &middot; Information Security Management System (ISO 27001)</span>
      </footer>
    </div>
  );
};
