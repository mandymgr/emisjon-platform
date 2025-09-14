import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '@/store/hooks';
import { login } from '../authSlice';
import { Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function MinimalLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(login(data)).unwrap();
      if (result) {
        navigate('/minimal-dashboard');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <img 
              src="/oblinor-new-logo.svg" 
              alt="Oblinor"
              className="h-10 w-auto text-teal-700"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-10">
            <h2 className="text-5xl font-serif tracking-tight text-teal-900 mb-3">
              Velkommen tilbake
            </h2>
            <p className="text-lg font-light text-gray-600">
              Logg inn på kontoen din for å fortsette
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-gray-600 mb-3 uppercase tracking-wider">
                E-postadresse
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                placeholder="deg@selskap.no"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 font-light">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-light text-gray-600 mb-3 uppercase tracking-wider">
                Passord
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                  placeholder="Skriv inn passordet ditt"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-teal-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600 font-light">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 text-sm font-light rounded-xl">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-teal-700 border-gray-300 rounded focus:ring-2 focus:ring-teal-500"
                />
                <span className="ml-3 text-sm font-light text-gray-600">
                  Husk meg
                </span>
              </label>
              <a href="#" className="text-sm font-light text-teal-700 hover:text-teal-900 transition-colors uppercase tracking-wider">
                Glemt passord?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-teal-700 hover:bg-teal-900 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Logger inn...
                </>
              ) : (
                'Logg inn'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-light text-gray-600">
              Har du ikke en konto?{' '}
              <Link
                to="/minimal-register"
                className="text-teal-700 hover:text-teal-900 transition-colors font-medium uppercase tracking-wider"
              >
                Opprett konto
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Kinfolk Pattern */}
      <div className="hidden lg:block lg:w-1/2 relative bg-gray-50">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Geometric Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, #124F62 0, #124F62 1px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(-45deg, #124F62 0, #124F62 1px, transparent 1px, transparent 40px)`
            }} />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center">
              <h2 className="text-5xl font-serif tracking-tight text-teal-900 mb-6">
                Aksjonær
                <br />
                Portal
              </h2>
              <p className="text-lg font-light text-gray-600 max-w-md mx-auto">
                Få tilgang til selskapets oppdateringer, rapporter og aksjonærdokumenter på ett sted
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}