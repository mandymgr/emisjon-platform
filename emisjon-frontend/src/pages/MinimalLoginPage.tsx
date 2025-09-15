import * as React from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
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
import { login, clearError } from '@/store/slices/authSlice';
import type { RootState } from '@/store';

// Login Form Component
function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const [showPassword, setShowPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(false);

  const form = useZodForm(loginSchema, {
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (data: LoginFormData) => {
    try {
      const resultAction = await dispatch(login({
        ...data,
        rememberMe
      }));

      if (login.fulfilled.match(resultAction)) {
        navigate('/minimal-dashboard');
      }
    } catch (error) {
      // Error will be handled by Redux and shown in the form
      console.error('Login error:', error);
    }
  };

  // Clear errors on unmount
  React.useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Clear error when user starts typing
  const clearErrorOnChange = () => {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <div className="w-full max-w-md space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1
          className="text-5xl font-normal tracking-tight text-[#124F62] dark:text-white"
          style={{ fontFamily: '"EB Garamond", serif' }}
        >
          Welcome back
        </h1>
        <p className="text-sm font-light text-black/60 dark:text-white/60">
          Or{' '}
          <Link
            to="/create-account"
            className="text-[#124F62] dark:text-[#278899] hover:underline font-normal"
          >
            create a new account
          </Link>
        </p>
      </div>

      {/* Global Error Alert */}
      {error && (
        <div
          role="alert"
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-lg"
        >
          <p className="text-sm font-light text-red-700 dark:text-red-400">
            {error}
          </p>
        </div>
      )}

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="you@company.com"
                    disabled={isLoading}
                    className="input-professional"
                    autoComplete="email"
                    onChange={(e) => {
                      field.onChange(e);
                      clearErrorOnChange();
                    }}
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className="input-professional pr-12"
                      autoComplete="current-password"
                      onChange={(e) => {
                        field.onChange(e);
                        clearErrorOnChange();
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      disabled={isLoading}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-black/40 dark:text-white/40 hover:text-[#124F62] dark:hover:text-[#278899] transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 text-[#124F62] focus:ring-[#124F62]/30 border-[#E6E6E0] dark:border-white/20 rounded"
              />
              <label
                htmlFor="remember-me"
                className="text-sm font-light text-black/70 dark:text-white/70"
              >
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm font-light text-[#124F62] dark:text-[#278899] hover:underline"
            >
              Forgot password?
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
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </Form>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm font-light text-black/60 dark:text-white/60">
          Don't have an account?{' '}
          <Link
            to="/create-account"
            className="text-[#124F62] dark:text-[#278899] hover:underline font-normal"
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}

// Hero/Branding Panel Component
function LoginHero() {
  return (
    <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-20">
      <div className="space-y-12">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src="/oblinor-logo.svg"
            alt="Oblinor"
            className="h-12 w-auto"
            onError={(e) => {
              // Fallback if logo doesn't exist
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Editorial Content */}
        <div className="text-center space-y-8">
          <h2
            className="text-4xl font-normal tracking-tight text-[#124F62] dark:text-white"
            style={{ fontFamily: '"EB Garamond", serif' }}
          >
            Shareholder Portal
          </h2>

          <p className="text-xl font-light text-black/70 dark:text-white/70 leading-relaxed">
            Access company updates, reports and shareholder documents in one place
          </p>

          <div className="w-16 h-px bg-[#124F62] dark:bg-white/30 mx-auto" aria-hidden="true" />

          <div className="space-y-4 text-center">
            <p className="text-sm font-light text-black/60 dark:text-white/60 uppercase tracking-wider">
              Trusted by
            </p>
            <div className="text-2xl font-light text-[#124F62] dark:text-white tabular-nums">
              1,250+ shareholders
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Login Page Component
export default function MinimalLoginPage() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/minimal-dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Don't render if already authenticated (prevents flash)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F7F7F5] dark:from-[#0C3C4A] dark:to-[#124F62]">
      <div className="flex min-h-screen">
        {/* Left Panel - Login Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <LoginForm />
          </div>
        </div>

        {/* Right Panel - Hero/Branding */}
        <LoginHero />
      </div>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 -right-64 w-96 h-96 bg-[#124F62]/5 dark:bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-64 w-96 h-96 bg-[#278899]/5 dark:bg-white/3 rounded-full blur-3xl" />
      </div>

      {/* Accessibility: Skip to main content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded focus:shadow-lg"
      >
        Skip to main content
      </a>
    </div>
  );
}