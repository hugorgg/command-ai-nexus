import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/agendamentos", icon: Calendar, label: "Agendamentos" },
    { path: "/atendimentos", icon: MessageSquare, label: "Atendimentos" },
    { path: "/pagamentos", icon: CreditCard, label: "Pagamentos" },
    { path: "/relatorios", icon: BarChart3, label: "Relatórios" },
    { path: "/configuracoes", icon: Settings, label: "Configurações" },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const SidebarContent = () => (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-xl font-bold text-white">ComandAI</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-white md:flex hidden"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </Button>
        </div>
      </div>

      <nav className="space-y-1 px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant="ghost"
                className={`w-full justify-start transition-colors duration-200 ${
                  isActive
                    ? "bg-[#70a5ff] text-white hover:bg-[#5a8ff0]"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                } ${
                  collapsed ? "px-2" : "px-3"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-4 left-0 right-0 px-2">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-40 md:hidden text-gray-400 hover:text-white"
      >
        <Menu size={24} />
      </Button>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-[#161b22] border-r border-gray-700"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <div
        className={`fixed hidden md:flex h-screen bg-[#161b22] border-r border-gray-700 flex-col transition-all duration-200 ease-in-out ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;