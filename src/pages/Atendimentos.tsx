
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, User, Plus, Filter, Instagram, Phone } from "lucide-react";

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
  const [filteredAtendimentos, setFilteredAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCanal, setFilterCanal] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchAtendimentos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [atendimentos, filterStatus, filterCanal]);

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

  const applyFilters = () => {
    let filtered = atendimentos;

    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    if (filterCanal !== "all") {
      filtered = filtered.filter((a) => a.canal === filterCanal);
    }

    setFilteredAtendimentos(filtered);
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
        return <Phone size={16} className="text-green-500" />;
      case "Telegram":
        return <MessageSquare size={16} className="text-blue-500" />;
      case "Instagram":
        return <Instagram size={16} className="text-pink-500" />;
      default:
        return <MessageSquare size={16} className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Atendimentos</h1>
        <div className="text-gray-400">Carregando atendimentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Atendimentos</h1>
        <Button className="bg-[#70a5ff] hover:bg-[#5a8ff0] text-white">
          <Plus size={16} className="mr-2" />
          Novo Atendimento
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Novos</CardTitle>
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {atendimentos.filter(a => a.status === "Novo").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Em Atendimento</CardTitle>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {atendimentos.filter(a => a.status === "Em Atendimento").length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Concluídos</CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-white">
              {atendimentos.filter(a => a.status === "Concluído").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Filter size={16} className="mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="bg-[#0d1117] border-gray-600 text-white">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-gray-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Novo">Novo</SelectItem>
                  <SelectItem value="Em Atendimento">Em Atendimento</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Canal</Label>
              <Select value={filterCanal} onValueChange={setFilterCanal}>
                <SelectTrigger className="bg-[#0d1117] border-gray-600 text-white">
                  <SelectValue placeholder="Todos os canais" />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-gray-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Telegram">Telegram</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atendimentos */}
      <div className="grid gap-4">
        {filteredAtendimentos.length > 0 ? (
          filteredAtendimentos.map((atendimento) => (
            <Card key={atendimento.id} className="bg-[#161b22] border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-3">
                      {getCanalIcon(atendimento.canal)}
                      <div className="flex items-center space-x-2">
                        <User size={16} className="text-gray-400" />
                        <span className="text-white font-medium">
                          {atendimento.nome_cliente || "Cliente não identificado"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">
                        <span className="font-medium">Canal:</span> {atendimento.canal || "Não especificado"}
                      </div>
                      <div className="text-gray-400">
                        <span className="font-medium">Criado em:</span>{" "}
                        {new Date(atendimento.criado_em).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    {atendimento.descricao && (
                      <div className="text-gray-300 text-sm">
                        <span className="font-medium text-gray-400">Descrição:</span> {atendimento.descricao}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <Badge className={`${getStatusColor(atendimento.status)} text-white`}>
                      {atendimento.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-[#161b22] border-gray-700">
            <CardContent className="p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhum atendimento encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Atendimentos;
