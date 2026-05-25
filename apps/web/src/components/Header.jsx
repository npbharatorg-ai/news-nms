import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Search, LogOut, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser, logout, reporterLogout, getReporterFromStorage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const reporterUser = getReporterFromStorage();
  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super_admin';
  const isReporter = !!reporterUser;

  const handleLogout = () => {
    if (isAdmin) {
      logout();
      navigate('/');
    } else if (isReporter) {
      reporterLogout();
      navigate('/');
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Ebook', path: 'https://ebook.nms.news', external: true },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In a real implementation, navigate to search page or trigger search state
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo 1 */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="https://nms.news/wp-content/uploads/2026/05/nms.jpeg" 
                className="h-14 w-15 md:h-15 md:w-15 object-contain group-hover:scale-105 transition-transform duration-300"
              />
              <div className="flex flex-col">
                <span className="font-extrabold text-xl md:text-2xl tracking-tight text-secondary leading-none">
                  
                </span>
                <span className="font-bold text-primary text-sm md:text-base tracking-widest uppercase leading-none mt-1">
                  
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 mx-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  isActive(link.path)
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : 'text-foreground/80 hover:bg-secondary/10 hover:text-secondary'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative mr-2">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 xl:w-64 pl-10 pr-4 py-2 bg-muted/50 border border-transparent rounded-full text-sm focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-foreground"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </form>

            <ThemeToggle />
            <LanguageSwitcher />
            
            <div className="h-8 w-px bg-border mx-1"></div>

            {!isAdmin && !isReporter && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild className="text-sm font-bold text-secondary hover:text-secondary hover:bg-secondary/10 rounded-full">
                  <Link to="/reporter-login">Reporter Login</Link>
                </Button>
                <Button asChild className="text-sm font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shadow-md shadow-primary/20">
                  <Link to="/admin-login">Admin Login</Link>
                </Button>
              </div>
            )}

            {isAdmin && (
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="gap-2 border-secondary text-secondary hover:bg-secondary/10 rounded-full">
                  <Link to="/admin"><Shield className="w-4 h-4" /> Admin</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-destructive hover:bg-destructive/10" title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isReporter && (
              <div className="flex items-center gap-2">
                <Button variant="outline" asChild className="gap-2 border-secondary text-secondary hover:bg-secondary/10 rounded-full">
                  <Link to="/reporter-dashboard"><User className="w-4 h-4" /> Dashboard</Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full text-destructive hover:bg-destructive/10" title="Logout">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-3">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary hover:bg-secondary/10">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-md">
          <div className="px-4 py-4 space-y-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:border-primary text-foreground"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </form>

            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`block px-4 py-3 rounded-xl text-base font-semibold ${
                    isActive(link.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground/80 hover:bg-secondary/10 hover:text-secondary'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Language</span>
                <LanguageSwitcher />
              </div>
              
              {!isAdmin && !isReporter && (
                <div className="grid grid-cols-1 gap-3">
                  <Button variant="outline" asChild className="w-full border-secondary text-secondary rounded-xl py-6">
                    <Link to="/reporter-login" onClick={() => setIsMenuOpen(false)}>Reporter Login</Link>
                  </Button>
                  <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl py-6 shadow-md">
                    <Link to="/admin-login" onClick={() => setIsMenuOpen(false)}>Admin Login</Link>
                  </Button>
                </div>
              )}

              {isAdmin && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="w-full gap-2 border-secondary text-secondary rounded-xl">
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)}><Shield className="w-4 h-4" /> Admin</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full gap-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20">
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
              )}

              {isReporter && (
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" asChild className="w-full gap-2 border-secondary text-secondary rounded-xl">
                    <Link to="/reporter-dashboard" onClick={() => setIsMenuOpen(false)}><User className="w-4 h-4" /> Dashboard</Link>
                  </Button>
                  <Button variant="ghost" onClick={handleLogout} className="w-full gap-2 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive/20">
                    <LogOut className="w-4 h-4" /> Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;