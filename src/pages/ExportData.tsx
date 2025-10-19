import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import logo from '../assets/gnaasug.png';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';
import AdminProfileDropdown from '../components/AdminProfileDropdown';
import { notificationService } from '../services/notificationService';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface ExportFilters {
  hall?: string;
  level?: string;
  gender?: string;
  role?: string;
  status?: string;
  programDuration?: string;
  admissionYear?: string;
}

interface FilterOptions {
  halls: string[];
  levels: string[];
  genders: string[];
  roles: string[];
  statuses: string[];
  programDurations: string[];
  admissionYears: string[];
}

export default function ExportData() {
  const { token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [exportBy, setExportBy] = useState('all');
  const [exportFormat, setExportFormat] = useState('excel');
  const [filters, setFilters] = useState<ExportFilters>({});
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    halls: [],
    levels: [],
    genders: [],
    roles: [],
    statuses: [],
    programDurations: [],
    admissionYears: []
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
  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      setLoadingFilters(true);
      const response = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const students = await response.json();
        
        const halls = [...new Set(students.map((s: any) => s.hall).filter(Boolean))].sort();
        const levels = [...new Set(students.map((s: any) => s.level).filter(Boolean))].sort();
        const genders = [...new Set(students.map((s: any) => s.gender).filter(Boolean))].sort();
        const roles = [...new Set(students.map((s: any) => s.role).filter(Boolean))].sort();
        const statuses = [...new Set(students.map((s: any) => s.status).filter(Boolean))].sort();
        const programDurations = [...new Set(students.map((s: any) => s.programDurationYears).filter(Boolean))].sort();
        const admissionYears = [...new Set(students.map((s: any) => {
          if (s.dateOfAdmission) {
            return new Date(s.dateOfAdmission).getFullYear().toString();
          }
          return null;
        }).filter(Boolean))].sort();

        setFilterOptions({
          halls,
          levels,
          genders,
          roles,
          statuses,
          programDurations,
          admissionYears
        });
      }
    } catch (error) {
      console.error('Error fetching filter options:', error);
      toast.error('Failed to load filter options');
    } finally {
      setLoadingFilters(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFilterOptions();
    }
  }, [token]);

  const handleFilterChange = (key: keyof ExportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearAllFilters = () => {
    setFilters({});
    setDateRange({ startDate: '', endDate: '' });
    setPreviewCount(null);
  };

  // Fetch preview count when filters change
  const fetchPreviewCount = async () => {
    if (exportBy === 'all') {
      setPreviewCount(null);
      return;
    }

    try {
      setLoadingPreview(true);
      const response = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const students = await response.json();
        
        // Apply the same filtering logic as the export
        let filteredStudents = students;
        
        if (filters.hall) filteredStudents = filteredStudents.filter((s: any) => s.hall === filters.hall);
        if (filters.level) filteredStudents = filteredStudents.filter((s: any) => s.level === filters.level);
        if (filters.gender) filteredStudents = filteredStudents.filter((s: any) => s.gender === filters.gender);
        if (filters.role) filteredStudents = filteredStudents.filter((s: any) => s.role === filters.role);
        if (filters.status) filteredStudents = filteredStudents.filter((s: any) => s.status === filters.status);
        if (filters.programDuration) filteredStudents = filteredStudents.filter((s: any) => s.programDurationYears === parseInt(filters.programDuration!));
        if (filters.admissionYear) {
          const year = parseInt(filters.admissionYear);
          filteredStudents = filteredStudents.filter((s: any) => {
            if (s.dateOfAdmission) {
              return new Date(s.dateOfAdmission).getFullYear() === year;
            }
            return false;
          });
        }
        
        // Apply date range filter
        if (dateRange.startDate && dateRange.endDate) {
          filteredStudents = filteredStudents.filter((s: any) => {
            if (s.dateOfAdmission) {
              const admissionDate = new Date(s.dateOfAdmission);
              const startDate = new Date(dateRange.startDate);
              const endDate = new Date(dateRange.endDate);
              return admissionDate >= startDate && admissionDate <= endDate;
            }
            return false;
          });
        }
        
        setPreviewCount(filteredStudents.length);
      }
    } catch (error) {
      console.error('Error fetching preview count:', error);
    } finally {
      setLoadingPreview(false);
    }
  };

  // Update preview count when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchPreviewCount();
    }, 500); // Debounce the API call

    return () => clearTimeout(timeoutId);
  }, [filters, dateRange, exportBy, token]);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      const exportData = {
        format: exportFormat,
        filters: exportBy === 'all' ? {} : filters,
        dateRange: dateRange.startDate && dateRange.endDate ? dateRange : undefined,
        includeOptions: {
          personalInfo: includePersonalInfo,
          contactInfo: includeContactInfo,
          attendance: includeAttendance
        }
      };

      const response = await fetch(`${API}/export/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(exportData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `students-export.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        notificationService.dataExported(exportFormat.toUpperCase(), 1);
        toast.success(`Data exported successfully as ${exportFormat.toUpperCase()}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to export data');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting data');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveFilters = Object.values(filters).some(value => value && value !== '');
  const canExport = exportBy === 'all' || hasActiveFilters;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="sticky top-0 z-10 border-b bg-white px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <img src={logo} alt="GNAASUG" className="h-6 w-6 sm:h-8 sm:h-12 sm:w-12 object-contain"/>
            <div className="text-xs sm:text-sm font-semibold truncate">Export Data</div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationDropdown />
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <span className="text-white font-semibold text-xs sm:text-sm">
                  {useAuthStore.getState().user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </button>
              <AdminProfileDropdown 
                isOpen={profileDropdownOpen} 
                onClose={() => setProfileDropdownOpen(false)} 
              />
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6">
          {/* Header Section */}
          <div className="mb-3 sm:mb-4 md:mb-6">
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Export Data</h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Export student data in various formats with advanced filtering options</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Export Configuration */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Export Type */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Export Type</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportBy"
                      value="all"
                      checked={exportBy === 'all'}
                      onChange={(e) => setExportBy(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Export All Students</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="exportBy"
                      value="filtered"
                      checked={exportBy === 'filtered'}
                      onChange={(e) => setExportBy(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Export Filtered Students</span>
                  </label>
                </div>
              </div>

              {/* Filters Section */}
              {exportBy === 'filtered' && (
                <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900">Filters</h3>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Active Filters Summary */}
                  {hasActiveFilters && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-xs font-medium text-blue-900 mb-2">Active Filters:</h4>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(filters).map(([key, value]) => {
                          if (value && value !== '') {
                            const label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
                            return (
                              <span
                                key={key}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {label}: {value}
                                <button
                                  onClick={() => handleFilterChange(key as keyof ExportFilters, '')}
                                  className="ml-1 text-blue-600 hover:text-blue-800"
                                >
                                  ×
                                </button>
                              </span>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                  
                  {loadingFilters ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Hall</label>
                        <select
                          value={filters.hall || ''}
                          onChange={(e) => handleFilterChange('hall', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Halls</option>
                          {filterOptions.halls.map(hall => (
                            <option key={hall} value={hall}>{hall}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Level</label>
                        <select
                          value={filters.level || ''}
                          onChange={(e) => handleFilterChange('level', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Levels</option>
                          {filterOptions.levels.map(level => (
                            <option key={level} value={level}>{level}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          value={filters.gender || ''}
                          onChange={(e) => handleFilterChange('gender', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Genders</option>
                          {filterOptions.genders.map(gender => (
                            <option key={gender} value={gender}>{gender}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                        <select
                          value={filters.role || ''}
                          onChange={(e) => handleFilterChange('role', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Roles</option>
                          {filterOptions.roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filters.status || ''}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Statuses</option>
                          {filterOptions.statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Program Duration</label>
                        <select
                          value={filters.programDuration || ''}
                          onChange={(e) => handleFilterChange('programDuration', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Durations</option>
                          {filterOptions.programDurations.map(duration => (
                            <option key={duration} value={duration}>{duration} years</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Admission Year</label>
                        <select
                          value={filters.admissionYear || ''}
                          onChange={(e) => handleFilterChange('admissionYear', e.target.value)}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Years</option>
                          {filterOptions.admissionYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Date Range */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-xs sm:text-sm font-medium text-gray-900 mb-3">Date Range (Optional)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Include Options */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Include in Export</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includePersonalInfo}
                      onChange={(e) => setIncludePersonalInfo(e.target.checked)}
                      className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Personal Information (Name, Gender, Level, Hall, Program Duration, Date of Admission)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeContactInfo}
                      onChange={(e) => setIncludeContactInfo(e.target.checked)}
                      className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Contact Information (Email, Phone)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={includeAttendance}
                      onChange={(e) => setIncludeAttendance(e.target.checked)}
                      className="mr-3 text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="text-sm text-gray-700">Attendance Records</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Export Settings & Actions */}
            <div className="space-y-4 sm:space-y-6">
              {/* Export Format */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Export Format</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={exportFormat === 'excel'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Excel (.xlsx)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="csv"
                      checked={exportFormat === 'csv'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">CSV (.csv)</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === 'pdf'}
                      onChange={(e) => setExportFormat(e.target.value)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">PDF (.pdf)</span>
                  </label>
                </div>
              </div>

              {/* Export Preview */}
              {exportBy === 'filtered' && (
                <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Export Preview</h3>
                  <div className="text-center">
                    {loadingPreview ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                        <span className="text-xs text-gray-600">Counting records...</span>
                      </div>
                    ) : previewCount !== null ? (
                      <div>
                        <div className="text-lg sm:text-xl font-bold text-blue-600">{previewCount}</div>
                        <div className="text-xs text-gray-600">students will be exported</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">Select filters to see preview</div>
                    )}
                  </div>
                </div>
              )}

              {/* Export Actions */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3 sm:mb-4">Export Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleExport}
                    disabled={loading || !canExport}
                    className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-colors"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Exporting...
                      </div>
                    ) : (
                      `Export as ${exportFormat.toUpperCase()}`
                    )}
                  </button>
                  
                  {exportBy === 'filtered' && !hasActiveFilters && (
                    <p className="text-xs text-red-600 text-center">
                      Please select at least one filter to export
                    </p>
                  )}
                  
                  {exportBy === 'filtered' && hasActiveFilters && previewCount === 0 && (
                    <p className="text-xs text-orange-600 text-center">
                      No students match the selected filters
                    </p>
                  )}
                </div>
              </div>

              {/* Export Info */}
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-2 sm:p-3 md:p-4">
                <h4 className="text-xs sm:text-sm font-semibold text-blue-900 mb-2">Export Information</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Excel format includes formatting and multiple sheets</li>
                  <li>• CSV format is compatible with most spreadsheet applications</li>
                  <li>• PDF format is optimized for printing and sharing</li>
                  <li>• Large exports may take a few moments to process</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
