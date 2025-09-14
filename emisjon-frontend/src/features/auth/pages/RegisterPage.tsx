import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { register, clearError } from '../authSlice';
import AuthLayout from '../components/AuthLayout';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { registerFormSchema, type RegisterFormData } from '../schemas/authSchemas';

function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector(state => state.auth);
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema as any),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false
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

  const handleSubmit = function(data: RegisterFormData) {
    // Pass the full data - authService will handle removing confirmPassword
    dispatch(register(data));
  };

  const handleInputChange = function() {
    if (error) {
      dispatch(clearError());
    }
  };

  return (
    <AuthLayout 
      title="Create your account"
      subtitle={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-white hover:text-gray-200 underline">
            Login
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
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-base">Full Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder="Enter your full name"
                    autoComplete="name"
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
                  <Input
                    {...field}
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    onChange={(e) => {
                      field.onChange(e);
                      handleInputChange();
                    }}
                    className="bg-[#0d1117] border-gray-600 text-white placeholder:text-gray-500 focus:border-white focus:ring-white rounded-lg text-base placeholder:text-base"
                  />
                </FormControl>
                <FormDescription className="text-gray-400">
                  Password must be at least 6 characters with uppercase, lowercase, and number
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white text-base">Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
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
            name="agreedToTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="border-gray-600 data-[state=checked]:bg-white data-[state=checked]:text-black mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-relaxed">
                  <FormLabel className="text-base text-white cursor-pointer block">
                    I agree to the{' '}
                    <Link to="/terms" className="font-medium text-white hover:text-gray-200 underline inline-block">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="font-medium text-white hover:text-gray-200 underline inline-block">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                  <FormMessage className="text-red-400" />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full rounded-lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>
      </Form>
    </AuthLayout>
  );
}

export default RegisterPage;