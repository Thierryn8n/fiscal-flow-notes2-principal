import React, { useEffect, useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import { Printer, AlertTriangle, ListChecks, X, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NotesService, FiscalNote } from '@/services/notesService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Mocking PrintRequest locally since the service is missing
export interface PrintRequest {
  id: string;
  note_id: string;
  note_data: FiscalNote;
  status: 'pending' | 'printed' | 'error';
  created_by: string;
  error_message?: string;
}

const PrintPage: React.FC = () => {
  const { toast } = useToast();
  const { id: noteIdFromUrl } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [printQueue, setPrintQueue] = useState<PrintRequest[]>([]);
  const [isPrintingStation, setIsPrintingStation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const addNoteToQueue = useCallback((note: FiscalNote) => {
    if (!user) return;
    const newRequest: PrintRequest = {
      id: `req_${note.id}_${Date.now()}`,
      note_id: note.id,
      note_data: note,
      status: 'pending',
      created_by: user.id,
    };
    setPrintQueue(prev => [newRequest, ...prev.filter(p => p.note_id !== note.id)]);
      toast({
      title: 'Adicionado à fila',
      description: `A nota fiscal #${note.note_number} foi adicionada à fila de impressão.`,
      variant: 'success',
    });
  }, [user, toast]);

  useEffect(() => {
    if (noteIdFromUrl && user) {
      const loadAndQueueNote = async () => {
        setIsLoading(true);
        try {
          const note = await NotesService.getNoteById(noteIdFromUrl, user.id);
          if (note) {
            addNoteToQueue(note);
          } else {
            toast({ title: 'Nota não encontrada', variant: 'destructive' });
            }
          } catch (error) {
          console.error(error);
          toast({ title: 'Erro ao buscar nota', variant: 'destructive' });
        } finally {
          setIsLoading(false);
          navigate('/print');
        }
      };
      loadAndQueueNote();
    }
  }, [noteIdFromUrl, user, addNoteToQueue, navigate, toast]);
  
  const processPrintRequest = (request: PrintRequest) => {
    console.log("Imprimindo:", request.note_data);
    
    // Simulate printing
    setTimeout(() => {
        setPrintQueue(prev => prev.map(r => r.id === request.id ? {...r, status: 'printed'} : r));
        toast({ title: 'Impressão Concluída', description: `Nota #${request.note_data.note_number} impressa.`, variant: 'success' });
    }, 2000);
  };
  
  const handleRemoveFromQueue = (id: string) => {
      setPrintQueue(prev => prev.filter(r => r.id !== id));
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center"><Printer className="mr-3"/> Fila de Impressão</h1>
                <p className="text-gray-500 mt-1">Gerencie os documentos pendentes para impressão.</p>
        </div>
            <div className="flex items-center gap-2">
                <div className="flex items-center space-x-2">
                    <label htmlFor="printing-station-switch" className="text-sm font-medium text-gray-700">Modo Estação</label>
                    <input type="checkbox" id="printing-station-switch" checked={isPrintingStation} onChange={(e) => setIsPrintingStation(e.target.checked)}/>
          </div>
                <Button variant="outline" asChild>
                    <Link to="/settings/printer"><Settings size={18} className="mr-2"/> Configurações</Link>
                </Button>
            </div>
        </header>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><ListChecks className="mr-2"/> Pendentes</h2>
            {isLoading && <p>Carregando...</p>}
            <div className="space-y-3">
                {printQueue.filter(r => r.status === 'pending').map(req => (
                    <div key={req.id} className="p-4 border rounded-lg flex justify-between items-center">
                        <div>
                            <p className="font-semibold">Nota Fiscal #{req.note_data.note_number}</p>
                            <p className="text-sm text-gray-600">Cliente: {req.note_data.note_data.customer.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => processPrintRequest(req)}>Imprimir</Button>
                            <Button variant="destructive" onClick={() => handleRemoveFromQueue(req.id)}><X className="h-4 w-4"/></Button>
                </div>
              </div>
                ))}
                {!isLoading && printQueue.filter(r => r.status === 'pending').length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>Nenhum item na fila de impressão.</p>
            </div>
                )}
            </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 flex items-center"><AlertTriangle className="mr-2"/> Com Erro</h2>
             <div className="text-center py-8 text-gray-500">
                <p>Nenhum item com erro.</p>
            </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrintPage;
