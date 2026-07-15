'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Sparkles, Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/huangli', label: '黄历' },
  { href: '/horoscope', label: '星座' },
  { href: '/tarot', label: '塔罗' },
  { href: '/bazi', label: '八字' },
  { href: '/synastry', label: '合盘' },
];

const moreItems = [
  { href: '/qimen', label: '奇门' },
  { href: '/liuyao', label: '六爻' },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-lg text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800"
      aria-label="切换主题"
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}

function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-cyan-700 rounded-md hover:bg-cyan-50 transition-all duration-200 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800 flex items-center gap-1"
      >
        更多
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-1 py-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-cyan-100 dark:border-slate-700 min-w-[100px] z-50">
          {moreItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-4 py-2 text-sm text-slate-600 hover:text-cyan-700 hover:bg-cyan-50 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-700 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="clean-navbar">
      <div className="w-full max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-600" />
            </div>
            <span className="font-semibold text-lg text-cyan-900 tracking-tight dark:text-cyan-100">
              问命/AskFate
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {item.label}
              </NavLink>
            ))}
            <MoreMenu />
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-slate-500 hover:text-cyan-600 transition-colors rounded-lg hover:bg-cyan-50 dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800"
              aria-label={isOpen ? '关闭菜单' : '打开菜单'}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-3 border-t border-cyan-100 dark:border-slate-700">
            <div className="flex flex-wrap gap-1">
              {[...navItems, ...moreItems].map((item) => (
                <MobileNavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="
        px-3 py-1.5 text-sm font-medium text-slate-600
        hover:text-cyan-700 rounded-md
        hover:bg-cyan-50
        transition-all duration-200
        dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800
      "
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="
        px-3 py-2 text-sm font-medium text-slate-600
        hover:text-cyan-700 hover:bg-cyan-50
        rounded-md transition-all duration-200
        dark:text-slate-400 dark:hover:text-cyan-400 dark:hover:bg-slate-800
      "
    >
      {children}
    </Link>
  );
}
