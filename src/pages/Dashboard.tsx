
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Calendar,
  MessageSquare,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface DashboardStats {
  total_atendimentos: number;
  total_agendamentos: number;
  total_receita: number;
  total_mensagens: number;
  atendimentos_por_dia: Array<{
    data: string;
    atendimentos: number;
    agendamentos: number;
  }>;
}

interface Notificacao {
  id: string;
  tipo: string;
  mensagem: string;
  valor?: number;
  criado_em: string;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Buscar empresa demo
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        // Buscar estatísticas
        const { data: statsData, error: statsError } = await supabase
          .rpc("get_dashboard_stats", { p_empresa_id: empresa.id });

        if (statsError) {
          console.error("Erro ao buscar estatísticas:", statsError);
        } else {
          // Converter o JSON retornado para o tipo esperado
          const parsedStats = typeof statsData === 'string' ? JSON.parse(statsData) : statsData;
          setStats(parsedStats as DashboardStats);
        }

        // Buscar notificações recentes
        const { data: notifData, error: notifError } = await supabase
          .from("notificacoes")
          .select("*")
          .eq("empresa_id", empresa.id)
          .order("criado_em", { ascending: false })
          .limit(10);

        if (notifError) {
          console.error("Erro ao buscar notificações:", notifError);
        } else {
          setNotificacoes(notifData || []);
        }
      }
    } catch (error) {
      console.error("Erro no dashboard:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações do dashboard.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    switch (tipo) {
      case "venda_confirmada":
        return <CheckCircle className="text-green-500" size={16} />;
      case "novo_agendamento":
        return <Calendar className="text-blue-500" size={16} />;
      case "atendimento_iniciado":
        return <MessageSquare className="text-yellow-500" size={16} />;
      default:
        return <AlertCircle className="text-gray-500" size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
        <div className="text-gray-400">Carregando dados...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Atendimentos
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {stats?.total_atendimentos || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {stats?.total_agendamentos || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              R$ {Number(stats?.total_receita || 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Mensagens
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {stats?.total_mensagens || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Atendimentos dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.atendimentos_por_dia || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="data" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b22",
                    border: "1px solid #374151",
                    color: "#ffffff",
                  }}
                />
                <Bar dataKey="atendimentos" fill="#70a5ff" />
                <Bar dataKey="agendamentos" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Atividades Recentes */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Atividades Recentes</CardTitle>
          <CardDescription className="text-gray-400">
            Últimas atividades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificacoes.length > 0 ? (
              notificacoes.map((notif) => (
                <div
                  key={notif.id}
                  className="flex items-center space-x-3 p-3 rounded-lg bg-[#0d1117] border border-gray-700"
                >
                  {getNotificationIcon(notif.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm break-words">{notif.mensagem}</p>
                    <p className="text-gray-400 text-xs">
                      {new Date(notif.criado_em).toLocaleString()}
                    </p>
                  </div>
                  {notif.valor && (
                    <div className="text-green-500 font-medium text-sm">
                      R$ {Number(notif.valor).toFixed(2)}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nenhuma atividade recente encontrada.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
