import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import logo from '../assets/gnaasug.png';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';
import AdminProfileDropdown from '../components/AdminProfileDropdown';
import { notificationService } from '../services/notificationService';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface LevelInfo {
  level: string;
  count: number;
  label: string;
  hasStudents: boolean;
}

interface PromotionTarget {
  level: string;
  label: string;
  isAlumni: boolean;
}

interface AlumniCandidate {
  id: string;
  fullName: string;
  studentId: string;
  level: string;
  programDurationYears: number;
  dateOfAdmission: string;
  hall: string;
}

export default function ManageLevels() {
  const { token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<LevelInfo[]>([]);
  const [validTargets, setValidTargets] = useState<PromotionTarget[]>([]);
  const [alumniCandidates, setAlumniCandidates] = useState<AlumniCandidate[]>([]);
  const [alumniEligibleCount, setAlumniEligibleCount] = useState(0);
  
  // Promotion states
  const [promotionFrom, setPromotionFrom] = useState('');
  const [promotionTo, setPromotionTo] = useState('');
  const [promotionLoading, setPromotionLoading] = useState(false);
  
  // Alumni management states
  const [alumniLoading, setAlumniLoading] = useState(false);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  
  // Loading states
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingAlumni, setLoadingAlumni] = useState(false);

  // Fetch available levels
  const fetchAvailableLevels = async () => {
    try {
      setLoadingLevels(true);
      const response = await fetch(`${API}/admin/available-levels`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const levels = await response.json();
        setAvailableLevels(levels);
      } else {
        toast.error('Failed to load levels');
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast.error('Error loading levels');
    } finally {
      setLoadingLevels(false);
    }
  };

  // Fetch valid promotion targets
  const fetchValidTargets = async (fromLevel: string) => {
    if (!fromLevel) {
      setValidTargets([]);
      return;
    }

    try {
      const response = await fetch(`${API}/admin/valid-promotion-targets?fromLevel=${fromLevel}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const targets = await response.json();
        setValidTargets(targets);
      } else {
        toast.error('Failed to load promotion targets');
      }
    } catch (error) {
      console.error('Error fetching promotion targets:', error);
      toast.error('Error loading promotion targets');
    }
  };

  // Fetch alumni eligible count
  const fetchAlumniEligibleCount = async () => {
    try {
      setLoadingAlumni(true);
      const response = await fetch(`${API}/admin/alumni-eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAlumniEligibleCount(data.count);
      } else {
        toast.error('Failed to load alumni data');
      }
    } catch (error) {
      console.error('Error fetching alumni data:', error);
      toast.error('Error loading alumni data');
    } finally {
      setLoadingAlumni(false);
    }
  };

  // Fetch alumni candidates
  const fetchAlumniCandidates = async () => {
    try {
      setAlumniLoading(true);
      const response = await fetch(`${API}/admin/alumni-eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAlumniCandidates(data.students || []);
        setShowAlumniModal(true);
      } else {
        toast.error('Failed to load alumni candidates');
      }
    } catch (error) {
      console.error('Error fetching alumni candidates:', error);
      toast.error('Error loading alumni candidates');
    } finally {
      setAlumniLoading(false);
    }
  };

  // Handle batch promotion
  const handleBatchPromotion = async () => {
    if (!promotionFrom || !promotionTo) {
      toast.error('Please select both current and target levels');
      return;
    }

    try {
      setPromotionLoading(true);
      const response = await fetch(`${API}/admin/promote-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromLevel: promotionFrom,
          toLevel: promotionTo
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully promoted ${result.promotedCount} students from ${promotionFrom} to ${promotionTo}`);
        notificationService.custom('success', 'Promotion Successful', `Promoted ${result.promotedCount} students`);
        
        // Reset form and refresh data
        setPromotionFrom('');
        setPromotionTo('');
        setValidTargets([]);
        fetchAvailableLevels();
        fetchAlumniEligibleCount();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to promote students');
      }
    } catch (error) {
      console.error('Error promoting students:', error);
      toast.error('Error promoting students');
    } finally {
      setPromotionLoading(false);
    }
  };

  // Handle alumni status update
  const handleAlumniStatusUpdate = async () => {
    try {
      setAlumniLoading(true);
      const response = await fetch(`${API}/admin/promote-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fromLevel: 'ALUMNI_ELIGIBLE',
          toLevel: 'ALUMNI'
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully updated ${result.promotedCount} students to alumni status`);
        notificationService.custom('success', 'Alumni Update Successful', `Updated ${result.promotedCount} students to alumni`);
        
        // Refresh data
        fetchAvailableLevels();
        fetchAlumniEligibleCount();
        setShowAlumniModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update alumni status');
      }
    } catch (error) {
      console.error('Error updating alumni status:', error);
      toast.error('Error updating alumni status');
    } finally {
      setAlumniLoading(false);
    }
  };

  // Update valid targets when from level changes
  useEffect(() => {
    if (promotionFrom) {
      fetchValidTargets(promotionFrom);
    } else {
      setValidTargets([]);
      setPromotionTo('');
    }
  }, [promotionFrom, token]);

  // Load initial data
  useEffect(() => {
    if (token) {
      fetchAvailableLevels();
      fetchAlumniEligibleCount();
    }
  }, [token]);

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
            <img src={logo} alt="GNAASUG" className="h-6 w-6 sm:h-8 sm:w-8 object-contain"/>
            <div className="text-xs sm:text-sm font-semibold truncate">Manage Levels</div>
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
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Promotion & Alumni Management</h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Manage student promotions and alumni status transitions</p>
          </div>

          {/* Alumni Status Alert */}
          {alumniEligibleCount > 0 && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-800">
                    {alumniEligibleCount} students eligible for Alumni status
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Promote Students Card */}
            <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Promote Students</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Bulk promote students to next level</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Current Level */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Current Level</label>
                  <select
                    value={promotionFrom}
                    onChange={(e) => setPromotionFrom(e.target.value)}
                    disabled={loadingLevels}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select current level</option>
                    {availableLevels
                      .filter(level => level.hasStudents)
                      .map(level => (
                        <option key={level.level} value={level.level}>
                          {level.label}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Target Level */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Target Level</label>
                  <select
                    value={promotionTo}
                    onChange={(e) => setPromotionTo(e.target.value)}
                    disabled={!promotionFrom || validTargets.length === 0}
                    className="w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select target level</option>
                    {validTargets.map(target => (
                      <option key={target.level} value={target.level}>
                        {target.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Promote Button */}
                <button
                  onClick={handleBatchPromotion}
                  disabled={promotionLoading || !promotionFrom || !promotionTo}
                  className="w-full bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-colors flex items-center justify-center"
                >
                  {promotionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Promoting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Promote Students
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Auto Alumni Status Card */}
            <div className="bg-white rounded-lg shadow-sm border p-3 sm:p-4 md:p-6">
              <div className="flex items-center mb-4 sm:mb-6">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-3 sm:ml-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">Auto Alumni Status</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Manage automatic alumni transitions</p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                {/* Pending Alumni Status */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
                  <h4 className="text-xs sm:text-sm font-medium text-orange-900 mb-2">Pending Alumni Status</h4>
                  {loadingAlumni ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600 mr-2"></div>
                      <span className="text-xs sm:text-sm text-orange-700">Loading...</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs sm:text-sm text-orange-800 mb-2">
                        {alumniEligibleCount} students have completed their program duration and are eligible for alumni status
                      </p>
                      <ul className="text-xs text-orange-700 space-y-1">
                        <li>• Joined 2022 + 3-year program → 2025 = Alumni</li>
                        <li>• Auto-detection based on course duration</li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Review Alumni Button */}
                <button
                  onClick={fetchAlumniCandidates}
                  disabled={alumniLoading || alumniEligibleCount === 0}
                  className="w-full bg-green-600 text-white py-2 sm:py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium transition-colors flex items-center justify-center"
                >
                  {alumniLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Review Alumni Candidates
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Alumni Candidates Modal */}
          {showAlumniModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Alumni Candidates</h3>
                  <button
                    onClick={() => setShowAlumniModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
                  {alumniCandidates.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {alumniCandidates.map((candidate) => (
                          <div key={candidate.id} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900">{candidate.fullName}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">ID: {candidate.studentId}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Level: {candidate.level}</p>
                            <p className="text-xs sm:text-sm text-gray-600">Hall: {candidate.hall}</p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Program: {candidate.programDurationYears} years
                            </p>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Admitted: {new Date(candidate.dateOfAdmission).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No alumni candidates found</p>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <button
                    onClick={() => setShowAlumniModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAlumniStatusUpdate}
                    disabled={alumniLoading || alumniCandidates.length === 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {alumniLoading ? 'Updating...' : `Update ${alumniCandidates.length} to Alumni`}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
