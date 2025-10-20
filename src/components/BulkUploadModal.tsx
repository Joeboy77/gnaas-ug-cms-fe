import React, { useState, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notificationService';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface BulkUploadResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  actionId?: string;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  createdStudents: Array<{
    id: string;
    code: string;
    fullName: string;
  }>;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkUploadModal({ isOpen, onClose, onSuccess }: BulkUploadModalProps) {
  const { token } = useAuthStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [undoing, setUndoing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (selectedFile: File) => {
    // Validate file type
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const allowedExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = selectedFile.name.toLowerCase().substring(selectedFile.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(selectedFile.type) && !allowedExtensions.includes(fileExtension)) {
      toast.error('Please select a CSV or Excel file (.csv, .xls, .xlsx)');
      return;
    }

    // Validate file size (10MB limit)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setResult(null);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !token) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API}/bulk-upload/students`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        
        if (data.success) {
          toast.success(`Successfully uploaded ${data.successfulRows} students`);
          notificationService.custom('success', 'Bulk Upload Complete', 
            `Successfully uploaded ${data.successfulRows} out of ${data.totalRows} students`);
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast.error('Upload completed with errors');
        }
      } else {
        toast.error(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/bulk-upload/template`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'students_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Template downloaded successfully');
      } else {
        toast.error('Failed to download template');
      }
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  const handleUndo = async () => {
    if (!result?.actionId || !token) return;

    setUndoing(true);
    try {
      const response = await fetch(`${API}/bulk-upload/students/undo/${result.actionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully undone bulk upload. ${data.undone} students removed.`);
        notificationService.custom('success', 'Bulk Upload Undone', 
          `Successfully removed ${data.undone} students from the previous upload`);
        
        if (onSuccess) {
          onSuccess();
        }
        
        // Clear the result to hide undo button
        setResult(null);
      } else {
        toast.error(data.message || 'Failed to undo bulk upload');
      }
    } catch (error) {
      console.error('Undo error:', error);
      toast.error('Failed to undo bulk upload');
    } finally {
      setUndoing(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setUploading(false);
    setUndoing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Bulk Upload Students</h2>
          <button
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {!result ? (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <h3 className="text-base font-medium text-gray-900 mb-3">Upload Instructions</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• Download the template file to see the required format</li>
                    <li>• Fill in the student information following the template</li>
                    <li>• Required fields: Full Name, Gender, Academic Level, Hall/Hostel</li>
                    <li>• Academic Level supports: "Level 100", "level 100", "L100", "100", etc.</li>
                    <li>• Optional fields: Date of Admission (defaults to current date), Profile Image URL, Program of Study, Guardian Info, Church Info, etc.</li>
                    <li>• Supported formats: CSV (.csv), Excel (.xls, .xlsx)</li>
                    <li>• Maximum file size: 10MB</li>
                  </ul>
                </div>
              </div>

              {/* Template Download */}
              <div className="mb-6">
                <button
                  onClick={handleDownloadTemplate}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Template
                </button>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-blue-400 bg-blue-50' 
                    : file 
                      ? 'border-green-400 bg-green-50' 
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                
                {file ? (
                  <div>
                    <div className="text-green-600 text-4xl mb-4">✓</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">File Selected</h3>
                    <p className="text-sm text-gray-600 mb-4">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-gray-400 text-4xl mb-4">📁</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Student Data</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Drag and drop your file here, or click to browse
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Choose File
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              {file && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setFile(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Clear File
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Students'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Results */
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Results</h3>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{result.totalRows}</div>
                  <div className="text-sm text-blue-800">Total Rows</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">{result.successfulRows}</div>
                  <div className="text-sm text-green-800">Successful</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">{result.failedRows}</div>
                  <div className="text-sm text-red-800">Failed</div>
                </div>
              </div>

              {/* Created Students */}
              {result.createdStudents.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-900 mb-3">Successfully Created Students</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <div className="space-y-2">
                      {result.createdStudents.map((student, index) => (
                        <div key={index} className="text-sm text-green-800">
                          {student.code} - {student.fullName}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-base font-medium text-gray-900 mb-3">Errors ({result.errors.length})</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                    <div className="space-y-3">
                      {result.errors.map((error, index) => (
                        <div key={index} className="text-sm">
                          <div className="font-medium text-red-800">Row {error.row}:</div>
                          <div className="text-red-700">{error.error}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Close
                </button>
                {result.actionId && (
                  <button
                    onClick={handleUndo}
                    disabled={undoing}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {undoing ? 'Undoing...' : 'Undo Upload'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setFile(null);
                    setResult(null);
                  }}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload Another File
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
