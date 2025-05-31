
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Phone, User, DollarSign, Plus, Filter } from "lucide-react";

interface Agendamento {
  id: string;
  nome_cliente: string;
  telefone?: string;
  servico?: string;
  valor?: number;
  data: string;
  hora?: string;
  status: string;
  criado_em: string;
}

const Agendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [filteredAgendamentos, setFilteredAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Formulário para novo agendamento
  const [formData, setFormData] = useState({
    nome_cliente: "",
    telefone: "",
    servico: "",
    valor: "",
    data: "",
    hora: "",
    status: "Agendado",
  });

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

  const applyFilters = () => {
    let filtered = agendamentos;

    if (filterStatus !== "all") {
      filtered = filtered.filter((ag) => ag.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter((ag) => ag.data === filterDate);
    }

    setFilteredAgendamentos(filtered);
  };

  const handleCreateAgendamento = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id")
        .eq("email", "demo@comandai.com")
        .single();

      if (!empresa) {
        throw new Error("Empresa não encontrada");
      }

      const { error } = await supabase.from("agendamentos").insert({
        nome_cliente: formData.nome_cliente,
        telefone: formData.telefone,
        servico: formData.servico,
        valor: formData.valor ? parseFloat(formData.valor) : null,
        data: formData.data,
        hora: formData.hora || null,
        status: formData.status,
        empresa_id: empresa.id,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Agendamento criado",
        description: "O agendamento foi criado com sucesso.",
      });

      setIsDialogOpen(false);
      setFormData({
        nome_cliente: "",
        telefone: "",
        servico: "",
        valor: "",
        data: "",
        hora: "",
        status: "Agendado",
      });
      fetchAgendamentos();
    } catch (error) {
      console.error("Erro ao criar agendamento:", error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
    }
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
        <div className="text-gray-400">Carregando agendamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Agendamentos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#70a5ff] hover:bg-[#5a8ff0] text-white">
              <Plus size={16} className="mr-2" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#161b22] border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Criar Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAgendamento} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_cliente">Nome do Cliente</Label>
                <Input
                  id="nome_cliente"
                  value={formData.nome_cliente}
                  onChange={(e) => setFormData({ ...formData, nome_cliente: e.target.value })}
                  required
                  className="bg-[#0d1117] border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="bg-[#0d1117] border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="servico">Serviço</Label>
                <Input
                  id="servico"
                  value={formData.servico}
                  onChange={(e) => setFormData({ ...formData, servico: e.target.value })}
                  className="bg-[#0d1117] border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  type="number"
                  step="0.01"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  className="bg-[#0d1117] border-gray-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data">Data</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                    className="bg-[#0d1117] border-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hora">Hora</Label>
                  <Input
                    id="hora"
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="bg-[#0d1117] border-gray-600"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#70a5ff] hover:bg-[#5a8ff0]">
                Criar Agendamento
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

      {/* Lista de Agendamentos */}
      <div className="grid gap-4">
        {filteredAgendamentos.length > 0 ? (
          filteredAgendamentos.map((agendamento) => (
            <Card key={agendamento.id} className="bg-[#161b22] border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center text-white">
                        <User size={16} className="mr-2 text-[#70a5ff]" />
                        <span className="font-medium">{agendamento.nome_cliente}</span>
                      </div>
                      {agendamento.telefone && (
                        <div className="flex items-center text-gray-400">
                          <Phone size={14} className="mr-1" />
                          <span className="text-sm">{agendamento.telefone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        {new Date(agendamento.data).toLocaleDateString('pt-BR')}
                      </div>
                      {agendamento.hora && (
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {agendamento.hora}
                        </div>
                      )}
                      {agendamento.servico && (
                        <span>{agendamento.servico}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {agendamento.valor && (
                      <div className="flex items-center text-green-500">
                        <DollarSign size={16} className="mr-1" />
                        <span className="font-medium">
                          R$ {Number(agendamento.valor).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Badge className={`${getStatusColor(agendamento.status)} text-white`}>
                      {agendamento.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="bg-[#161b22] border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">Nenhum agendamento encontrado.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Agendamentos;
