import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export type NavTab = 'home' | 'installation' | 'performance' | 'about' | 'contact';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: { id: NavTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'installation', label: 'Installation' },
    { id: 'performance', label: 'Performance' },
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#eeeeee] border-b border-[#d8d8d8] h-[44px]">
      <div className="max-w-[920px] mx-auto h-full px-4 flex items-center justify-between">
        {/* Mobile Left: Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden flex items-center gap-1.5 p-1 text-black cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Mobile Right: Artist Wordmark */}
        <button
          onClick={() => {
            onSelectTab('home');
            setMobileMenuOpen(false);
          }}
          className="md:hidden font-medium text-sm tracking-wider text-black"
        >
          Tedo Makharadze
        </button>

        {/* Desktop Centered Menu Bar (like roberthenke.com header) */}
        <nav className="hidden md:flex items-center justify-center w-full">
          <ul className="flex items-center list-none m-0 p-0 gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3.5 py-1.5 text-[13px] tracking-[0.4px] transition-colors cursor-pointer rounded-[2px] ${
                      isActive
                        ? 'font-semibold text-black bg-[#e0e0e0]'
                        : 'font-normal text-[#222222] hover:bg-[#e4e4e4] hover:text-black'
                    }`}
                  >
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#eeeeee] border-b border-[#d8d8d8] shadow-lg px-4 py-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`text-left py-2 px-3 text-sm tracking-wide rounded transition-colors ${
                  isActive
                    ? 'font-semibold text-black bg-[#dedede]'
                    : 'text-[#222222] hover:bg-[#e4e4e4]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
