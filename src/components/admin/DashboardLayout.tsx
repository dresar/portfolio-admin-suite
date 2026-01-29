import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Inbox,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
  Moon,
  Sun,
  User,
  LogOut,
  Menu,
  X,
  Command,
  GraduationCap,
  Award,
  Briefcase,
  Code2,
  Share2,
  Newspaper,
  Key
} from 'lucide-react';
import { useAdminStore } from '@/store/adminStore';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { toast } from 'sonner';
import { useMessages } from '@/hooks/queries/useMessages';
import { useProfile } from '@/hooks/queries/useSettings';
import { getPlaceholderImage } from '@/lib/placeholder';
import { FloatingAssistant } from './FloatingAssistant';

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: number;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: FolderKanban, label: 'Projects', href: '/admin/projects' },
  { icon: Newspaper, label: 'Blog', href: '/admin/blog' },
  { icon: FileText, label: 'Content', href: '/admin/content' },
  { icon: Code2, label: 'Skills', href: '/admin/skills' },
  { icon: Briefcase, label: 'Experience', href: '/admin/experience' },
  { icon: GraduationCap, label: 'Education', href: '/admin/education' },
  { icon: Award, label: 'Certificates', href: '/admin/certificates' },
  { icon: Inbox, label: 'Inbox', href: '/admin/inbox' },
  { icon: Key, label: 'AI Keys', href: '/admin/ai-keys' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const { 
    theme, 
    toggleTheme, 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    // Remove profile/notifications from store if we use hooks
    // But keep theme/sidebarCollapsed in store as they are UI state
    notifications, 
    markNotificationRead,
    markAllNotificationsRead,
    exportAllData,
  } = useAdminStore();
  
  // Use hooks for data
  const { messages } = useMessages();
  const { profile: userProfile } = useProfile();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const unreadMessages = messages?.filter(m => !m.isRead).length || 0;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const profile = userProfile || {
      name: 'Admin',
      email: 'admin@example.com',
      role: 'Administrator',
      avatar: ''
  };

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, [currentTime]);

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleExportData = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
    toast.success('Logged out successfully!');
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40"
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <span className="font-semibold text-lg gradient-primary-text">Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              const showBadge = item.label === 'Inbox' && unreadMessages > 0;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'sidebar-item group relative',
                    isActive && 'sidebar-item-active'
                  )}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary')} />
                  <AnimatePresence mode="wait">
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="truncate"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {showBadge && (
                    <Badge 
                      variant="destructive" 
                      className={cn(
                        "h-5 min-w-5 px-1.5 text-xs",
                        sidebarCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
                      )}
                    >
                      {unreadMessages}
                    </Badge>
                  )}
                  {sidebarCollapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg border z-50">
                      {item.label}
                    </div>
                  )}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={cn(
            "flex items-center gap-3 p-2 rounded-lg",
            sidebarCollapsed && "justify-center"
          )}>
            {profile.heroImage ? (
                <img
                src={profile.heroImage}
                alt={profile.fullName || 'Admin'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onError={(e) => { e.currentTarget.src = getPlaceholderImage(36, 36, 'Admin'); }}
                />
            ) : (
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                    <User className="w-5 h-5 text-muted-foreground" />
                </div>
            )}
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-sm font-medium truncate">{profile.fullName || 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">{typeof profile.role === 'string' ? profile.role : 'Administrator'}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-72 bg-sidebar border-r border-sidebar-border z-50 lg:hidden"
            >
              <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-lg">A</span>
                  </div>
                  <span className="font-semibold text-lg gradient-primary-text">Admin</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 py-4 h-[calc(100vh-8rem)]">
                <nav className="px-3 space-y-1">
                  {navItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    const showBadge = item.label === 'Inbox' && unreadMessages > 0;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn('sidebar-item', isActive && 'sidebar-item-active')}
                      >
                        <Icon className={cn('h-5 w-5', isActive && 'text-primary')} />
                        <span>{item.label}</span>
                        {showBadge && (
                          <Badge variant="destructive" className="h-5 min-w-5 px-1.5 text-xs ml-auto">
                            {unreadMessages}
                          </Badge>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              <div className="p-3 border-t border-sidebar-border">
                <div className="flex items-center gap-3 p-2">
                  {profile.heroImage ? (
                    <img
                        src={profile.heroImage}
                        alt={profile.fullName || 'Admin'}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => { e.currentTarget.src = getPlaceholderImage(36, 36, 'Admin'); }}
                    />
                    ) : (
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-5 h-5 text-muted-foreground" />
                    </div>
                    )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{profile.fullName || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">{typeof profile.role === 'string' ? profile.role : 'Administrator'}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-[260px]"
        )}
      >
        {/* Header */}
        <header className="h-16 bg-background/80 backdrop-blur-xl border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors w-64"
            >
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-auto text-xs bg-background px-1.5 py-0.5 rounded border">
                <Command className="h-3 w-3 inline mr-0.5" />K
              </kbd>
            </button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Time & Greeting */}
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-medium">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-xs text-muted-foreground">{greeting}</span>
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-destructive rounded-full text-[10px] font-medium flex items-center justify-center text-destructive-foreground">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {unreadNotifications > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-auto py-1 px-2 text-xs"
                      onClick={markAllNotificationsRead}
                    >
                      Mark all read
                    </Button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-64">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground text-sm">
                      No notifications
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <DropdownMenuItem
                        key={notification.id}
                        className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                        onClick={() => markNotificationRead(notification.id)}
                      >
                        <div className="flex items-center gap-2 w-full">
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                          <span className="font-medium text-sm">{notification.title}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(notification.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-2">
                          {notification.message}
                        </span>
                      </DropdownMenuItem>
                    ))
                  )}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  {profile.heroImage ? (
                    <img
                        src={profile.heroImage}
                        alt={profile.fullName || 'Admin'}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        onError={(e) => { e.currentTarget.src = getPlaceholderImage(32, 32, 'Admin'); }}
                    />
                    ) : (
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <p className="font-medium">{profile.fullName || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground">{profile.email || 'admin@example.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportData}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search pages, settings, actions..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    setCommandOpen(false);
                    window.location.href = item.href;
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {item.label}
                </CommandItem>
              );
            })}
          </CommandGroup>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { toggleTheme(); setCommandOpen(false); }}>
              {theme === 'dark' ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Toggle Theme
            </CommandItem>
            <CommandItem onSelect={() => { handleExportData(); setCommandOpen(false); }}>
              <FileText className="mr-2 h-4 w-4" />
              Export All Data
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* AI Floating Assistant */}
      <FloatingAssistant />
    </div>
  );
}
