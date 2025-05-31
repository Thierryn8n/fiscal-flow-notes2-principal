import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Mail, Loader2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/ui/Logo';
import { AuthError } from '@supabase/supabase-js';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const resetSchema = z.object({
  email: z.string()
    .min(1, 'O email é obrigatório')
    .email('Digite um email válido')
});

type ResetFormValues = z.infer<typeof resetSchema>;

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ResetFormValues) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: 'Email enviado',
        description: 'Verifique sua caixa de entrada para redefinir sua senha.',
      });
    } catch (error) {
      console.error('Erro ao enviar email de recuperação:', error);
      
      let errorMessage = 'Não foi possível enviar o email de recuperação';
      
      if (error instanceof AuthError) {
        switch (error.message) {
          case 'User not found':
            errorMessage = 'Não encontramos uma conta com este email';
            break;
          case 'Email rate limit exceeded':
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
            break;
          default:
            errorMessage = error.message;
        }
      }
      
      toast({
        title: 'Erro',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="mb-8">
        <Logo />
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar Senha</CardTitle>
          <CardDescription>
            Digite seu email para receber um link de recuperação de senha.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                        disabled={isLoading || isSuccess}
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isSuccess}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Email Enviado
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Link
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button
            variant="link"
            onClick={() => navigate('/login')}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Voltar para o Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPassword; 