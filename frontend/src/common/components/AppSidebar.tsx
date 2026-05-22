import { 
  Bus, 
  Calendar, 
  Users, 
  Map as MapIcon, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  UserCircle
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { cn } from '@/common/utils';
import { Button } from '@/common/components/ui/button';
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

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Viajes', path: '/trips', icon: Calendar, badge: 'En vivo' },
  { label: 'Buses', path: '/buses', icon: Bus },
  { label: 'Rutas', path: '/routes', icon: MapIcon },
  { label: 'Pasajeros', path: '/passengers', icon: Users },
  { label: 'Conductores', path: '/drivers', icon: UserCircle },
];

export const AppSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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

        <SidebarGroup className="mt-auto">
           <SidebarGroupLabel className="px-6 mb-2">Configuración</SidebarGroupLabel>
           <SidebarMenu>
               <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Ajustes" className="h-11 px-4 mx-2 rounded-xl text-muted-foreground hover:text-foreground">
                  <Link to="/dashboard">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Ajustes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
           </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2 py-3 rounded-2xl bg-muted/50 group-data-[collapsible=icon]:bg-transparent transition-all">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
            {user?.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate">{user?.name}</span>
            <span className="text-[11px] text-muted-foreground capitalize">{user?.role}</span>
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
