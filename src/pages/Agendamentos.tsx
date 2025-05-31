
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, DollarSign, Plus, Filter, CheckCircle } from "lucide-react";

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone?: string;
  servico?: string;
  valor?: number;
  data: string;
  hora?: string;
  status: string;
}

const Agendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [agendamentos, filterStatus, filterDate]);

  const fetchAgendamentos = async () => {
    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        const { data, error } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("empresa_id", empresa.id)
          .order("data", { ascending: true });

        if (error) {
          throw error;
        }

        setAgendamentos(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
      toast({
        title: "Erro ao carregar agendamentos",
        description: "Não foi possível carregar os agendamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgendamentoStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("agendamentos")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) {
        throw error;
      }

      // Atualizar o estado local
      setAgendamentos(prev => 
        prev.map(agendamento => 
          agendamento.id === id 
            ? { ...agendamento, status: newStatus }
            : agendamento
        )
      );

      toast({
        title: "Status atualizado",
        description: `Agendamento marcado como ${newStatus.toLowerCase()}.`,
      });
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do agendamento.",
        variant: "destructive",
      });
    }
  };

  const applyFilters = () => {
    let filtered = agendamentos;

    if (filterStatus !== "all") {
      filtered = filtered.filter((a) => a.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter((a) => a.data === filterDate);
    }

    setFilteredAgendamentos(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Agendado":
        return "bg-blue-500";
      case "Concluído":
        return "bg-green-500";
      case "Pendente":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "Não definido";
    return timeString.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
        <div className="text-gray-400">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
        <Button className="bg-[#70a5ff] hover:bg-[#5a8ff0] text-white">
          <Plus size={16} className="mr-2" />
          Novo Agendamento
        </Button>
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
                  <SelectItem value="Agendado">Agendado</SelectItem>
                  <SelectItem value="Concluído">Concluído</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-white">Data</Label>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos em Cards */}
      <div className="grid gap-4">
        {filteredAgendamentos.length > 0 ? (
          filteredAgendamentos.map((agendamento) => (
            <Card key={agendamento.id} className="bg-[#161b22] border-gray-700 hover:border-gray-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-[#70a5ff]" />
                      <span className="text-white font-medium text-lg">
                        {agendamento.nome_cliente}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                      {agendamento.telefone && (
                        <div className="text-gray-400">
                          <span className="font-medium">Tel:</span> {agendamento.telefone}
                        </div>
                      )}
                      {agendamento.servico && (
                        <div className="text-gray-400">
                          <span className="font-medium">Serviço:</span> {agendamento.servico}
                        </div>
                      )}
                      <div className="flex items-center text-gray-400">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(agendamento.data)}
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Clock size={12} className="mr-1" />
                        {formatTime(agendamento.hora)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                    {agendamento.valor && (
                      <div className="flex items-center text-green-500 font-semibold">
                        <DollarSign size={14} className="mr-1" />
                        R$ {Number(agendamento.valor).toFixed(2)}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getStatusColor(agendamento.status)} text-white`}>
                        {agendamento.status}
                      </Badge>
                      
                      {agendamento.status !== "Concluído" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAgendamentoStatus(agendamento.id, "Concluído")}
                          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-[#161b22] border-gray-700">
            <CardContent className="p-8 text-center">
              <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Nenhum agendamento encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Agendamentos;
