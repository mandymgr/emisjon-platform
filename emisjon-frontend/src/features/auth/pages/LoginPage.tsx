import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, clearError } from '../authSlice';
import AuthLayout from '../components/AuthLayout';
import ErrorAlert from '@/components/ui/ErrorAlert';
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
import { loginFormSchema, type LoginFormData } from '../schemas/authSchemas';

function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema as any),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(function() {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(function() {
    return function() {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = function(data: LoginFormData) {
    dispatch(login(data));
  };

  const handleInputChange = function() {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <AuthLayout 
      title="Login"
      subtitle={
        <>
          Or{' '}
          <Link to="/register" className="font-medium text-white hover:text-gray-200 underline">
            create a new account
          </Link>
        </>
      }
    >
      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
          {error && (
            <ErrorAlert 
              message={error} 
              onClose={() => dispatch(clearError())} 
            />
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-base">Email address</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    autoComplete="email"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange();
                    }}
                    className="bg-[#0d1117] border-gray-600 text-white placeholder:text-gray-500 focus:border-white focus:ring-white rounded-lg text-base placeholder:text-base"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-base">Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      onChange={(e) => {
                        field.onChange(e);
                        handleInputChange();
                      }}
                      className="bg-[#0d1117] border-gray-600 text-white placeholder:text-gray-500 focus:border-white focus:ring-white pr-10 rounded-lg text-base placeholder:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full font-semibold text-base rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}

export default LoginPage;