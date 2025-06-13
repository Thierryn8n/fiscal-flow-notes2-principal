import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data: AuthResponse['data'] | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
  forceRefreshAuthContext: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Função melhorada para buscar e atualizar sessão
  const fetchSession = async () => {
    try {
      console.log("AuthContext: Buscando sessão atual...");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("AuthContext: Erro ao buscar sessão:", error.message);
        return false;
      }
      
      if (data?.session) {
        console.log("AuthContext: Sessão encontrada:", data.session.user.id);
        setSession(data.session);
        setUser(data.session.user);
        return true;
      } else {
        console.log("AuthContext: Nenhuma sessão ativa encontrada");
        setSession(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Exceção ao buscar sessão:", error);
      return false;
    }
  };

  // Nova função para forçar atualização do contexto de autenticação
  const forceRefreshAuthContext = async (): Promise<boolean> => {
    console.log("AuthContext: Forçando atualização do contexto de autenticação");
    setLoading(true);
    const success = await fetchSession();
    setLoading(false);
    
    if (success) {
      toast({
        title: "Autenticação atualizada",
        description: "Contexto de autenticação atualizado com sucesso.",
        variant: "default"
      });
    } else {
      toast({
        title: "Falha na autenticação",
        description: "Não foi possível obter suas informações de autenticação.",
        variant: "destructive"
      });
    }
    
    return success;
  };

  // Função para renovar sessão expirada
  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log("AuthContext: Tentando renovar sessão...");
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error("AuthContext: Erro ao renovar sessão:", error.message);
        
        toast({
          title: "Sessão expirada",
          description: "Por favor, faça login novamente.",
          variant: "destructive"
        });
        return false;
      }
      
      if (data?.session) {
        console.log("AuthContext: Sessão renovada com sucesso");
        setSession(data.session);
        setUser(data.session.user);
        return true;
      } else {
        console.log("AuthContext: Não foi possível renovar a sessão");
        setSession(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error("AuthContext: Exceção ao renovar sessão:", error);
      return false;
    }
  };

  useEffect(() => {
    // Inicialização do contexto - busca sessão inicial
    console.log("AuthContext: Inicializando contexto de autenticação");
    
    (async () => {
      setLoading(true);
      await fetchSession();
      setLoading(false);
    })();

    // Configura ouvinte para mudanças de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log("AuthContext: Evento de autenticação detectado:", event);
      
      if (currentSession) {
        console.log("AuthContext: Nova sessão recebida no evento");
        setSession(currentSession);
        setUser(currentSession.user);
      } else if (event === 'SIGNED_OUT') {
        console.log("AuthContext: Usuário desconectado");
        setSession(null);
        setUser(null);
        navigate('/login');
    }
    });

    // Verificar periodicamente a sessão a cada 5 minutos 
    const sessionCheckInterval = setInterval(async () => {
      console.log("AuthContext: Verificando validade da sessão (intervalo)");
      const { data } = await supabase.auth.getSession();
      if (!data.session && session) {
        console.log("AuthContext: Sessão expirada detectada, tentando renovar");
        await refreshSession();
      }
    }, 5 * 60 * 1000);  // 5 minutos

    // Limpeza
    return () => {
      authListener.subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, []);

  // Função de login com recuperação automática em caso de falha
  const signIn = async (email: string, password: string): Promise<{ error: AuthError | null }> => {
    try {
      console.log("AuthContext: Tentando login para:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("AuthContext: Erro de login:", error.message);
        return { error };
      }

      console.log("AuthContext: Login bem-sucedido");
      
      // Buscar sessão após login para garantir que tudo está atualizado
      setSession(data.session);
      setUser(data.session?.user || null);
      
      return { error: null };
      
    } catch (error) {
      console.error("AuthContext: Exceção durante login:", error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error: AuthError | null; data: AuthResponse['data'] | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      return { data, error };
    } catch (error) {
      return { data: null, error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log("AuthContext: Iniciando logout");
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthContext: Erro durante logout:", error.message);
      } else {
        console.log("AuthContext: Logout bem-sucedido");
      }
      
      // Atualizar estado local imediatamente
      setUser(null);
      setSession(null);
      
      // Redirecionar para login sempre, independentemente do resultado
      navigate('/login');
      
      } catch (error) {
      console.error("AuthContext: Exceção durante logout:", error);
      // Mesmo em caso de exceção, forçamos limpeza e redirecionamento
      setUser(null);
      setSession(null);
      navigate('/login');
      }
    };

  const value = {
      user, 
      session, 
      loading, 
    signIn,
    signUp,
    signOut,
      refreshSession,
    forceRefreshAuthContext
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};