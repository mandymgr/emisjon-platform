import React, { useState, useEffect } from 'react';
import { FiX, FiUpload, FiFile } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as emissionsService from '../services/emissionsService';
import * as shareholdersService from '../services/shareholdersService';
import { useNorwegianNumber } from '@/hooks/useNorwegianFormat';
import RichTextEditor from '@/components/RichTextEditor';
import { emissionFormSchema, type EmissionFormData } from '../schemas/emissionSchema';
import type { CreateEmissionData } from '@/components/emission/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

interface AddEmissionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddEmissionModal({ onClose, onSuccess }: AddEmissionModalProps) {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showScheduleField, setShowScheduleField] = useState(false);
  const [presentationFile, setPresentationFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [totalShares, setTotalShares] = useState(0);
  const { formatNumber } = useNorwegianNumber();

  const form = useForm<EmissionFormData>({
    resolver: zodResolver(emissionFormSchema as any),
    defaultValues: {
      title: '',
      description: '',
      sharesBefore: 0,
      newSharesOffered: 0,
      pricePerShare: 0,
      startDate: '',
      endDate: '',
      status: 'PREVIEW',
      scheduledPublishDate: ''
    }
  });

  const watchedNewShares = form.watch('newSharesOffered');
  const watchedStartDate = form.watch('startDate');

  // Get current date in format required for date input
  const getCurrentDate = function() {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  };

  const minDate = getCurrentDate();

  // Get the day after a given date for minimum end date
  const getNextDay = function(dateString: string) {
    if (!dateString) return minDate;
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  };

  // Fetch total shares on mount
  useEffect(function() {
    const fetchTotalShares = async function() {
      try {
        const stats = await shareholdersService.getShareholderStats();
        const shares = stats.totalShares || 0;
        setTotalShares(shares);
        form.setValue('sharesBefore', shares);
      } catch (err) {
        console.error('Failed to fetch total shares:', err);
      }
    };
    fetchTotalShares();
  }, [form]);

  const processFile = function(file: File) {
    // Validate file type
    if (file.type !== 'application/pdf') {
      setServerError('Only PDF files are allowed');
      return;
    }
    // Validate file size (50MB = 50 * 1024 * 1024 bytes)
    if (file.size > 50 * 1024 * 1024) {
      setServerError('File size must be less than 50MB');
      return;
    }
    setPresentationFile(file);
    form.setValue('presentationFile', file);
    setServerError(null);
  };

  const handleFileChange = function(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = function(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = function(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = function(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const removeFile = function() {
    setPresentationFile(null);
    form.setValue('presentationFile', undefined);
  };

  const onSubmit = async function(data: EmissionFormData) {
    setLoading(true);
    setServerError(null);

    // Get the save option from the submitter
    const saveOption = (document.activeElement as HTMLButtonElement)?.dataset?.action as 'draft' | 'publish' | 'schedule' || 'draft';

    try {
      // Determine status based on save option
      let status: 'PREVIEW' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' = 'PREVIEW';
      if (saveOption === 'publish') {
        status = 'ACTIVE';
      } else if (saveOption === 'schedule' && data.scheduledPublishDate) {
        status = 'PREVIEW';
      }

      // Prepare data for submission
      const dataToSend: CreateEmissionData = {
        title: data.title,
        description: data.description,
        sharesBefore: parseInt(data.sharesBefore.toString()),
        newSharesOffered: parseInt(data.newSharesOffered.toString()),
        pricePerShare: parseFloat(data.pricePerShare.toString()),
        startDate: data.startDate ? new Date(data.startDate).toISOString() : '',
        endDate: data.endDate ? new Date(data.endDate).toISOString() : '',
        status: status
      };

      if (presentationFile) {
        dataToSend.presentationFile = presentationFile;
      }

      if (saveOption === 'schedule' && data.scheduledPublishDate) {
        dataToSend.scheduledDate = new Date(data.scheduledPublishDate).toISOString();
      }

      await emissionsService.createEmission(dataToSend);
      onSuccess();
    } catch (err) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { error?: string; errors?: Array<{ msg: string }> } } };
        console.error('Error creating emission:', error.response?.data);
        setServerError(error.response?.data?.error || error.response?.data?.errors?.[0]?.msg || 'Failed to create emission');
      } else {
        setServerError('Failed to create emission');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Add New Emission</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            {serverError && (
              <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Enter emission description..."
                          minHeight="120px"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <Label>Presentation File (PDF only, max 50MB)</Label>
                <div 
                  className="relative mt-2"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="presentation-file-upload"
                  />
                  <label
                    htmlFor="presentation-file-upload"
                    className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 scale-[1.02]' 
                        : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {presentationFile ? (
                      <div className="flex items-center space-x-2">
                        <FiFile className="text-primary" size={20} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {presentationFile.name} ({(presentationFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <FiUpload className={`${isDragging ? 'text-primary' : 'text-gray-400'} transition-colors`} size={24} />
                        <span className={`text-sm ${isDragging ? 'text-primary font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                          {isDragging ? 'Drop PDF file here' : 'Click to upload or drag and drop PDF file'}
                        </span>
                      </div>
                    )}
                  </label>
                  {presentationFile && (
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700 z-10"
                    >
                      <FiX size={16} />
                    </button>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="sharesBefore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shares Before (Auto-calculated)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        value={formatNumber(totalShares)}
                        disabled
                        className="bg-gray-100 dark:bg-gray-800"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newSharesOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Shares Offered</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="1"
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pricePerShare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Share (NOK)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="0.01"
                        step="0.01"
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <Label>Total Shares After</Label>
                <Input
                  value={formatNumber(totalShares + (watchedNewShares || 0))}
                  disabled
                  className="bg-gray-100 dark:bg-gray-600 mt-2"
                />
              </div>

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                        min={minDate}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="date"
                        min={getNextDay(watchedStartDate)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {showScheduleField && (
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="scheduledPublishDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Schedule Publication Date & Time</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="datetime-local"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  variant="outline"
                  disabled={loading}
                  data-action="draft"
                >
                  {loading ? 'Saving...' : 'Save as Draft'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={function() {
                    setShowScheduleField(!showScheduleField);
                    if (showScheduleField) {
                      form.setValue('scheduledPublishDate', '');
                    }
                  }}
                  className="border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {showScheduleField ? 'Cancel Schedule' : 'Schedule'}
                </Button>
                
                {showScheduleField ? (
                  <Button
                    type="submit"
                    disabled={loading || !form.watch('scheduledPublishDate')}
                    className="bg-blue-600 hover:bg-blue-700"
                    data-action="schedule"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Publication'}
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    data-action="publish"
                  >
                    {loading ? 'Publishing...' : 'Save & Publish'}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default AddEmissionModal;