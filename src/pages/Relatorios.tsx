
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BarChart3, TrendingUp, Users, DollarSign, Download, Lock } from "lucide-react";

interface EmpresaInfo {
  plano: string;
}

const Relatorios = () => {
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id, plano")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        setEmpresaInfo({ plano: empresa.plano });

        // Buscar estatísticas se o plano permitir
        if (["Pro", "Plus", "Personalizado"].includes(empresa.plano)) {
          const { data: statsData } = await supabase
            .rpc("get_dashboard_stats", { p_empresa_id: empresa.id });
          
          setStats(statsData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    setGeneratingPDF(true);
    
    try {
      // Simular chamada para N8N para gerar PDF
      // Em uma implementação real, aqui seria feita a chamada para a API N8N
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay
      
      toast({
        title: "PDF Gerado",
        description: "O relatório em PDF foi gerado com sucesso!",
      });
      
      // Aqui seria retornado o link do PDF gerado
      console.log("PDF gerado via N8N");
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o relatório em PDF.",
        variant: "destructive",
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const isProPlan = empresaInfo && ["Pro", "Plus", "Personalizado"].includes(empresaInfo.plano);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Relatórios</h1>
        <div className="text-gray-400">Carregando relatórios...</div>
      </div>
    );
  }

  if (!isProPlan) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Relatórios</h1>
        
        <Card className="bg-[#161b22] border-gray-700">
          <CardContent className="p-8 text-center">
            <Lock size={64} className="mx-auto text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">
              Funcionalidade Exclusiva para Planos Pro+
            </h2>
            <p className="text-gray-400 mb-4">
              Os relatórios avançados estão disponíveis apenas para os planos Pro, Plus e Personalizado.
            </p>
            <Badge variant="outline" className="border-[#70a5ff] text-[#70a5ff]">
              Plano Atual: {empresaInfo?.plano}
            </Badge>
            <div className="mt-6">
              <Button className="bg-[#70a5ff] hover:bg-[#5a8ff0] text-white">
                Fazer Upgrade do Plano
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Relatórios</h1>
        <Button
          onClick={handleGeneratePDF}
          disabled={generatingPDF}
          className="bg-[#70a5ff] hover:bg-[#5a8ff0] text-white"
        >
          <Download size={16} className="mr-2" />
          {generatingPDF ? "Gerando PDF..." : "Gerar PDF"}
        </Button>
      </div>

      {/* Cards de Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total de Atendimentos
            </CardTitle>
            <Users className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {stats?.total_atendimentos || 0}
            </div>
            <p className="text-xs text-green-500">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Lucratividade
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {Number(stats?.total_receita || 0).toFixed(2)}
            </div>
            <p className="text-xs text-green-500">
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              67.5%
            </div>
            <p className="text-xs text-green-500">
              +3.2% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Crescimento de Clientes
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              +24
            </div>
            <p className="text-xs text-green-500">
              +15% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Relatório Detalhado */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Análise Detalhada</CardTitle>
          <CardDescription className="text-gray-400">
            Insights avançados sobre o desempenho do seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Performance de Atendimento</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Tempo médio de resposta</span>
                  <span className="text-white font-medium">2m 30s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Taxa de resolução</span>
                  <span className="text-green-500 font-medium">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Satisfação do cliente</span>
                  <span className="text-green-500 font-medium">4.8/5</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Canais Mais Utilizados</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">WhatsApp</span>
                  <span className="text-white font-medium">65%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Instagram</span>
                  <span className="text-white font-medium">25%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Telegram</span>
                  <span className="text-white font-medium">10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Recomendações</h3>
            <div className="space-y-3">
              <div className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <p className="text-white font-medium">📈 Oportunidade de Crescimento</p>
                <p className="text-gray-400 text-sm mt-1">
                  Considere expandir o atendimento no Telegram para aproveitar o crescimento de 25% no último mês.
                </p>
              </div>
              <div className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <p className="text-white font-medium">🎯 Otimização de Processo</p>
                <p className="text-gray-400 text-sm mt-1">
                  Automatizar respostas para perguntas frequentes pode reduzir o tempo de resposta em até 40%.
                </p>
              </div>
              <div className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <p className="text-white font-medium">💰 Aumento de Receita</p>
                <p className="text-gray-400 text-sm mt-1">
                  Implementar cross-selling durante os atendimentos pode aumentar a receita em 15-20%.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
