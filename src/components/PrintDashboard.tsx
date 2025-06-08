import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { Printer, FileText, Clock, CheckCircle2, AlertCircle, Trash2, Info } from 'lucide-react';
import { PrinterSettings } from './PrinterSettings';
import { printDocument, getPrinterStatus } from '@/integrations/printer/printer-bridge';
import { PrintRequest } from '../types/print-request';
import { Progress } from '@/components/ui/progress';
import { PrintService } from '@/services/printService';

interface ApiError extends Error {
  message: string;
}

// Interface para os dados brutos da API/banco de dados
interface PrintRequestFromDB {
  id: string;
  created_at: string;
  created_by: string;
  device_id: string | null;
  error_message: string | null;
  note_data: any;
  note_id: string;
  print_settings_id: string | null;
  print_type: string;
  printer_id: string | null;
  status: string;
  copies: number | null;
  printed_at?: string | null;
  printed_by?: string | null;
  // Campos que não vêm diretamente da tabela print_requests e serão adicionados/mapeados:
  // printer_name: string; (será derivado de printer_id)
  // updated_at: string | null; (será definido como null)
  // updated_by: string | null; (será definido como null)
}

export const PrintDashboard = () => {
  const { user, signOut } = useAuth();
  const [printRequests, setPrintRequests] = useState<PrintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoPrint, setAutoPrint] = useState(false);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const [oldRequestsCount, setOldRequestsCount] = useState(0);
  const [printerConfig, setPrinterConfig] = useState({ fiscalNotePrinter: '', normalPrinter: '' });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    printing: 0,
    completed: 0,
    failed: 0
  });
  const [printProgress, setPrintProgress] = useState(0);
  const [isPrinting, setIsPrinting] = useState(false);

  const mapDBToPrintRequest = (dbData: PrintRequestFromDB[]): PrintRequest[] => {
    return dbData.map(item => ({
      id: item.id,
      created_at: item.created_at,
      created_by: item.created_by,
      device_id: item.device_id,
      error_message: item.error_message,
      note_data: item.note_data,
      note_id: item.note_id,
      print_settings_id: item.print_settings_id,
      print_type: item.print_type || 'NORMAL',
      printer_id: item.printer_id,
      printer_name: item.printer_id || '', // Deriva printer_name de printer_id
      status: item.status,
      copies: item.copies === null ? 1 : item.copies, // Garante que copies seja um número
      updated_at: null, // Definido como null pois não vem do DB nesta consulta
      updated_by: null, // Definido como null pois não vem do DB nesta consulta
      printed_at: item.printed_at,
      printed_by: item.printed_by,
    }));
  };

  const loadPrintRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('print_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading print requests:', error);
        toast({
          title: "Erro",
          description: "Falha ao carregar solicitações de impressão",
          variant: "destructive",
        });
        return;
      }

      const dbItems = data as PrintRequestFromDB[] || [];
      const mappedData = mapDBToPrintRequest(dbItems);
      setPrintRequests(mappedData);
      
      const total = mappedData.length;
      const pending = mappedData.filter(req => req.status === 'pending').length;
      const printing = mappedData.filter(req => req.status === 'printing').length;
      const completed = mappedData.filter(req => req.status === 'completed').length;
      const failed = mappedData.filter(req => req.status === 'failed').length;
      
      setStats({ total, pending, printing, completed, failed });
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error loading print requests:', apiError.message);
      toast({
        title: "Erro",
        description: apiError.message || "Falha ao carregar solicitações de impressão",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOldRequestsCount = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('cleanup-print-requests', {
        method: 'GET'
      });

      if (error) {
        console.error('Error loading old requests count:', error);
        return;
      }

      setOldRequestsCount(data?.count || 0);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error loading old requests count:', apiError.message);
       toast({
        title: "Erro",
        description: apiError.message || "Falha ao carregar contagem de solicitações antigas",
        variant: "destructive",
      });
    }
  };

  const handleManualCleanup = async () => {
    setCleanupLoading(true);
    try {
      const { error } = await supabase.functions.invoke('cleanup-print-requests', {
        method: 'POST'
      });

      if (error) {
        console.error('Error during manual cleanup:', error);
        toast({
          title: "Erro",
          description: "Falha ao executar limpeza manual",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Limpeza concluída",
        description: "Registros antigos foram removidos com sucesso",
      });

      loadPrintRequests();
      loadOldRequestsCount();
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Error during manual cleanup:', apiError.message);
      toast({
        title: "Erro",
        description: apiError.message || "Falha ao executar limpeza manual",
        variant: "destructive",
      });
    } finally {
      setCleanupLoading(false);
    }
  };

  const processPrintQueue = async () => {
    setIsPrinting(true);
    setPrintProgress(0);
    
    const pendingRequests = printRequests.filter(req => req.status === 'pending');
    const totalPending = pendingRequests.length;
    let processed = 0;

    for (const request of pendingRequests) {
      let selectedPrinter = '';
      try {
        selectedPrinter = request.print_type === 'fiscal_note' 
          ? printerConfig.fiscalNotePrinter 
          : printerConfig.normalPrinter;

        if (!selectedPrinter) {
          console.warn(`Nenhuma impressora configurada para o tipo ${request.print_type} para a solicitação ${request.note_id}`);
          toast({
            title: "Aviso",
            description: `Nenhuma impressora configurada para o tipo de documento ${request.print_type}. Solicitação ${request.note_id} não será impressa.`,
            variant: "default",
          });
          continue;
        }

        const printerStatus = await getPrinterStatus(selectedPrinter);
        if (printerStatus !== 'READY') {
           const errorMessage = `Impressora ${selectedPrinter} não está pronta (status: ${printerStatus})`;
           console.error(errorMessage);
           toast({
            title: "Erro na Impressora",
            description: errorMessage,
            variant: "destructive",
          });
          // Não continua para esta solicitação, mas não a marca como falha ainda, 
          // pois a impressora pode voltar a ficar online.
          continue; 
        }

        const { error: updateError } = await supabase
          .from('print_requests')
          .update({ 
            status: 'printing',
            printer_id: selectedPrinter,
            updated_at: new Date().toISOString(), // Adicionando updated_at
            updated_by: user?.id // Adicionando updated_by
          })
          .eq('id', request.id);

        if (updateError) {
          console.error('Erro ao atualizar solicitação de impressão para "printing":', updateError);
           toast({
            title: "Erro",
            description: `Falha ao atualizar status da solicitação ${request.note_id} para imprimindo.`,
            variant: "destructive",
          });
          continue;
        }

        const printData = JSON.stringify(request.note_data, null, 2);
        
        console.log(`Imprimindo documento: ${request.note_id} na impressora: ${selectedPrinter}`);
        toast({
          title: "Imprimindo",
          description: `Iniciando impressão do documento ${request.note_id} na impressora ${selectedPrinter}`,
        });

        await printDocument(selectedPrinter, printData, {
          copies: request.copies || 1
        });

        const { error: completeError } = await supabase
          .from('print_requests')
          .update({ 
            status: 'completed',
            printed_at: new Date().toISOString(),
            printed_by: user?.id,
            updated_at: new Date().toISOString(), // Adicionando updated_at
            updated_by: user?.id // Adicionando updated_by
          })
          .eq('id', request.id);

        if (completeError) {
           console.error('Erro ao atualizar solicitação de impressão para "completed":', completeError);
            toast({
                title: "Erro",
                description: `Falha ao atualizar status da solicitação ${request.note_id} para concluída.`,
                variant: "destructive",
            });
        } else {
          toast({
            title: "Impressão concluída",
            description: `Documento ${request.note_id} foi impresso com sucesso na ${selectedPrinter}`,
          });
        }

        // Atualizar o progresso
        processed++;
        setPrintProgress((processed / totalPending) * 100);

      } catch (err) {
        const error = err as ApiError;
        console.error(`Erro ao processar solicitação de impressão ${request.id}:`, error.message);
        
        await supabase
          .from('print_requests')
          .update({ 
            status: 'failed',
            error_message: error.message || 'Erro durante o processamento',
            printer_id: selectedPrinter || request.printer_id, // Garante que printer_id seja salvo
            updated_at: new Date().toISOString(), // Adicionando updated_at
            updated_by: user?.id // Adicionando updated_by
          })
          .eq('id', request.id);

        toast({
          title: "Erro na impressão",
          description: `Falha ao processar impressão para ${request.note_id}: ${error.message || "Erro desconhecido"}`,
          variant: "destructive",
        });
      }
    }
    
    setIsPrinting(false);
    setPrintProgress(0);
  };

  const handlePrinterSettingsChange = (settings: { fiscalNotePrinter: string; normalPrinter: string }) => {
    setPrinterConfig(settings);
    console.log('Printer configuration updated:', settings);
    localStorage.setItem('printerSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    loadPrintRequests();
    loadOldRequestsCount();

    const channel = supabase
      .channel('print_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'print_requests'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          loadPrintRequests();
          loadOldRequestsCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (autoPrint && printRequests.some(req => req.status === 'pending')) {
      processPrintQueue();
    }
  }, [autoPrint, printRequests, printerConfig]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('printerSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setPrinterConfig(settings);
      } catch (e) {
        console.error("Failed to parse printer settings from localStorage", e);
        localStorage.removeItem('printerSettings'); // Clear corrupted settings
      }
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'printing':
        return 'default';
      case 'completed':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'printing':
        return <Printer className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard de Impressão</h1>
            <p className="text-gray-600">Bem-vindo, {user?.email}</p>
          </div>
          <Button onClick={signOut} variant="outline">
            Sair
          </Button>
        </div>

        {/* Printer Settings */}
        <div className="mb-6">
          <PrinterSettings onSettingsChange={handlePrinterSettingsChange} />
        </div>

        {/* Auto-print Control */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5" />
              Controle de Auto-Impressão
            </CardTitle>
            <CardDescription>
              Ative para processar automaticamente as solicitações pendentes. Ambas as impressoras configuradas irão imprimir notas fiscais e orçamentos automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-print"
                  checked={autoPrint}
                  onCheckedChange={setAutoPrint}
                />
                <Label htmlFor="auto-print">
                  Auto-impressão {autoPrint ? 'Ativada' : 'Desativada'}
                </Label>
              </div>
              <div className="text-sm text-gray-600">
                {printerConfig.fiscalNotePrinter && (
                  <div>Fiscal: {printerConfig.fiscalNotePrinter}</div>
                )}
                {printerConfig.normalPrinter && (
                  <div>Normal: {printerConfig.normalPrinter}</div>
                )}
                {(printerConfig.fiscalNotePrinter || printerConfig.normalPrinter) ? (
                  <div className="text-xs text-blue-600 mt-1">
                    Ambas imprimem automaticamente se configuradas.
                  </div>
                ) : (
                   <div className="text-xs text-red-600 mt-1">
                    Nenhuma impressora configurada para auto-impressão.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cleanup Control */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Limpeza Automática
            </CardTitle>
            <CardDescription>
              Sistema de limpeza automática de registros antigos (48+ horas)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Info className="w-4 h-4" />
                <span>
                  Registros antigos são removidos automaticamente a cada hora.
                  {oldRequestsCount > 0 && (
                    <span className="ml-2 font-medium text-orange-600">
                      {oldRequestsCount} registros podem ser removidos agora.
                    </span>
                  )}
                </span>
              </div>
              <Button 
                onClick={handleManualCleanup}
                disabled={cleanupLoading || oldRequestsCount === 0}
                variant="outline"
                size="sm"
              >
                {cleanupLoading ? 'Limpando...' : 'Limpar Agora'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{stats.printing}</div>
              <div className="text-sm text-gray-600">Imprimindo</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-gray-600">Concluídas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-600">Falharam</div>
            </CardContent>
          </Card>
        </div>

        {/* Print Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Impressão</CardTitle>
            <CardDescription>
              Lista de todas as solicitações de impressão em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            {printRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma solicitação de impressão encontrada</p>
              </div>
            ) : (
              <div className="space-y-4">
                {printRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(request.status)}
                      <div>
                        <h3 className="font-medium">Documento: {request.note_id}</h3>
                        <p className="text-sm text-gray-600">
                          {request.copies || 1} cópia(s) • Tipo: {request.print_type || 'NORMAL'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Criado em: {new Date(request.created_at).toLocaleString('pt-BR')}
                        </p>
                        {request.printer_name && (
                           <p className="text-xs text-gray-500">
                             Impressora: {request.printer_name}
                           </p>
                        )}
                         {request.status === 'failed' && request.error_message && (
                          <p className="text-xs text-red-500">
                            Erro: {request.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isPrinting && (
          <div className="mt-4 p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-2 mb-2">
              <Printer className="w-4 h-4" />
              <span>Progresso da Impressão</span>
            </div>
            <Progress value={printProgress} className="w-full" />
            <p className="text-sm text-gray-600 mt-1">
              {printProgress.toFixed(0)}% concluído
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
