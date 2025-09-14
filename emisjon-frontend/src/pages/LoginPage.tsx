import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useZodForm } from '@/hooks/useZodForm';
import { loginSchema, type LoginFormData } from '@/validators/auth';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
} from '@/components/ui/oblinor-form';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { cn } from '@/components/ui/primitive';

interface LoginPageProps {
  onLogin: (data: LoginFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function LoginPage({
  onLogin,
  isLoading = false,
  error,
  className = "",
}: LoginPageProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      await onLogin(data);
      navigate('/dashboard');
    } catch (error) {
      // Error handling is done by parent component
      console.error('Login error:', error);
    }
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-b from-white to-[#F7F7F5] dark:from-[#0C3C4A] dark:to-[#124F62] flex items-center justify-center px-4",
      className
    )}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl font-normal tracking-wide text-[#124F62] dark:text-white mb-3"
            style={{ fontFamily: '"EB Garamond", serif' }}
          >
            OBLINOR
          </h1>
          <div className="w-12 h-px bg-[#124F62] dark:bg-white/30 mx-auto mb-6" />
          <h2 className="text-2xl font-light text-[#0E1A1C] dark:text-white/90 mb-2">
            Logg inn
          </h2>
          <p className="text-sm font-light text-black/60 dark:text-white/60">
            Eller{' '}
            <Link
              to="/register"
              className="text-[#124F62] dark:text-[#278899] hover:underline font-normal"
            >
              opprett ny konto
            </Link>
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 dark:bg-white/5 backdrop-blur-sm border border-[#E6E6E0] dark:border-white/10 rounded-lg p-8 shadow-lg">
          {/* Global Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg"
            >
              <p className="text-sm font-light text-red-700 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-postadresse</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="din@epost.no"
                        disabled={isLoading}
                        className="input-professional"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passord</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Skriv inn passordet ditt"
                          disabled={isLoading}
                          className="input-professional pr-12"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(prev => !prev)}
                          disabled={isLoading}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 dark:text-white/40 hover:text-[#124F62] dark:hover:text-[#278899] transition-colors"
                          aria-label={showPassword ? "Skjul passord" : "Vis passord"}
                        >
                          {showPassword ? (
                            <EyeOffIcon size={18} />
                          ) : (
                            <EyeIcon size={18} />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm font-light text-[#124F62] dark:text-[#278899] hover:underline"
                >
                  Glemt passord?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-professional w-full min-h-[48px]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Logger inn...</span>
                  </div>
                ) : (
                  'Logg inn'
                )}
              </Button>
            </form>
          </Form>

          {/* Additional Links */}
          <div className="mt-8 pt-6 border-t border-[#E6E6E0] dark:border-white/10 text-center">
            <p className="text-sm font-light text-black/60 dark:text-white/60">
              Har du ikke konto?{' '}
              <Link
                to="/register"
                className="text-[#124F62] dark:text-[#278899] hover:underline font-normal"
              >
                Registrer deg her
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-xs font-light text-black/40 dark:text-white/40">
            © {new Date().getFullYear()} Oblinor AS. Alle rettigheter forbeholdt.
          </p>
        </div>
      </div>

      {/* Background Decorative Element */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-[#124F62]/5 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-[#278899]/5 dark:bg-white/3 rounded-full blur-3xl" />
      </div>
    </div>
  );
}