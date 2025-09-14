import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { userFormSchema, type UserFormData, getRoleLevelOptions } from './schemas/userSchema';
import type { CreateUserDTO } from './types';

interface AddUserModalProps {
  isOpen: boolean;
  userData: CreateUserDTO;
  onUserDataChange: (data: CreateUserDTO) => void;
  onAdd: (data?: CreateUserDTO) => void;
  onClose: () => void;
}

function AddUserModal({ 
  isOpen, 
  onUserDataChange, 
  onAdd, 
  onClose 
}: AddUserModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema as any),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'USER',
      level: 1
    }
  });

  const watchedRole = form.watch('role');

  // Reset form and submission state when modal opens
  useEffect(function() {
    if (isOpen) {
      form.reset({
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'USER',
        level: 1
      });
      setIsSubmitting(false);
    }
  }, [isOpen, form]);

  const handleSubmit = async function(data: UserFormData) {
    // Prevent double submission
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const userData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        level: data.level
      };
      
      // Update the parent state for consistency
      onUserDataChange(userData);
      
      // Pass the data directly to onAdd to avoid state timing issues
      await onAdd(userData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = function(value: 'USER' | 'ADMIN') {
    const currentLevel = form.getValues('level');
    const maxLevel = value === 'ADMIN' ? 2 : 3;
    
    form.setValue('role', value);
    
    // Adjust level if it exceeds the new role's maximum
    if (currentLevel > maxLevel) {
      form.setValue('level', maxLevel);
    }
  };

  const handleClose = function() {
    form.reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add New User</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter user's full name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      placeholder="user@example.com"
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
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="password"
                      placeholder="Enter a strong password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select 
                    onValueChange={handleRoleChange} 
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="USER">User</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                    defaultValue={field.value?.toString()}
                    value={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getRoleLevelOptions(watchedRole).map((level) => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="border-2 border-white/20 hover:border-white/40"
              >
                {isSubmitting ? 'Adding...' : 'Add User'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AddUserModal;