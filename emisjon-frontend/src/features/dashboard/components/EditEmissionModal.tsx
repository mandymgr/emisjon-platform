import React, { useState } from 'react';
import { FiX, FiUpload, FiFile } from 'react-icons/fi';
import * as emissionsService from '../services/emissionsService';
import type { Emission, UpdateEmissionData } from '@/types/emission';
import RichTextEditor from '@/components/RichTextEditor';

interface EditEmissionModalProps {
  emission: Emission;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEmissionModal({ emission, onClose, onSuccess }: EditEmissionModalProps) {
  const [formData, setFormData] = useState<UpdateEmissionData>({
    title: emission.title,
    description: emission.description,
    sharesBefore: emission.sharesBefore,
    newSharesOffered: emission.newSharesOffered,
    pricePerShare: emission.pricePerShare,
    startDate: new Date(emission.startDate).toISOString().slice(0, 10),
    endDate: new Date(emission.endDate).toISOString().slice(0, 10),
    status: emission.status
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScheduleField, setShowScheduleField] = useState(false);
  const [scheduledPublishDate, setScheduledPublishDate] = useState('');
  const [presentationFile, setPresentationFile] = useState<File | null>(null);

  // Get current date in format required for date input
  const getCurrentDate = () => {
    const now = new Date();
    return now.toISOString().slice(0, 10);
  };

  const minDate = getCurrentDate();

  // Get the day after a given date for minimum end date
  const getNextDay = (dateString: string | undefined) => {
    if (!dateString) return minDate;
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toISOString().slice(0, 10);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'sharesBefore' || name === 'newSharesOffered' || name === 'pricePerShare' 
        ? parseFloat(value) || 0 
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are allowed');
        return;
      }
      // Validate file size (50MB = 50 * 1024 * 1024 bytes)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      setPresentationFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent, saveOption: 'draft' | 'publish' | 'schedule') => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Determine status based on save option
      let status = formData.status;
      if (saveOption === 'publish') {
        status = 'ACTIVE';
      } else if (saveOption === 'draft') {
        status = 'PREVIEW';
      } else if (saveOption === 'schedule' && scheduledPublishDate) {
        // For scheduled publication, save as PREVIEW with metadata
        status = 'PREVIEW';
      }

      // Ensure proper data types and formats
      const dataToSend: any = {
        title: formData.title,
        description: formData.description,
        sharesBefore: formData.sharesBefore !== undefined ? parseInt(formData.sharesBefore.toString()) : undefined,
        newSharesOffered: formData.newSharesOffered !== undefined ? parseInt(formData.newSharesOffered.toString()) : undefined,
        pricePerShare: formData.pricePerShare !== undefined ? parseFloat(formData.pricePerShare.toString()) : undefined,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        status: status
      };
      
      // Add scheduled publish date if scheduling
      if (saveOption === 'schedule' && scheduledPublishDate) {
        dataToSend.scheduledPublishDate = new Date(scheduledPublishDate).toISOString();
      }
      
      // Remove undefined values
      Object.keys(dataToSend).forEach(key => {
        if (dataToSend[key as keyof typeof dataToSend] === undefined) {
          delete dataToSend[key as keyof typeof dataToSend];
        }
      });
      
      await emissionsService.updateEmission(emission.id, dataToSend);
      onSuccess();
    } catch (err: any) {
      console.error('Error updating emission:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to update emission');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-card-foreground">Edit Emission</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-card-foreground cursor-pointer"
          >
            <FiX size={24} />
          </button>
        </div>

        <form className="p-6 space-y-4">
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <RichTextEditor
                value={formData.description || ''}
                onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                placeholder="Enter emission description..."
                minHeight="120px"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Presentation File (PDF only, max 50MB)
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="edit-presentation-file-upload"
                />
                <label
                  htmlFor="edit-presentation-file-upload"
                  className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary transition-colors"
                >
                  {presentationFile ? (
                    <div className="flex items-center space-x-2">
                      <FiFile className="text-primary" size={20} />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {presentationFile.name} ({(presentationFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <FiUpload className="text-gray-400" size={20} />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {emission.presentationFileUrl ? 'Upload new PDF to replace existing' : 'Click to upload PDF file'}
                      </span>
                    </div>
                  )}
                </label>
                {presentationFile && (
                  <button
                    type="button"
                    onClick={() => setPresentationFile(null)}
                    className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              {emission.presentationFileUrl && !presentationFile && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Current file: <a href={emission.presentationFileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View PDF</a>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Shares Before
              </label>
              <input
                type="number"
                name="sharesBefore"
                value={formData.sharesBefore}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                required
                disabled={emission.status !== 'PREVIEW'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                New Shares Offered
              </label>
              <input
                type="number"
                name="newSharesOffered"
                value={formData.newSharesOffered}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                min="1"
                required
                disabled={emission.status !== 'PREVIEW'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price per Share (NOK)
              </label>
              <input
                type="number"
                name="pricePerShare"
                value={formData.pricePerShare}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                min="0.01"
                step="0.01"
                required
                disabled={emission.status !== 'PREVIEW'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Shares After
              </label>
              <input
                type="number"
                value={(formData.sharesBefore || 0) + (formData.newSharesOffered || 0)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                min={emission.status === 'PREVIEW' ? minDate : undefined}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={emission.status === 'COMPLETED'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                min={getNextDay(formData.startDate)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
                disabled={emission.status === 'COMPLETED'}
              />
            </div>

            {showScheduleField && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Schedule Publication Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={scheduledPublishDate}
                  onChange={(e) => setScheduledPublishDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required={showScheduleField}
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-input bg-background text-foreground rounded-md hover:bg-muted"
            >
              Cancel
            </button>
            
            <div className="flex space-x-2">
              {emission.status === 'PREVIEW' && (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e as any, 'draft')}
                    disabled={loading}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save as Draft'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleField(!showScheduleField);
                      if (showScheduleField) setScheduledPublishDate('');
                    }}
                    className="px-4 py-2 border border-blue-500 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    {showScheduleField ? 'Cancel Schedule' : 'Schedule'}
                  </button>
                  
                  {showScheduleField ? (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e as any, 'schedule')}
                      disabled={loading || !scheduledPublishDate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {loading ? 'Scheduling...' : 'Schedule Publication'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e as any, 'publish')}
                      disabled={loading}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 border border-transparent dark:border-white/30"
                    >
                      {loading ? 'Publishing...' : 'Save & Publish'}
                    </button>
                  )}
                </>
              )}
              
              {(emission.status === 'ACTIVE' || emission.status === 'COMPLETED') && (
                <button
                  type="button"
                  onClick={(e) => handleSubmit(e as any, 'draft')}
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 border border-transparent dark:border-white/30"
                >
                  {loading ? 'Updating...' : 'Update Emission'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}