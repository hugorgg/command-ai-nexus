
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings, Building2, Clock, DollarSign, MessageSquare, Save } from "lucide-react";

interface Empresa {
  id: string;
  nome: string;
  email: string;
  plano: string;
}

interface Horario {
  id?: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fim: string;
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
  const [loading, setLoading] = useState(true);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [pagamentoLinks, setPagamentoLinks] = useState<PagamentoLinks>({});
  const [tomVoz, setTomVoz] = useState<TomVoz>({});
  const { toast } = useToast();

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    try {
      const { data: empresaData } = await supabase
        .from("empresas")
        .select("*")
        .eq("email", "demo@comandai.com")
        .single();

      if (empresaData) {
        setEmpresa(empresaData);

        // Buscar horários
        const { data: horariosData } = await supabase
          .from("horarios")
          .select("*")
          .eq("empresa_id", empresaData.id);

        if (horariosData) {
          setHorarios(horariosData);
        }

        // Buscar links de pagamento
        const { data: linksData } = await supabase
          .from("pagamentos_links")
          .select("*")
          .eq("empresa_id", empresaData.id)
          .single();

        if (linksData) {
          setPagamentoLinks(linksData);
        }

        // Buscar tom de voz
        const { data: tomVozData } = await supabase
          .from("tom_voz")
          .select("*")
          .eq("empresa_id", empresaData.id)
          .single();

        if (tomVozData) {
          setTomVoz(tomVozData);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar configurações:", error);
      toast({
        title: "Erro ao carregar configurações",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveEmpresa = async () => {
    if (!empresa) return;

    try {
      const { error } = await supabase
        .from("empresas")
        .update({ nome: empresa.nome, plano: empresa.plano })
        .eq("id", empresa.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas",
        description: "As informações da empresa foram atualizadas.",
      });
    } catch (error) {
      console.error("Erro ao salvar empresa:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações da empresa.",
        variant: "destructive",
      });
    }
  };

  const saveHorarios = async () => {
    if (!empresa) return;

    try {
      // Deletar horários existentes
      await supabase
        .from("horarios")
        .delete()
        .eq("empresa_id", empresa.id);

      // Inserir novos horários
      if (horarios.length > 0) {
        const { error } = await supabase
          .from("horarios")
          .insert(horarios.map(h => ({ ...h, empresa_id: empresa.id })));

        if (error) throw error;
      }

      toast({
        title: "Horários salvos",
        description: "Os horários de funcionamento foram atualizados.",
      });
    } catch (error) {
      console.error("Erro ao salvar horários:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os horários.",
        variant: "destructive",
      });
    }
  };

  const savePagamentoLinks = async () => {
    if (!empresa) return;

    try {
      const { error } = await supabase
        .from("pagamentos_links")
        .upsert({ ...pagamentoLinks, empresa_id: empresa.id });

      if (error) throw error;

      toast({
        title: "Links de pagamento salvos",
        description: "Os links de pagamento foram atualizados.",
      });
    } catch (error) {
      console.error("Erro ao salvar links:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os links de pagamento.",
        variant: "destructive",
      });
    }
  };

  const saveTomVoz = async () => {
    if (!empresa) return;

    try {
      const { error } = await supabase
        .from("tom_voz")
        .upsert({ ...tomVoz, empresa_id: empresa.id });

      if (error) throw error;

      toast({
        title: "Tom de voz salvo",
        description: "O tom de voz foi atualizado.",
      });
    } catch (error) {
      console.error("Erro ao salvar tom de voz:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o tom de voz.",
        variant: "destructive",
      });
    }
  };

  const updateHorario = (index: number, field: keyof Horario, value: any) => {
    const newHorarios = [...horarios];
    newHorarios[index] = { ...newHorarios[index], [field]: value };
    setHorarios(newHorarios);
  };

  const addHorario = () => {
    setHorarios([...horarios, {
      dia_semana: 'Segunda',
      hora_inicio: '09:00',
      hora_fim: '18:00',
      ativo: true
    }]);
  };

