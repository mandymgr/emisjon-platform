import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch } from '@/store/hooks';
import { register as registerUser } from '../authSlice';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function MinimalRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await dispatch(
        registerUser({
          name: data.name,
          email: data.email,
          password: data.password,
          confirmPassword: data.confirmPassword,
          agreedToTerms: data.agreedToTerms,
        })
      ).unwrap();
      if (result) {
        navigate('/minimal-dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex transition-colors">
      {/* Left side - Kinfolk Pattern */}
      <div className="hidden lg:block lg:w-1/2 relative bg-muted">
        <div className="absolute inset-0 bg-gradient-to-bl from-muted to-muted/50">
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
              <h2 className="text-5xl font-normal tracking-tight text-foreground mb-6">
                Join the
                <br />
                Revolution
              </h2>
              <p className="text-lg font-light text-muted-foreground max-w-md mx-auto">
                Be part of the sustainable future with transparent investment opportunities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register Form */}
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
              Create account
            </h1>
            <p className="text-lg font-light text-muted-foreground">
              Start your journey with professional investments
            </p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-light text-muted-foreground mb-3 uppercase tracking-wider">
                Full name
              </label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                className="input-professional w-full"
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-2 text-sm text-destructive font-light">{errors.name.message}</p>
              )}
            </div>

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
                  autoComplete="new-password"
                  className="input-professional w-full pr-10"
                  placeholder="Min. 8 characters"
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

            <div>
              <label className="block text-sm font-light text-muted-foreground mb-3 uppercase tracking-wider">
                Confirm password
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="input-professional w-full pr-10"
                  placeholder="Repeat your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-destructive font-light">{errors.confirmPassword.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-6 py-4 text-sm font-light rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="flex items-start cursor-pointer">
                <input
                  {...register('agreedToTerms')}
                  type="checkbox"
                  className="h-4 w-4 text-primary border-border rounded focus:ring-2 focus:ring-ring mt-1"
                />
                <span className="ml-3 text-sm font-light text-muted-foreground">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:text-primary/80 transition-colors">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.agreedToTerms && (
                <p className="mt-2 text-sm text-destructive font-light">{errors.agreedToTerms.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-professional w-full py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm font-light text-muted-foreground">
              Already have an account?{' '}
              <Link
                to="/minimal-login"
                className="text-primary hover:text-primary/80 transition-colors font-medium uppercase tracking-wider"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}