import { useEffect, useState } from 'react';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { editUserFormSchema, type EditUserFormData, getRoleLevelOptions } from './schemas/editUserSchema';
import type { User, UpdateUserDTO } from './types';

interface EditUserModalProps {
  isOpen: boolean;
  user: User | null;
  userData: UpdateUserDTO;
  onUserDataChange: (data: UpdateUserDTO) => void;
  onSave: (data?: UpdateUserDTO) => void;
  onClose: () => void;
}

function EditUserModal({ 
  isOpen, 
  user,
  onUserDataChange,
  onSave,
  onClose 
}: EditUserModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserFormSchema as any),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'USER',
      level: 1
    }
  });

  const watchedRole = form.watch('role');

  // Reset form when modal opens with user data
  useEffect(function() {
    if (isOpen && user) {
      // Small delay to ensure the modal is rendered before resetting
      setTimeout(() => {
        form.reset({
          name: user.name || '',
          email: user.email || '',
          password: '', // Password field starts empty for security
          role: user.role || 'USER',
          level: user.level || 1
        });
      }, 0);
    }
  }, [isOpen, user, form.reset]);

  const handleSubmit = function(data: EditUserFormData) {
    if (!user) return;
    
    // Update parent component's userData
    const updateData: UpdateUserDTO = {
      name: data.name,
      email: data.email,
      role: data.role,
      level: data.level
    };
    
    // Only include password if it was changed
    if (data.password && data.password.length > 0) {
      updateData.password = data.password;
    }
    
    // Update parent state and pass data directly to save
    onUserDataChange(updateData);
    onSave(updateData);
    setShowPassword(false);
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
    setShowPassword(false);
    onClose();
  };

  const togglePasswordVisibility = function() {
    setShowPassword(!showPassword);
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit User</h3>
        
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        {...field} 
                        type={showPassword ? "text" : "password"}
                        placeholder="Leave blank to keep current password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormDescription>
                    Only enter a new password if you want to change it
                  </FormDescription>
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
                    onValueChange={(value) => {
                      field.onChange(value);
                      handleRoleChange(value as 'USER' | 'ADMIN');
                    }}
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
                className="border-2 border-white/20 hover:border-white/40"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default EditUserModal;