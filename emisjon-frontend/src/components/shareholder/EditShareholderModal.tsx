import { useEffect } from 'react';
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
import { editShareholderFormSchema, type EditShareholderFormData } from './schemas/shareholderSchema';
import type { Shareholder, UpdateShareholderDTO } from './types';

interface EditShareholderModalProps {
  isOpen: boolean;
  shareholder: Shareholder | null;
  shareholderData: UpdateShareholderDTO;
  onShareholderDataChange: (data: UpdateShareholderDTO) => void;
  onSave: (data?: UpdateShareholderDTO) => void;
  onClose: () => void;
}

function EditShareholderModal({ 
  isOpen, 
  shareholder,
  onShareholderDataChange,
  onSave,
  onClose 
}: EditShareholderModalProps) {
  
  const form = useForm<EditShareholderFormData>({
    resolver: zodResolver(editShareholderFormSchema as any),
    defaultValues: {
      name: '',
      email: '',
      shares: 1
    }
  });

  // Reset form when modal opens with shareholder data
  useEffect(function() {
    if (isOpen && shareholder) {
      form.reset({
        name: shareholder.name || '',
        email: shareholder.email || '',
        shares: shareholder.shares || 1
      });
    }
  }, [isOpen, shareholder, form]);

  const handleSubmit = function(data: EditShareholderFormData) {
    if (!shareholder) return;
    
    // Update parent component's shareholderData
    const updateData: UpdateShareholderDTO = {
      name: data.name,
      email: data.email,
      shares: data.shares
    };
    
    // Update parent state and pass data directly to save
    onShareholderDataChange(updateData);
    onSave(updateData);
  };

  const handleClose = function() {
    form.reset();
    onClose();
  };

  if (!isOpen || !shareholder) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md relative shadow-2xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer"
        >
          <FiX size={20} />
        </button>
        
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Edit Shareholder</h3>
        
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
                      placeholder="Enter shareholder's full name"
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
                      placeholder="shareholder@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shares"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Number of Shares</FormLabel>
                  <FormControl>
                    <Input 
                      {...field}
                      type="number"
                      min="1"
                      value={value || ''}
                      placeholder="Enter number of shares"
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === '') {
                          onChange(0);
                        } else {
                          const num = parseInt(val, 10);
                          if (!isNaN(num)) {
                            onChange(num);
                          }
                        }
                      }}
                    />
                  </FormControl>
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

export default EditShareholderModal;