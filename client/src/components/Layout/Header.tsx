import React, { useEffect, useRef, useState } from 'react';
import { Menu, X, LogOut, ChevronDown, KeyRound } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';
import SetPasswordModal from '../Auth/SetPasswordModal';
import { auth } from '../Auth/firebaseConfig';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const NAV_ITEMS_AUTH = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'family', label: 'Family Members' },
  { id: 'guidance', label: 'Guidance' },
];

const Header: React.FC<HeaderProps> = ({ onNavigate, currentSection }) => {
  const [authOpen, setAuthOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const { user, isAuthenticated, signOutFirebase } = useAuth();
  const navItems = isAuthenticated ? NAV_ITEMS_AUTH : [];

  const [setPasswordOpen, setSetPasswordOpen] = useState(false);
  // Check if the current Firebase user already has a password provider linked
  const hasPasswordProvider = auth.currentUser?.providerData.some(
    (p) => p.providerId === 'password'
  ) ?? false;

  const handleSignOut = async () => {
    try {
      await signOutFirebase();
      setShowUserMenu(false);
      setShowMobileMenu(false);
      onNavigate('dashboard');
    } catch (error) {
    }
  };

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setShowMobileMenu(false);
  };

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = showMobileMenu ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [showMobileMenu]);

  const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">

            {/* ── Logo ── */}
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-2 sm:gap-2.5 shrink-0 hover:opacity-90 transition-opacity"
            >
              <img
                src="/logo.png"
                alt="Prakriti Parivar"
                className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
              <div className="text-left">
                <p className="text-sm sm:text-base font-bold text-gray-800 leading-tight">
                  Prakriti Parivar
                </p>
                <p className=" xs:block text-[10px] sm:text-[11px] text-gray-500 leading-none">
                  Natural Family Living
                </p>
              </div>
            </button>

            {/* ── Desktop Nav ── */}
            {navItems.length > 0 && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentSection === item.id
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            )}

            {/* ── Right actions ── */}
            <div className="flex items-center gap-2 sm:gap-3">

              {user ? (
                /* ── User avatar + dropdown ── */
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((p) => !p)}
                    className="flex items-center gap-1.5 sm:gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-bold">{initials.toUpperCase()}</span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[100px] truncate">
                      {user.name || 'User'}
                    </span>
                    <ChevronDown className={`hidden sm:block w-3.5 h-3.5 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                      <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user.email}</p>
                      </div>
                      {!hasPasswordProvider && (
                        <button
                          onClick={() => { setShowUserMenu(false); setSetPasswordOpen(true); }}
                          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                        >
                          <KeyRound className="h-4 w-4 text-green-600" />
                          Set Password
                        </button>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Sign In button ── */
                <button
                  onClick={() => setAuthOpen(true)}
                  className="bg-gradient-to-r from-primary to-primary-dark text-white px-4 sm:px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm"
                >
                  Sign In
                </button>
              )}

              {/* ── Hamburger (mobile only) ── */}
              {navItems.length > 0 && (
                <button
                  className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  onClick={() => setShowMobileMenu((p) => !p)}
                  aria-label="Toggle menu"
                >
                  {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Mobile drawer ── */}
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setShowMobileMenu(false)} />

            {/* Drawer panel */}
            <div
              ref={mobileMenuRef}
              className="md:hidden absolute top-full left-0 right-0 z-40 bg-white border-t border-gray-100 shadow-xl"
            >
              {/* Nav links */}
              <nav className="px-4 pt-3 pb-2 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${currentSection === item.id
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              {/* Divider + user block (mobile) */}
              {user && (
                <div className="border-t border-gray-100 mx-4 pt-3 pb-4">
                  <div className="flex items-center gap-3 px-4 py-2 mb-1">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold">{initials.toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.name || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </header>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <SetPasswordModal
        open={setPasswordOpen}
        firebaseUser={auth.currentUser}
        onClose={() => setSetPasswordOpen(false)}
      />
    </>
  );
};

export default Header;
