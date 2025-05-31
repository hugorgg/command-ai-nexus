
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  // Detectar tamanho da tela
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const sidebarContent = (
    <>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          {(!collapsed || mobileOpen) && (
            <h2 className="text-xl font-bold text-white">ComandAI</h2>
          )}
          <div className="flex items-center space-x-2">
            {/* Botão de colapsar para desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex text-gray-400 hover:text-white"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </Button>
            {/* Botão de fechar para mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <X size={16} />
            </Button>
          </div>
        </div>
      </div>

      <nav className="px-2 lg:px-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
              <Button
                variant="ghost"
                className={`w-full justify-start text-left transition-all duration-200 ${
                  isActive
                    ? "bg-[#70a5ff] text-white hover:bg-[#5a8ff0]"
                    : "text-gray-400 hover:text-white hover:bg-gray-700"
                } ${collapsed && !mobileOpen ? "px-2 justify-center" : "px-3"}`}
              >
                <Icon size={16} className="shrink-0" />
                {(!collapsed || mobileOpen) && (
                  <span className="ml-3 truncate">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-2 lg:p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700 ${
            collapsed && !mobileOpen ? "px-2 justify-center" : "px-3"
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {(!collapsed || mobileOpen) && <span className="ml-3">Sair</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Botão de menu mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden text-white bg-[#161b22] border border-gray-700"
      >
        <Menu size={16} />
      </Button>

      {/* Overlay para mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#161b22] border-r border-gray-700 transition-all duration-300 z-30 hidden lg:flex flex-col ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </div>

      {/* Sidebar Mobile */}
      <div
        className={`fixed left-0 top-0 h-full bg-[#161b22] border-r border-gray-700 transition-transform duration-300 z-50 flex flex-col w-64 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
};

export default Sidebar;
