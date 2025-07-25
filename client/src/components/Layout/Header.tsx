import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../Auth/AuthModal';

interface HeaderProps {
  onNavigate: (section: string) => void;
  currentSection: string;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentSection }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const mobileMenuRef = useRef(null);

  const { user, isAuthenticated, signOut } = useAuth();

  const navItems = isAuthenticated
    ? [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'family', label: 'Family Members' },
      { id: 'meal-plan', label: 'Meal Plan' },
      { id: 'grocery', label: 'Grocery' },
      { id: 'guidance', label: 'Guidance' },
      { id: 'wellness', label: 'Wellness' }
    ]
    : [

    ];

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserMenu(false);
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Close mobile menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        showMobileMenu &&
        mobileMenuRef.current &&
        !(mobileMenuRef.current as any).contains(event.target)
      ) {
        setShowMobileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  return (
    <>
      <header className="bg-white shadow-lg border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className=" p-2 rounded-lg">
                <img src="/assets/img/logo.jpg" alt="Logo" className="h-12 w-12 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Swasth Parivar AI</h1>
                <p className="text-xs text-gray-500">Personalized Family Wellness</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentSection === item.id
                    ? 'bg-green-100 text-green-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {/* User Actions */}
            {/* <div className="flex items-center space-x-3">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="hidden sm:block text-sm font-medium">
                      {user.name || 'User'}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200"
                >
                  Sign In
                </button>
              )}

              <button
                className="md:hidden p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowMobileMenu((prev) => !prev)}
              >
                <Menu className="h-5 w-5" />
              </button>
            </div> */}
          </div>
        </div>

        {/* Mobile Navigation */}
        {/* {showMobileMenu && (
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-gray-200 bg-gray-50"
          >
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setShowMobileMenu(false); // close menu
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentSection === item.id
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white'
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )} */}
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        hasLogin={true}
      />
    </>
  );
};

export default Header;
