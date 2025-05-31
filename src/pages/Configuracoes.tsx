
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Wrench, 
  Clock, 
  Link, 
  Mic, 
  Plus, 
  Trash2, 
  Save,
  Lock,
  DollarSign
} from "lucide-react";

interface EmpresaInfo {
  id: string;
  nome: string;
  plano: string;
}

interface Servico {
  id: string;
  nome: string;
  valor: number;
}

interface Horario {
  id: string;
  dia_semana: string;
  hora_inicio?: string;
  hora_fim?: string;
  ativo: boolean;
}

interface PagamentoLinks {
  link_unico?: string;
  link_pix?: string;
  link_cartao?: string;
}

interface TomVoz {
  prompt?: string;
}

const Configuracoes = () => {
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(null);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [pagamentoLinks, setPagamentoLinks] = useState<PagamentoLinks>({});
  const [tomVoz, setTomVoz] = useState<TomVoz>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isServicoDialogOpen, setIsServicoDialogOpen] = useState(false);
  const { toast } = useToast();

  const [novoServico, setNovoServico] = useState({ nome: "", valor: "" });
  const [novoNomeEmpresa, setNovoNomeEmpresa] = useState("");

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: empresa } = await supabase
        .from("empresas")
        .select("*")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresa) {
        setEmpresaInfo(empresa);
        setNovoNomeEmpresa(empresa.nome);

        // Buscar serviços
        const { data: servicosData } = await supabase
          .from("servicos")
          .select("*")
          .eq("empresa_id", empresa.id);
        setServicos(servicosData || []);

        // Buscar horários
        const { data: horariosData } = await supabase
          .from("horarios")
          .select("*")
          .eq("empresa_id", empresa.id);
        
        // Criar horários padrão se não existirem
        const horariosExistentes = horariosData || [];
        const horariosCompletos = diasSemana.map(dia => {
          const horarioExistente = horariosExistentes.find(h => h.dia_semana === dia);
          return horarioExistente || {
            id: `temp-${dia}`,
            dia_semana: dia,
            hora_inicio: "09:00",
            hora_fim: "18:00",
            ativo: true
          };
        });
        setHorarios(horariosCompletos);

        // Buscar links de pagamento
        const { data: linksData } = await supabase
          .from("pagamentos_links")
          .select("*")
          .eq("empresa_id", empresa.id)
          .single();
        setPagamentoLinks(linksData || {});

        // Buscar tom de voz
        const { data: tomVozData } = await supabase
          .from("tom_voz")
          .select("*")
          .eq("empresa_id", empresa.id)
          .single();
        setTomVoz(tomVozData || {});
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNomeEmpresa = async () => {
    if (!empresaInfo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("empresas")
        .update({ nome: novoNomeEmpresa })
        .eq("id", empresaInfo.id);

      if (error) throw error;

      setEmpresaInfo({ ...empresaInfo, nome: novoNomeEmpresa });
      toast({
        title: "Nome atualizado",
        description: "O nome da empresa foi atualizado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar nome:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o nome da empresa.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateServico = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaInfo) return;

    try {
      const { error } = await supabase.from("servicos").insert({
        nome: novoServico.nome,
        valor: parseFloat(novoServico.valor),
        empresa_id: empresaInfo.id,
      });

      if (error) throw error;

      toast({
        title: "Serviço criado",
        description: "O serviço foi criado com sucesso.",
      });

      setIsServicoDialogOpen(false);
      setNovoServico({ nome: "", valor: "" });
      fetchData();
    } catch (error) {
      console.error("Erro ao criar serviço:", error);
      toast({
        title: "Erro ao criar serviço",
        description: "Não foi possível criar o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteServico = async (servicoId: string) => {
    try {
      const { error } = await supabase
        .from("servicos")
        .delete()
        .eq("id", servicoId);

      if (error) throw error;

      toast({
        title: "Serviço removido",
        description: "O serviço foi removido com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error("Erro ao remover serviço:", error);
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o serviço.",
        variant: "destructive",
      });
    }
  };

  const handleSaveHorarios = async () => {
    if (!empresaInfo) return;

    setSaving(true);
    try {
      // Deletar horários existentes
      await supabase.from("horarios").delete().eq("empresa_id", empresaInfo.id);

      // Inserir novos horários
      const horariosParaInserir = horarios.map(h => ({
        dia_semana: h.dia_semana,
        hora_inicio: h.hora_inicio,
        hora_fim: h.hora_fim,
        ativo: h.ativo,
        empresa_id: empresaInfo.id,
      }));

      const { error } = await supabase.from("horarios").insert(horariosParaInserir);

      if (error) throw error;

      toast({
        title: "Horários salvos",
        description: "Os horários foram salvos com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os horários.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveLinks = async () => {
    if (!empresaInfo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("pagamentos_links")
        .upsert({
          empresa_id: empresaInfo.id,
          link_unico: pagamentoLinks.link_unico,
          link_pix: pagamentoLinks.link_pix,
          link_cartao: pagamentoLinks.link_cartao,
        });

      if (error) throw error;

      toast({
        title: "Links salvos",
        description: "Os links de pagamento foram salvos com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar links:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os links.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTomVoz = async () => {
    if (!empresaInfo) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("tom_voz")
        .upsert({
          empresa_id: empresaInfo.id,
          prompt: tomVoz.prompt,
        });

      if (error) throw error;

      // Aqui seria feita a integração com N8N para configurar o agente IA
      console.log("Enviando prompt para N8N:", tomVoz.prompt);

      toast({
        title: "Tom de voz configurado",
        description: "O tom de voz da IA foi configurado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao salvar tom de voz:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o tom de voz.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const isProPlan = empresaInfo && ["Pro", "Plus", "Personalizado"].includes(empresaInfo.plano);
  const isPlusPlan = empresaInfo && ["Plus", "Personalizado"].includes(empresaInfo.plano);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Configurações</h1>
        <div className="text-gray-400">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Configurações</h1>

      {/* Informações da Empresa */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building2 size={20} className="mr-2" />
            Informações da Empresa
          </CardTitle>
          <CardDescription className="text-gray-400">
            Informações básicas da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Nome da Empresa</Label>
            <div className="flex space-x-2">
              <Input
                value={novoNomeEmpresa}
                onChange={(e) => setNovoNomeEmpresa(e.target.value)}
                className="bg-[#0d1117] border-gray-600 text-white"
              />
              <Button
                onClick={handleSaveNomeEmpresa}
                disabled={saving || novoNomeEmpresa === empresaInfo?.nome}
                className="bg-[#70a5ff] hover:bg-[#5a8ff0]"
              >
                <Save size={16} />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-white">Plano Atual</Label>
            <Badge variant="outline" className="border-[#70a5ff] text-[#70a5ff]">
              {empresaInfo?.plano}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Serviços e Valores */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Wrench size={20} className="mr-2" />
            Serviços e Valores
            {!isProPlan && <Lock size={16} className="ml-2 text-yellow-500" />}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isProPlan ? "Gerencie os serviços e valores da sua empresa" : "Disponível apenas para planos Pro+"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isProPlan ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-white font-medium">Lista de Serviços</h3>
                <Dialog open={isServicoDialogOpen} onOpenChange={setIsServicoDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#70a5ff] hover:bg-[#5a8ff0]">
                      <Plus size={16} className="mr-2" />
                      Adicionar Serviço
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#161b22] border-gray-700 text-white">
                    <DialogHeader>
                      <DialogTitle>Novo Serviço</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateServico} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nome do Serviço</Label>
                        <Input
                          value={novoServico.nome}
                          onChange={(e) => setNovoServico({ ...novoServico, nome: e.target.value })}
                          required
                          className="bg-[#0d1117] border-gray-600"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Valor (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={novoServico.valor}
                          onChange={(e) => setNovoServico({ ...novoServico, valor: e.target.value })}
                          required
                          className="bg-[#0d1117] border-gray-600"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-[#70a5ff] hover:bg-[#5a8ff0]">
                        Criar Serviço
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-2">
                {servicos.map((servico) => (
                  <div
                    key={servico.id}
                    className="flex items-center justify-between p-3 bg-[#0d1117] rounded-lg border border-gray-700"
                  >
                    <div>
                      <span className="text-white font-medium">{servico.nome}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-500 font-medium">
                        R$ {Number(servico.valor).toFixed(2)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteServico(servico.id)}
                        className="text-red-500 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
                {servicos.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    Nenhum serviço cadastrado
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">
                Esta funcionalidade está disponível apenas para planos Pro, Plus e Personalizado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Horários de Atendimento */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock size={20} className="mr-2" />
            Horários de Atendimento
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure os horários de funcionamento do atendimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {horarios.map((horario, index) => (
            <div
              key={horario.dia_semana}
              className="flex items-center space-x-4 p-3 bg-[#0d1117] rounded-lg border border-gray-700"
            >
              <div className="w-20">
                <span className="text-white font-medium">{horario.dia_semana}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="time"
                  value={horario.hora_inicio || ""}
                  onChange={(e) => {
                    const novosHorarios = [...horarios];
                    novosHorarios[index].hora_inicio = e.target.value;
                    setHorarios(novosHorarios);
                  }}
                  className="w-24 bg-[#161b22] border-gray-600 text-white"
                  disabled={!horario.ativo}
                />
                <span className="text-gray-400">às</span>
                <Input
                  type="time"
                  value={horario.hora_fim || ""}
                  onChange={(e) => {
                    const novosHorarios = [...horarios];
                    novosHorarios[index].hora_fim = e.target.value;
                    setHorarios(novosHorarios);
                  }}
                  className="w-24 bg-[#161b22] border-gray-600 text-white"
                  disabled={!horario.ativo}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={horario.ativo}
                  onCheckedChange={(checked) => {
                    const novosHorarios = [...horarios];
                    novosHorarios[index].ativo = checked;
                    setHorarios(novosHorarios);
                  }}
                />
                <span className="text-gray-400 text-sm">Ativo</span>
              </div>
            </div>
          ))}
          <Button
            onClick={handleSaveHorarios}
            disabled={saving}
            className="w-full bg-[#70a5ff] hover:bg-[#5a8ff0]"
          >
            <Save size={16} className="mr-2" />
            {saving ? "Salvando..." : "Salvar Horários"}
          </Button>
        </CardContent>
      </Card>

      {/* Links de Pagamento */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Link size={20} className="mr-2" />
            Links de Pagamento
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure os links para recebimento de pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Link Único</Label>
            <Input
              value={pagamentoLinks.link_unico || ""}
              onChange={(e) => setPagamentoLinks({ ...pagamentoLinks, link_unico: e.target.value })}
              placeholder="https://..."
              className="bg-[#0d1117] border-gray-600 text-white"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Link PIX</Label>
              <Input
                value={pagamentoLinks.link_pix || ""}
                onChange={(e) => setPagamentoLinks({ ...pagamentoLinks, link_pix: e.target.value })}
                placeholder="https://..."
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Link Cartão</Label>
              <Input
                value={pagamentoLinks.link_cartao || ""}
                onChange={(e) => setPagamentoLinks({ ...pagamentoLinks, link_cartao: e.target.value })}
                placeholder="https://..."
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
          </div>
          <Button
            onClick={handleSaveLinks}
            disabled={saving}
            className="w-full bg-[#70a5ff] hover:bg-[#5a8ff0]"
          >
            <Save size={16} className="mr-2" />
            {saving ? "Salvando..." : "Salvar Links"}
          </Button>
        </CardContent>
      </Card>

      {/* Tom de Voz IA */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Mic size={20} className="mr-2" />
            Tom de Voz IA
            {!isPlusPlan && <Lock size={16} className="ml-2 text-yellow-500" />}
          </CardTitle>
          <CardDescription className="text-gray-400">
            {isPlusPlan ? "Configure o tom de voz do agente de IA" : "Disponível apenas para planos Plus e Personalizado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isPlusPlan ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">Prompt do Tom de Voz</Label>
                <Textarea
                  value={tomVoz.prompt || ""}
                  onChange={(e) => setTomVoz({ ...tomVoz, prompt: e.target.value })}
                  placeholder="Descreva como a IA deve se comportar e falar com os clientes..."
                  className="bg-[#0d1117] border-gray-600 text-white min-h-[120px]"
                />
              </div>
              <Button
                onClick={handleSaveTomVoz}
                disabled={saving}
                className="w-full bg-[#70a5ff] hover:bg-[#5a8ff0]"
              >
                <Save size={16} className="mr-2" />
                {saving ? "Salvando..." : "Salvar Tom de Voz"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">
                Esta funcionalidade está disponível apenas para planos Plus e Personalizado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
