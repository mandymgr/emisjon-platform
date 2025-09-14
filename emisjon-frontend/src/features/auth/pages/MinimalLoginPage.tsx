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
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex transition-colors">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-12">
            <img
              src="/oblinor-logo.svg"
              alt="Oblinor"
              className="h-12 w-auto"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-10">
            <h1 className="text-5xl font-normal tracking-tight text-foreground mb-3">
              Welcome back
            </h1>
            <p className="text-lg font-light text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-muted-foreground mb-3 uppercase tracking-wider">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="input-professional w-full"
                placeholder="you@company.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-destructive font-light">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-light text-muted-foreground mb-3 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="input-professional w-full pr-10"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-destructive font-light">{errors.password.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 text-sm font-light rounded-lg">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
                />
                <span className="ml-3 text-sm font-light text-muted-foreground">
                  Remember me
                </span>
              </label>
              <a href="#" className="text-sm font-light text-primary hover:text-primary/80 transition-colors uppercase tracking-wider">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-professional w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-light text-muted-foreground">
              Don't have an account?{' '}
              <Link
                to="/minimal-register"
                className="text-primary hover:text-primary/80 transition-colors font-medium uppercase tracking-wider"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Kinfolk Pattern */}
      <div className="hidden lg:block lg:w-1/2 relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted/50">
          {/* Geometric Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 40px),
                               repeating-linear-gradient(-45deg, #000 0, #000 1px, transparent 1px, transparent 40px)`
            }} />
          </div>

          {/* Content */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center">
              <h2 className="text-5xl font-light tracking-tighter text-neutral-900 mb-6">
                Shareholder
                <br />
                Portal
              </h2>
              <p className="text-lg font-light text-neutral-600 max-w-md mx-auto">
                Access company updates, reports and shareholder documents in one place
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}