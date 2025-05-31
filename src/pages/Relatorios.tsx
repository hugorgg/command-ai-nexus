
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { BarChart3, TrendingUp, Calendar, DollarSign } from "lucide-react";

const Relatorios = () => {
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("30");
  const [agendamentosData, setAgendamentosData] = useState<any[]>([]);
  const [pagamentosData, setPagamentosData] = useState<any[]>([]);
  const [canaisData, setCanaisData] = useState<any[]>([]);
  const { toast } = useToast();

  const COLORS = ['#70a5ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  useEffect(() => {
    fetchRelatorios();
  }, [periodo]);

  const fetchRelatorios = async () => {
    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        // Buscar dados de agendamentos por período
        const dataInicio = new Date();
        dataInicio.setDate(dataInicio.getDate() - parseInt(periodo));

        const { data: agendamentos } = await supabase
          .from("agendamentos")
          .select("data, status, valor")
          .eq("empresa_id", empresa.id)
          .gte("criado_em", dataInicio.toISOString());

        // Processar dados de agendamentos por dia
        const agendamentosPorDia = agendamentos?.reduce((acc: any, item) => {
          const data = new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          if (!acc[data]) {
            acc[data] = { data, total: 0, concluidos: 0 };
          }
          acc[data].total += 1;
          if (item.status === 'Concluído') {
            acc[data].concluidos += 1;
          }
          return acc;
        }, {});

        setAgendamentosData(Object.values(agendamentosPorDia || {}));

        // Buscar dados de pagamentos
        const { data: pagamentos } = await supabase
          .from("pagamentos")
          .select("valor, status, metodo, recebido_em")
          .eq("empresa_id", empresa.id)
          .gte("recebido_em", dataInicio.toISOString());

        // Processar dados de pagamentos por dia
        const pagamentosPorDia = pagamentos?.reduce((acc: any, item) => {
          const data = new Date(item.recebido_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          if (!acc[data]) {
            acc[data] = { data, receita: 0 };
          }
          if (item.status === 'Pago') {
            acc[data].receita += Number(item.valor);
          }
          return acc;
        }, {});

        setPagamentosData(Object.values(pagamentosPorDia || {}));

        // Buscar dados de canais de atendimento
        const { data: atendimentos } = await supabase
          .from("atendimentos")
          .select("canal")
          .eq("empresa_id", empresa.id)
          .gte("criado_em", dataInicio.toISOString());

        // Processar dados por canal
        const atendimentosPorCanal = atendimentos?.reduce((acc: any, item) => {
          const canal = item.canal || 'Não especificado';
          if (!acc[canal]) {
            acc[canal] = { name: canal, value: 0 };
          }
          acc[canal].value += 1;
          return acc;
        }, {});

        setCanaisData(Object.values(atendimentosPorCanal || {}));
      }
    } catch (error) {
      console.error("Erro ao buscar relatórios:", error);
      toast({
        title: "Erro ao carregar relatórios",
        description: "Não foi possível carregar os dados dos relatórios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Relatórios</h1>
        <div className="text-gray-400">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Relatórios</h1>
        <div className="w-full sm:w-auto">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="bg-[#161b22] border-gray-600 text-white">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-gray-700">
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {agendamentosData.reduce((sum, item) => sum + item.total, 0)}
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
              R$ {pagamentosData.reduce((sum, item) => sum + item.receita, 0).toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Taxa de Conclusão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {agendamentosData.length > 0
                ? ((agendamentosData.reduce((sum, item) => sum + item.concluidos, 0) /
                    agendamentosData.reduce((sum, item) => sum + item.total, 0)) * 100).toFixed(1)
                : 0}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Canais Ativos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {canaisData.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Agendamentos */}
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Agendamentos por Dia</CardTitle>
            <CardDescription className="text-gray-400">
              Total de agendamentos e conclusões no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agendamentosData}>
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
                  <Bar dataKey="total" fill="#70a5ff" name="Total" />
                  <Bar dataKey="concluidos" fill="#10b981" name="Concluídos" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Receita */}
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Receita por Dia</CardTitle>
            <CardDescription className="text-gray-400">
              Evolução da receita no período
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pagamentosData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="data" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161b22",
                      border: "1px solid #374151",
                      color: "#ffffff",
                    }}
                    formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="receita" 
                    stroke="#70a5ff" 
                    strokeWidth={2}
                    dot={{ fill: '#70a5ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Pizza - Canais de Atendimento */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Distribuição por Canal de Atendimento</CardTitle>
          <CardDescription className="text-gray-400">
            Percentual de atendimentos por canal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={canaisData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {canaisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#161b22",
                    border: "1px solid #374151",
                    color: "#ffffff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