  const removeHorario = (index: number) => {
    setHorarios(horarios.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>
        <div className="text-gray-400">Carregando configurações...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white">Configurações</h1>

      {/* Informações da Empresa */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Building2 size={20} className="mr-2" />
            Informações da Empresa
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure as informações básicas da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Nome da Empresa</Label>
              <Input
                value={empresa?.nome || ""}
                onChange={(e) => setEmpresa(prev => prev ? { ...prev, nome: e.target.value } : null)}
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Email</Label>
              <Input
                value={empresa?.email || ""}
                disabled
                className="bg-[#0d1117] border-gray-600 text-gray-400"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Plano</Label>
              <Select 
                value={empresa?.plano || "Starter"} 
                onValueChange={(value) => setEmpresa(prev => prev ? { ...prev, plano: value } : null)}
              >
                <SelectTrigger className="bg-[#0d1117] border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-gray-700">
                  <SelectItem value="Starter">Starter</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Plus">Plus</SelectItem>
                  <SelectItem value="Personalizado">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={saveEmpresa} className="bg-[#70a5ff] hover:bg-[#5a8ff0]">
            <Save size={16} className="mr-2" />
            Salvar Informações
          </Button>
        </CardContent>
      </Card>

      {/* Horários de Funcionamento */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock size={20} className="mr-2" />
            Horários de Funcionamento
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure os horários de atendimento da sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {horarios.map((horario, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end p-4 bg-[#0d1117] rounded-lg">
              <div className="space-y-2">
                <Label className="text-white">Dia da Semana</Label>
                <Select 
                  value={horario.dia_semana} 
                  onValueChange={(value) => updateHorario(index, 'dia_semana', value)}
                >
                  <SelectTrigger className="bg-[#161b22] border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-gray-700">
                    {diasSemana.map(dia => (
                      <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-white">Hora Início</Label>
                <Input
                  type="time"
                  value={horario.hora_inicio}
                  onChange={(e) => updateHorario(index, 'hora_inicio', e.target.value)}
                  className="bg-[#161b22] border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">Hora Fim</Label>
                <Input
                  type="time"
                  value={horario.hora_fim}
                  onChange={(e) => updateHorario(index, 'hora_fim', e.target.value)}
                  className="bg-[#161b22] border-gray-600 text-white"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={horario.ativo}
                  onCheckedChange={(checked) => updateHorario(index, 'ativo', checked)}
                />
                <Label className="text-white">Ativo</Label>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeHorario(index)}
              >
                Remover
              </Button>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={addHorario} variant="outline" className="border-gray-600 text-white">
              Adicionar Horário
            </Button>
            <Button onClick={saveHorarios} className="bg-[#70a5ff] hover:bg-[#5a8ff0]">
              <Save size={16} className="mr-2" />
              Salvar Horários
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Links de Pagamento */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <DollarSign size={20} className="mr-2" />
            Links de Pagamento
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure os links para recebimento de pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label className="text-white">Link Único</Label>
              <Input
                value={pagamentoLinks.link_unico || ""}
                onChange={(e) => setPagamentoLinks(prev => ({ ...prev, link_unico: e.target.value }))}
                placeholder="https://..."
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Link PIX</Label>
              <Input
                value={pagamentoLinks.link_pix || ""}
                onChange={(e) => setPagamentoLinks(prev => ({ ...prev, link_pix: e.target.value }))}
                placeholder="https://..."
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Link Cartão</Label>
              <Input
                value={pagamentoLinks.link_cartao || ""}
                onChange={(e) => setPagamentoLinks(prev => ({ ...prev, link_cartao: e.target.value }))}
                placeholder="https://..."
                className="bg-[#0d1117] border-gray-600 text-white"
              />
            </div>
          </div>
          <Button onClick={savePagamentoLinks} className="bg-[#70a5ff] hover:bg-[#5a8ff0]">
            <Save size={16} className="mr-2" />
            Salvar Links
          </Button>
        </CardContent>
      </Card>

      {/* Tom de Voz */}
      <Card className="bg-[#161b22] border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare size={20} className="mr-2" />
            Tom de Voz da IA
          </CardTitle>
          <CardDescription className="text-gray-400">
            Configure como a IA deve se comunicar com seus clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Prompt do Tom de Voz</Label>
            <Textarea
              value={tomVoz.prompt || ""}
              onChange={(e) => setTomVoz(prev => ({ ...prev, prompt: e.target.value }))}
              placeholder="Descreva como a IA deve se comportar, o tom de voz a usar, personalidade, etc..."
              className="bg-[#0d1117] border-gray-600 text-white min-h-[120px]"
            />
          </div>
          <Button onClick={saveTomVoz} className="bg-[#70a5ff] hover:bg-[#5a8ff0]">
            <Save size={16} className="mr-2" />
            Salvar Tom de Voz
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
