import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthError } from '@supabase/supabase-js';

type AuthMode = 'login' | 'register';

const authSchema = z.object({
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Digite um email válido'),
  password: z.string()
    .min(6, 'A senha deve ter pelo menos 6 caracteres')
    .max(72, 'A senha não pode ter mais de 72 caracteres'),
  fullName: z.string()
    .min(1, 'O nome completo é obrigatório')
    .max(255, 'O nome não pode ter mais de 255 caracteres')
    .optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  const toggleMode = () => {
    form.reset();
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const onSubmit = async (values: AuthFormValues) => {
    setIsLoading(true);
    
    try {
      if (mode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName || '',
            },
          },
        });

        if (error) throw error;

        if (data.user?.identities?.length === 0) {
          toast({
            title: 'Email já cadastrado',
            description: 'Este email já está sendo usado. Por favor, faça login.',
            variant: 'destructive',
          });
          setMode('login');
          return;
        }

        toast({
          title: 'Cadastro realizado com sucesso!',
          description: 'Você já pode fazer login no sistema.',
        });
        
        setMode('login');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;

        if (data.user) {
          localStorage.setItem('default_user_id', data.user.id);
          
          toast({
            title: 'Login efetuado com sucesso!',
            description: 'Bem-vindo ao Fiscal Flow Notes.',
          });
          
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erro na autenticação:', error);
      
      let errorMessage = 'Ocorreu um erro ao processar sua solicitação';
      
      if (error instanceof AuthError) {
        switch (error.message) {
          case 'Invalid login credentials':
            errorMessage = 'Email ou senha incorretos';
            break;
          case 'Email not confirmed':
            errorMessage = 'Por favor, confirme seu email antes de fazer login';
            break;
          case 'Password should be at least 6 characters':
            errorMessage = 'A senha deve ter pelo menos 6 caracteres';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      toast({
        title: mode === 'login' ? 'Erro no login' : 'Erro no cadastro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {mode === 'register' && (
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nome completo" 
                      {...field} 
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="email@empresa.com" 
                    {...field}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-black hover:bg-gray-800 text-white"
            disabled={isLoading}
          >
            {isLoading 
              ? 'Carregando...' 
              : mode === 'login' ? 'Entrar' : 'Cadastrar'
            }
          </Button>
        </form>
      </Form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-fiscal-gray-500">
          {mode === 'login' 
            ? 'Não tem uma conta?' 
            : 'Já possui uma conta?'
          }
          <button
            onClick={toggleMode}
            className="ml-2 text-fiscal-green-600 hover:text-fiscal-green-800 font-medium"
          >
            {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
