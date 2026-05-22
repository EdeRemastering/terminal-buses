import * as React from 'react';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/common/components/ui/sidebar';
import { AppSidebar } from '@/common/components/AppSidebar';
import { Bell, Search, User, LogOut } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Separator } from '@/common/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/common/components/ui/breadcrumb';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu';
import { useAuth } from '@/modules/auth/hooks/useAuth';

export const PrivateLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const pathnames = location.pathname.split('/').filter((x) => x);
  const [globalSearch, setGlobalSearch] = useState('');

  const handleGlobalSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/trips?search=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background/50 backdrop-blur-3xl">
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border/50 px-6 sticky top-0 z-10 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild>
                    <Link to="/dashboard">Terminal Central</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathnames.map((value, index) => {
                  const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                  const isLast = index === pathnames.length - 1;
                  const label = value === 'trips' ? 'Viajes' :
                                value === 'buses' ? 'Buses' :
                                value === 'routes' ? 'Rutas' :
                                value === 'passengers' ? 'Pasajeros' :
                                value === 'drivers' ? 'Conductores' :
                                value.charAt(0).toUpperCase() + value.slice(1);

                  return (
                    <React.Fragment key={to}>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink asChild>
                            <Link to={to}>{label}</Link>
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center relative mr-2">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input 
                type="text" 
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleGlobalSearch}
                placeholder="Buscar viajes, buses..." 
                className="h-9 w-64 bg-muted/50 border-none rounded-full pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
            
            <Button variant="ghost" size="icon" className="relative rounded-full" onClick={() => navigate('/trips')}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-background" />
            </Button>
            
            <Separator orientation="vertical" className="h-4 mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl p-2 min-w-[180px]">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="rounded-lg" onClick={() => navigate('/dashboard')}>
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg text-destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
