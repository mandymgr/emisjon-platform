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
import { addShareholderFormSchema, type AddShareholderFormData } from './schemas/shareholderSchema';
import type { CreateShareholderDTO } from './types';

interface AddShareholderModalProps {
  isOpen: boolean;
  shareholderData: CreateShareholderDTO;
  onShareholderDataChange: (data: CreateShareholderDTO) => void;
  onAdd: (data?: CreateShareholderDTO) => void;
  onClose: () => void;
}

function AddShareholderModal({ 
  isOpen, 
  onShareholderDataChange, 
  onAdd, 
  onClose 
}: AddShareholderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<AddShareholderFormData>({
    resolver: zodResolver(addShareholderFormSchema as any),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      shares: 1,
      userId: undefined
    }
  });

  // Reset form and submission state when modal opens
  useEffect(function() {
    if (isOpen) {
      form.reset({
        name: '',
        email: '',
        phone: '',
        shares: 1,
        userId: undefined
      });
      setIsSubmitting(false);
    }
  }, [isOpen, form]);

  const handleSubmit = async function(data: AddShareholderFormData) {
    // Prevent double submission
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const shareholderData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        shares: data.shares,
        userId: data.userId
      };
      
      // Update the parent state for consistency
      onShareholderDataChange(shareholderData);
      
      // Pass the data directly to onAdd to avoid state timing issues
      await onAdd(shareholderData);
    } finally {
      setIsSubmitting(false);
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
        
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Add New Shareholder</h3>
        
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
                disabled={isSubmitting}
                className="border-2 border-white/20 hover:border-white/40"
              >
                {isSubmitting ? 'Adding...' : 'Add Shareholder'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AddShareholderModal;