import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { NotesService } from '@/services/notesService';
import { FiscalNote } from '@/types/FiscalNote';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Loader2 } from 'lucide-react';

interface PrintRequest {
  id: string;
  note_data: FiscalNote;
  status: 'pending' | 'printing' | 'completed' | 'error';
  error?: string;
}

const Print = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [note, setNote] = useState<FiscalNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [printQueue, setPrintQueue] = useState<PrintRequest[]>([]);

  useEffect(() => {
    if (id && user) {
      loadNote();
    }
  }, [id, user]);

  const loadNote = async () => {
    try {
      setLoading(true);
      const noteData = await NotesService.getNoteById(id!, user!.id);
      setNote(noteData);
    } catch (err) {
      setError('Erro ao carregar nota fiscal');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a nota fiscal.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const addNoteToQueue = async () => {
    if (!note) return;

    const request: PrintRequest = {
      id: crypto.randomUUID(),
      note_data: note,
      status: 'pending'
    };

    setPrintQueue(prev => [...prev, request]);
    toast({
      title: 'Nota Adicionada',
      description: `A nota fiscal #${note.noteNumber} foi adicionada à fila de impressão.`,
      variant: 'success',
    });
  };

  const processPrintQueue = async () => {
    const pendingRequests = printQueue.filter(req => req.status === 'pending');
    
    for (const request of pendingRequests) {
      try {
        // Atualizar status para impressão
        setPrintQueue(prev => prev.map(req => 
          req.id === request.id ? { ...req, status: 'printing' } : req
        ));

        // Simular impressão
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Atualizar status para concluído
        setPrintQueue(prev => prev.map(req => 
          req.id === request.id ? { ...req, status: 'completed' } : req
        ));

        toast({ 
          title: 'Impressão Concluída', 
          description: `Nota #${request.note_data.noteNumber} impressa.`, 
          variant: 'success' 
        });
      } catch (err) {
        setPrintQueue(prev => prev.map(req => 
          req.id === request.id ? { ...req, status: 'error', error: 'Erro na impressão' } : req
        ));

        toast({
          title: 'Erro na Impressão',
          description: 'Ocorreu um erro ao imprimir a nota fiscal.',
          variant: 'error',
        });
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-fiscal-green-500" />
        </div>
      </Layout>
    );
  }

  if (error || !note) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-500">{error || 'Nota fiscal não encontrada'}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Detalhes da Nota */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Nota Fiscal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold">Nota Fiscal #{note.noteNumber}</p>
                  <p className="text-sm text-gray-600">Cliente: {note.customerData.name}</p>
                </div>
                <Button onClick={addNoteToQueue} className="w-full">
                  <Printer className="mr-2 h-4 w-4" />
                  Adicionar à Fila de Impressão
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Fila de Impressão */}
          <Card>
            <CardHeader>
              <CardTitle>Fila de Impressão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {printQueue.length === 0 ? (
                  <p className="text-gray-500 text-center">Nenhuma nota na fila de impressão</p>
                ) : (
                  printQueue.map(req => (
                    <div key={req.id} className="p-4 border rounded-lg">
                      <p className="font-semibold">Nota Fiscal #{req.note_data.noteNumber}</p>
                      <p className="text-sm text-gray-600">Cliente: {req.note_data.customerData.name}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${req.status === 'completed' ? 'bg-green-100 text-green-800' :
                            req.status === 'error' ? 'bg-red-100 text-red-800' :
                            req.status === 'printing' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'}`}>
                          {req.status === 'completed' ? 'Concluído' :
                           req.status === 'error' ? 'Erro' :
                           req.status === 'printing' ? 'Imprimindo' :
                           'Pendente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
                {printQueue.length > 0 && (
                  <Button onClick={processPrintQueue} className="w-full">
                    Processar Fila
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Print;
