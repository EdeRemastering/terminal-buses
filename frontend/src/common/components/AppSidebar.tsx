import { 
  Bus, 
  Calendar, 
  Users, 
  Map as MapIcon, 
  LayoutDashboard, 
  LogOut,
  UserCircle,
  Eye,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import type { Role } from '@/common/types';
import { cn } from '@/common/utils';
import { Button } from '@/common/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/common/components/ui/sidebar';

interface NavItem { label: string; path: string; icon: React.ComponentType<{ className?: string }>; badge?: string; }

const roleNavItems: Record<string, NavItem[]> = {
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Viajes', path: '/trips', icon: Calendar, badge: 'En vivo' },
    { label: 'Buses', path: '/buses', icon: Bus },
    { label: 'Rutas', path: '/routes', icon: MapIcon },
    { label: 'Pasajeros', path: '/passengers', icon: Users },
    { label: 'Conductores', path: '/drivers', icon: UserCircle },
  ],
  SECRETARY: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Viajes', path: '/trips', icon: Calendar, badge: 'En vivo' },
    { label: 'Buses', path: '/buses', icon: Bus },
    { label: 'Rutas', path: '/routes', icon: MapIcon },
    { label: 'Pasajeros', path: '/passengers', icon: Users },
    { label: 'Conductores', path: '/drivers', icon: UserCircle },
  ],
  DRIVER: [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Viajes', path: '/trips', icon: Calendar, badge: 'En vivo' },
    { label: 'Buses', path: '/buses', icon: Bus },
    { label: 'Rutas', path: '/routes', icon: MapIcon },
  ],
};

export const AppSidebar = () => {
  const location = useLocation();
  const { user, effectiveRole, previewRole, setPreviewRole, clearPreviewRole, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = roleNavItems[effectiveRole ?? 'DRIVER'] ?? roleNavItems.DRIVER;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isPreviewing = previewRole !== null;

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-16 flex items-center px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bus className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
            TransTerminal
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isPreviewing && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Eye className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              Vista previa: {previewRole}
            </span>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="px-6 mb-2">Operaciones</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    tooltip={item.label}
                    className={cn(
                      "h-11 px-4 mx-2 rounded-xl transition-all duration-200",
                      isActive 
                        ? "bg-primary! text-primary-foreground! shadow-lg shadow-primary/20" 
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Link to={item.path}>
                      <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground!" : "text-muted-foreground")} />
                      <span className="font-medium">{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto text-[10px] bg-primary-foreground/20 text-primary-foreground px-1.5 py-0.5 rounded-full font-bold uppercase group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border space-y-2">
        {user?.role === 'ADMIN' && (
          <div className="flex items-center gap-2 px-2 group-data-[collapsible=icon]:hidden">
            <Eye className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Select
              value={previewRole ?? 'ADMIN'}
              onValueChange={(val) => {
                if (val === user.role) {
                  clearPreviewRole();
                } else {
                  setPreviewRole(val as Role);
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs rounded-lg border-dashed">
                <SelectValue placeholder="Vista como..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin (actual)</SelectItem>
                <SelectItem value="SECRETARY">Secretaría</SelectItem>
                <SelectItem value="DRIVER">Conductor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-3 px-2 py-3 rounded-2xl bg-muted/50 group-data-[collapsible=icon]:bg-transparent transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate">{user?.name}</span>
            <span className={cn(
              "text-[11px] capitalize",
              isPreviewing ? "text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground"
            )}>
              {effectiveRole}
              {isPreviewing && ' (vista previa)'}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="ml-auto text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};
