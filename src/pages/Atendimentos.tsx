
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Clock, User } from "lucide-react";

interface Atendimento {
  id: string;
  nome_cliente?: string;
  canal?: string;
  status: string;
  descricao?: string;
  criado_em: string;
}

const Atendimentos = () => {
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAtendimentos();
    
    // Polling para atualização em tempo real (a cada 30 segundos)
    const interval = setInterval(fetchAtendimentos, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAtendimentos = async () => {
    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        const { data, error } = await supabase
          .from("atendimentos")
          .select("*")
          .eq("empresa_id", empresa.id)
          .order("criado_em", { ascending: false });

        if (error) {
          throw error;
        }

        setAtendimentos(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
      toast({
        title: "Erro ao carregar atendimentos",
        description: "Não foi possível carregar os atendimentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Novo":
        return "bg-blue-500";
      case "Em Atendimento":
        return "bg-yellow-500";
      case "Concluído":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCanalIcon = (canal?: string) => {
    switch (canal) {
      case "WhatsApp":
        return "💬";
      case "Telegram":
        return "📱";
      case "Instagram":
        return "📷";
      default:
        return "💌";
    }
  };

  const atendimentosNovos = atendimentos.filter(a => a.status === "Novo");
  const atendimentosEmAndamento = atendimentos.filter(a => a.status === "Em Atendimento");
  const atendimentosConcluidos = atendimentos.filter(a => a.status === "Concluído");

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Atendimentos</h1>
        <div className="text-gray-400">Carregando atendimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Atendimentos</h1>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Clock size={14} />
          <span>Atualização automática a cada 30s</span>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Novos Atendimentos
            </CardTitle>
            <CardDescription className="text-gray-400">
              {atendimentosNovos.length} atendimento(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {atendimentosNovos.slice(0, 3).map((atendimento) => (
              <div key={atendimento.id} className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCanalIcon(atendimento.canal)}</span>
                    <span className="text-white text-sm font-medium">
                      {atendimento.nome_cliente || "Cliente"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {atendimento.canal}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {atendimento.descricao || "Sem descrição"}
                </p>
              </div>
            ))}
            {atendimentosNovos.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum atendimento novo</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              Em Atendimento
            </CardTitle>
            <CardDescription className="text-gray-400">
              {atendimentosEmAndamento.length} atendimento(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {atendimentosEmAndamento.slice(0, 3).map((atendimento) => (
              <div key={atendimento.id} className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCanalIcon(atendimento.canal)}</span>
                    <span className="text-white text-sm font-medium">
                      {atendimento.nome_cliente || "Cliente"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {atendimento.canal}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {atendimento.descricao || "Sem descrição"}
                </p>
              </div>
            ))}
            {atendimentosEmAndamento.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum atendimento em andamento</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Concluídos
            </CardTitle>
            <CardDescription className="text-gray-400">
              {atendimentosConcluidos.length} atendimento(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {atendimentosConcluidos.slice(0, 3).map((atendimento) => (
              <div key={atendimento.id} className="p-3 bg-[#0d1117] rounded-lg border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getCanalIcon(atendimento.canal)}</span>
                    <span className="text-white text-sm font-medium">
                      {atendimento.nome_cliente || "Cliente"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {atendimento.canal}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {atendimento.descricao || "Sem descrição"}
                </p>
              </div>
            ))}
            {atendimentosConcluidos.length === 0 && (
              <p className="text-gray-400 text-sm">Nenhum atendimento concluído</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista Completa de Atendimentos */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Todos os Atendimentos</CardTitle>
          <CardDescription className="text-gray-400">
            Lista completa de atendimentos ordenados por data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atendimentos.length > 0 ? (
              atendimentos.map((atendimento) => (
                <div
                  key={atendimento.id}
                  className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{getCanalIcon(atendimento.canal)}</div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-[#70a5ff]" />
                        <span className="text-white font-medium">
                          {atendimento.nome_cliente || "Cliente não identificado"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {atendimento.descricao || "Sem descrição disponível"}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {atendimento.canal} • {new Date(atendimento.criado_em).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(atendimento.status)} text-white`}>
                    {atendimento.status}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Nenhum atendimento encontrado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Atendimentos;
