import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { notificationService } from '../services/notificationService';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface ExportFilters {
  hall?: string;
  level?: string;
  gender?: string;
  role?: string;
  status?: string;
}

interface FilterOptions {
  halls: string[];
  levels: string[];
  genders: string[];
  roles: string[];
  statuses: string[];
}

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialExportBy?: string;
  initialFormat?: string;
}

export default function ExportDataModal({ isOpen, onClose, initialExportBy, initialFormat }: ExportDataModalProps) {
  const token = useAuthStore((s) => s.token);
  const [exportBy, setExportBy] = useState(initialExportBy === 'All Students' ? 'all' : 'filtered');
  const [exportFormat, setExportFormat] = useState(initialFormat || 'excel');
  const [filters, setFilters] = useState<ExportFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    halls: [],
    levels: [],
    genders: [],
    roles: [],
    statuses: []
  });
  const [loading, setLoading] = useState(false);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [includeAttendance, setIncludeAttendance] = useState(false);
  const [includeContactInfo, setIncludeContactInfo] = useState(true);
  const [includePersonalInfo, setIncludePersonalInfo] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchFilterOptions();
    }
  }, [isOpen]);

  const fetchFilterOptions = async () => {
    try {
      setLoadingFilters(true);
      const res = await fetch(`${API}/export/filters`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setFilterOptions(data);
      } else {
        notificationService.systemError('Failed to fetch filter options');
      }
    } catch (e) {
      console.error('Failed to fetch filter options:', e);
      notificationService.systemError('Network error while fetching filter options');
    } finally {
      setLoadingFilters(false);
    }
  };

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API}/export/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          format: exportFormat,
          filters: exportBy === 'all' ? {} : filters,
          dateRange: dateRange.startDate || dateRange.endDate ? dateRange : undefined,
          includeOptions: {
            personalInfo: includePersonalInfo,
            contactInfo: includeContactInfo,
            attendance: includeAttendance
          }
        })
      });

      if (response.ok) {
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = `students_export_${new Date().toISOString().split('T')[0]}`;
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/);
          if (filenameMatch) {
            filename = filenameMatch[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        notificationService.dataExported(exportFormat.toUpperCase(), 1);
        onClose();
      } else {
        const errorData = await response.json();
        notificationService.systemError(errorData.message || 'Export failed');
      }
    } catch (e) {
      console.error('Export error:', e);
      notificationService.systemError('Network error during export');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof ExportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Export By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export By
            </label>
            <select
              value={exportBy}
              onChange={(e) => setExportBy(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Students</option>
              <option value="filtered">Filtered Students</option>
            </select>
          </div>

          {/* Export Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Export Format
            </label>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={exportFormat === 'excel'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex items-center">
                  <span className="w-4 h-4 mr-2">📊</span>
                  Excel (.xlsx)
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={exportFormat === 'pdf'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex items-center">
                  <span className="w-4 h-4 mr-2">📄</span>
                  PDF (.pdf)
                </span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-3 text-sm text-gray-700 flex items-center">
                  <span className="w-4 h-4 mr-2">📋</span>
                  CSV (.csv)
                </span>
              </label>
            </div>
          </div>

          {/* Filter Options */}
          {exportBy === 'filtered' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Filter Options
                </label>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
              
              {loadingFilters ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading filters...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {/* Hall Filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Hall</label>
                    <select
                      value={filters.hall || ''}
                      onChange={(e) => handleFilterChange('hall', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Halls</option>
                      {filterOptions.halls.map(hall => (
                        <option key={hall} value={hall}>{hall}</option>
                      ))}
                    </select>
                  </div>

                  {/* Level Filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Level</label>
                    <select
                      value={filters.level || ''}
                      onChange={(e) => handleFilterChange('level', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Levels</option>
                      {filterOptions.levels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  {/* Gender Filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Gender</label>
                    <select
                      value={filters.gender || ''}
                      onChange={(e) => handleFilterChange('gender', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Genders</option>
                      {filterOptions.genders.map(gender => (
                        <option key={gender} value={gender}>{gender}</option>
                      ))}
                    </select>
                  </div>

                  {/* Role Filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Role</label>
                    <select
                      value={filters.role || ''}
                      onChange={(e) => handleFilterChange('role', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Roles</option>
                      {filterOptions.roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select
                      value={filters.status || ''}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      {filterOptions.statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced Options</h4>
            
            {/* Date Range Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Start Date (Admission)</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">End Date (Admission)</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Include Options */}
            <div className="space-y-3">
              <h5 className="text-xs font-medium text-gray-600">Include in Export:</h5>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includePersonalInfo}
                  onChange={(e) => setIncludePersonalInfo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Personal Information (Name, Gender, Program Duration)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeContactInfo}
                  onChange={(e) => setIncludeContactInfo(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Contact Information (Phone, Email)</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={includeAttendance}
                  onChange={(e) => setIncludeAttendance(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Attendance Records (Last 30 days)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Exporting...
              </>
            ) : (
              'Export Data'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
