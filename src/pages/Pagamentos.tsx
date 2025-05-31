
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, CreditCard, Smartphone, Link, User, Calendar, Filter } from "lucide-react";

interface Pagamento {
  id: string;
  nome_cliente?: string;
  valor: number;
  metodo?: string;
  status: string;
  recebido_em: string;
}

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [filteredPagamentos, setFilteredPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDate, setFilterDate] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchPagamentos();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pagamentos, filterStatus, filterDate]);

  const fetchPagamentos = async () => {
    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("id")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        const { data, error } = await supabase
          .from("pagamentos")
          .select("*")
          .eq("empresa_id", empresa.id)
          .order("recebido_em", { ascending: false });

        if (error) {
          throw error;
        }

        setPagamentos(data || []);
      }
    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      toast({
        title: "Erro ao carregar pagamentos",
        description: "Não foi possível carregar os pagamentos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = pagamentos;

    if (filterStatus !== "all") {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    if (filterDate) {
      filtered = filtered.filter((p) => 
        new Date(p.recebido_em).toISOString().split('T')[0] === filterDate
      );
    }

    setFilteredPagamentos(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pago":
        return "bg-green-500";
      case "Pendente":
        return "bg-yellow-500";
      case "Cancelado":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMetodoIcon = (metodo?: string) => {
    switch (metodo) {
      case "Pix":
        return <Smartphone size={16} className="text-[#70a5ff]" />;
      case "Cartão":
        return <CreditCard size={16} className="text-[#70a5ff]" />;
      case "Link":
        return <Link size={16} className="text-[#70a5ff]" />;
      default:
        return <DollarSign size={16} className="text-[#70a5ff]" />;
    }
  };

  // Calcular totais
  const totalRecebido = pagamentos
    .filter(p => p.status === "Pago")
    .reduce((sum, p) => sum + Number(p.valor), 0);

  const totalPendente = pagamentos
    .filter(p => p.status === "Pendente")
    .reduce((sum, p) => sum + Number(p.valor), 0);

  const totalGeral = pagamentos
    .reduce((sum, p) => sum + Number(p.valor), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Pagamentos</h1>
        <div className="text-gray-400">Carregando pagamentos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Pagamentos</h1>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Recebido
            </CardTitle>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {totalRecebido.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Pagamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Pendente
            </CardTitle>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {totalPendente.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Aguardando confirmação
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#161b22] border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Geral
            </CardTitle>
            <DollarSign className="h-4 w-4 text-[#70a5ff]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              R$ {totalGeral.toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              Todos os pagamentos
            </p>
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
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Cancelado">Cancelado</SelectItem>
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

      {/* Lista de Pagamentos */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Histórico de Pagamentos</CardTitle>
          <CardDescription className="text-gray-400">
            Lista de todos os pagamentos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPagamentos.length > 0 ? (
              filteredPagamentos.map((pagamento) => (
                <div
                  key={pagamento.id}
                  className="flex items-center justify-between p-4 bg-[#0d1117] rounded-lg border border-gray-700"
                >
                  <div className="flex items-center space-x-4">
                    {getMetodoIcon(pagamento.metodo)}
                    <div>
                      <div className="flex items-center space-x-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-white font-medium">
                          {pagamento.nome_cliente || "Cliente não identificado"}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-gray-400">
                          {pagamento.metodo || "Método não especificado"}
                        </span>
                        <div className="flex items-center text-sm text-gray-400">
                          <Calendar size={12} className="mr-1" />
                          {new Date(pagamento.recebido_em).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        R$ {Number(pagamento.valor).toFixed(2)}
                      </div>
                    </div>
                    <Badge className={`${getStatusColor(pagamento.status)} text-white`}>
                      {pagamento.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <DollarSign size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-400">Nenhum pagamento encontrado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pagamentos;
