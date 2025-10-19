import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';
import logo from '../assets/gnaasug.png';
import toast from 'react-hot-toast';
import { notificationService } from '../services/notificationService';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileModal from '../components/ProfileModal';
import SecretaryProfileButton from '../components/SecretaryProfileButton';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface Student {
  id: number;
  code: string;
  fullName: string;
  gender: string;
  level: string;
  hall: string;
  role: string;
  phone?: string;
  email?: string;
  profileImageUrl?: string;
  createdAt: string;
}

interface Visitor {
  id?: number;
  fullName: string;
  hall: string;
  purpose: string;
  level: string;
  phone?: string;
  email?: string;
}

interface AttendanceStatus {
  date: string;
  isClosed: boolean;
  status: 'open' | 'closed';
}

interface AttendanceStats {
  date: string;
  membersPresent: number;
  membersAbsent: number;
  visitorsPresent: number;
  totalPresent: number;
  totalAbsent: number;
  totalMembers: number;
  totalVisitors: number;
}

export default function MarkAttendance() {
  const token = useAuthStore((s) => s.token);
  const [activeTab, setActiveTab] = useState<'members' | 'visitors'>('members');
  const [students, setStudents] = useState<Student[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [attendance, setAttendance] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatus | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [modalType, setModalType] = useState<'members-present' | 'members-absent' | 'visitors' | 'overview' | null>(null);
  const [modalData, setModalData] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    hall: '',
    level: '',
    gender: ''
  });

  const [visitorForm, setVisitorForm] = useState<Visitor>({
    fullName: '',
    hall: '',
    purpose: '',
    level: '',
    phone: '',
    email: ''
  });
  
  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Profile modal handlers
  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const fetchAttendanceStatus = async () => {
    try {
      const res = await fetch(`${API}/attendance/status/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAttendanceStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch attendance status:', e);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const res = await fetch(`${API}/attendance/summary/${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAttendanceStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch attendance stats:', e);
    }
  };

  const fetchModalData = async (type: 'members-present' | 'members-absent' | 'visitors') => {
    try {
      let endpoint = '';
      switch (type) {
        case 'members-present':
          endpoint = `${API}/attendance/members-present/${selectedDate}`;
          break;
        case 'members-absent':
          endpoint = `${API}/attendance/members-absent/${selectedDate}`;
          break;
        case 'visitors':
          endpoint = `${API}/attendance/visitors/${selectedDate}`;
          break;
      }
      
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setModalData(data);
      }
    } catch (e) {
      console.error('Failed to fetch modal data:', e);
    }
  };

  const handleStatsCardClick = async (type: 'members-present' | 'members-absent' | 'visitors' | 'overview') => {
    setModalType(type);
    if (type !== 'overview') {
      await fetchModalData(type);
    }
    setShowStatsModal(true);
  };

  const fetchUnmarkedStudents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.hall) queryParams.append('hall', filters.hall);
      if (filters.level) queryParams.append('level', filters.level);
      if (filters.gender) queryParams.append('gender', filters.gender);
      
      const res = await fetch(`${API}/attendance/unmarked-members/${selectedDate}?${queryParams}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data);
      }
    } catch (e) {
      console.error('Failed to fetch unmarked students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAttendanceStatus();
      fetchAttendanceStats();
      fetchUnmarkedStudents();
    }
  }, [token, selectedDate, filters]);

  const handleAttendanceChange = async (studentId: number, isPresent: boolean) => {
    try {
      const res = await fetch(`${API}/attendance/mark-member/${selectedDate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId, isPresent })
      });
      
      if (res.ok) {
        setAttendance(prev => ({
          ...prev,
          [studentId]: isPresent
        }));
        fetchUnmarkedStudents();
        fetchAttendanceStats();
        toast.success(isPresent ? 'Member marked present' : 'Member marked absent');
        
        const student = students.find(s => s.id === studentId);
        if (student) {
          notificationService.attendanceMarked(student.fullName, selectedDate, 'member');
        }
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to mark attendance');
      }
    } catch (e) {
      console.error('Failed to mark attendance:', e);
      toast.error('Failed to mark attendance');
    }
  };

  const markAllPresent = () => {
    const newAttendance: Record<number, boolean> = {};
    students.forEach(student => {
      newAttendance[student.id] = true;
    });
    setAttendance(newAttendance);
  };

  const unmarkAll = () => {
    setAttendance({});
  };

  const handleVisitorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.fullName || !visitorForm.hall || !visitorForm.purpose || !visitorForm.level) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      const res = await fetch(`${API}/attendance/mark-visitor/${selectedDate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          visitorData: visitorForm, 
          isPresent: true 
        })
      });
      
      if (res.ok) {
        const newVisitor: Visitor = {
          ...visitorForm,
          id: Date.now() 
        };
        
        setVisitors(prev => [...prev, newVisitor]);
        setVisitorForm({
          fullName: '',
          hall: '',
          purpose: '',
          level: '',
          phone: '',
          email: ''
        });
        fetchAttendanceStats(); // Refresh stats
        toast.success('Visitor added and marked present');
        
        // Add notification for visitor attendance
        notificationService.attendanceMarked(visitorForm.fullName, selectedDate, 'visitor');
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to add visitor');
      }
    } catch (e) {
      console.error('Failed to add visitor:', e);
      toast.error('Failed to add visitor');
    }
  };

  const handleVisitorAttendanceChange = (visitorId: number, isPresent: boolean) => {
    setAttendance(prev => ({
      ...prev,
      [visitorId]: isPresent
    }));
  };

  const closeAttendance = async () => {
    try {
      const res = await fetch(`${API}/attendance/close/${selectedDate}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type: activeTab === 'members' ? 'member' : 'visitor' })
      });
      
      if (res.ok) {
        toast.success(`Attendance closed for ${activeTab}`);
        fetchAttendanceStatus();
        fetchAttendanceStats();
      } else {
        const error = await res.json();
        toast.error(error.message || 'Failed to close attendance');
      }
    } catch (e) {
      console.error('Failed to close attendance:', e);
      toast.error('Failed to close attendance');
    }
  };

  const handleDateChange = async (newDate: string) => {
    setSelectedDate(newDate);
    setShowDatePicker(false);
    setAttendance({}); 
    setVisitors([]); 
    setLoading(true);
    
    const statusRes = await fetch(`${API}/attendance/status/${newDate}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const statusData = await statusRes.json();
    
    if (statusRes.ok) {
      setAttendanceStatus(statusData);
      
      if (statusData.isClosed) {
        toast.error(`Attendance is closed for ${formatDate(newDate)}`);
      } else {
        toast.success(`Switched to ${formatDate(newDate)}`);
      }
    }
    
    await fetchAttendanceStats();
    await fetchUnmarkedStudents();
  };

  const filteredStudents = students;

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const totalCount = activeTab === 'members' ? filteredStudents.length : visitors.length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/secretary" className="cursor-pointer">
              <img src={logo} alt="GNAASUG" className="h-10 w-10 object-contain sm:h-12 sm:w-12 hover:opacity-80 transition-opacity"/>
            </Link>
            <div>
              <div className="text-sm font-semibold sm:text-base">Mark Attendance</div>
              <div className="text-xs text-gray-500 sm:text-sm">GNAAS UG Student Management System</div>
            </div>
          </div>
          <div className="flex items-center justify-between sm:gap-3">
            <NotificationDropdown />
            <SecretaryProfileButton onClick={handleProfileClick} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6">
        {/* Today's Attendance Card */}
        <div className="mb-6 rounded-lg border bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <span className="text-xl">📅</span>
              </div>
              <div>
                <h2 className="text-base font-semibold sm:text-lg">Today's Attendance</h2>
                <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                {attendanceStatus?.isClosed && (
                  <div className="mt-1 flex items-center gap-1">
                    <span className="text-xs text-red-600">🔒</span>
                    <span className="text-xs text-red-600 font-medium">Attendance Closed for this date</span>
                  </div>
                )}
              </div>
            </div>
            <button 
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              <span>📅</span>
              <span>Change Date</span>
            </button>
          </div>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:p-6">
              <div className="mb-4">
                <h3 className="text-base font-semibold sm:text-lg">Select Date</h3>
                <p className="text-xs text-gray-600 sm:text-sm">Choose the date for marking attendance</p>
              </div>
              <div className="mb-4">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  max={new Date().toISOString().split('T')[0]} // Can't select future dates
                  className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="flex-1 rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>👥</span>
              <span>Members</span>
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className={`flex min-w-[140px] flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'visitors'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>👤</span>
              <span>Visitors</span>
            </button>
          </div>
        </div>

        {/* Attendance Stats Cards */}
        {attendanceStats && (
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div 
              onClick={() => handleStatsCardClick('members-present')}
              className="cursor-pointer rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Members Present</p>
                  <p className="text-lg font-semibold text-green-600 sm:text-xl">{attendanceStats.membersPresent}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center sm:h-10 sm:w-10">
                  <span className="text-green-600 text-sm sm:text-base">✓</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleStatsCardClick('members-absent')}
              className="cursor-pointer rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Members Absent</p>
                  <p className="text-lg font-semibold text-red-600 sm:text-xl">{attendanceStats.membersAbsent}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center sm:h-10 sm:w-10">
                  <span className="text-red-600 text-sm sm:text-base">✗</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleStatsCardClick('visitors')}
              className="cursor-pointer rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Visitors</p>
                  <p className="text-lg font-semibold text-blue-600 sm:text-xl">{attendanceStats.visitorsPresent}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center sm:h-10 sm:w-10">
                  <span className="text-blue-600 text-sm sm:text-base">👤</span>
                </div>
              </div>
            </div>

            <div 
              onClick={() => handleStatsCardClick('overview')}
              className="cursor-pointer rounded-lg border bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 sm:text-sm">Total Present</p>
                  <p className="text-lg font-semibold text-[#0E3F8E] sm:text-xl">{attendanceStats.totalPresent}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-[#0E3F8E] bg-opacity-10 flex items-center justify-center sm:h-10 sm:w-10">
                  <span className="text-[#0E3F8E] text-sm sm:text-base">📊</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'members' ? (
          <>
            {/* Filters and Actions */}
            <div className="mb-6 flex flex-col gap-3 rounded-lg border bg-white p-4 sm:flex-row sm:flex-wrap">
              <div className="grid w-full grid-cols-1 gap-3 sm:flex sm:w-auto sm:flex-wrap">
                <select
                  value={filters.hall}
                  onChange={(e) => setFilters(prev => ({ ...prev, hall: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                >
                  <option value="">All Halls</option>
                  <option value="Legon">Legon</option>
                  <option value="Akuafo">Akuafo</option>
                  <option value="Commonwealth">Commonwealth</option>
                  <option value="Mensah Sarbah">Mensah Sarbah</option>
                  <option value="Volta">Volta</option>
                  <option value="Alexander Adum Kwapong">Alexander Adum Kwapong</option>
                  <option value="Elizabeth Frances Sey">Elizabeth Frances Sey</option>
                  <option value="Hilla Limann">Hilla Limann</option>
                  <option value="Jean Nelson Aka">Jean Nelson Aka</option>
                  <option value="Jubilee">Jubilee</option>
                  <option value="Valco Trust">Valco Trust</option>
                  <option value="International Students I">International Students I</option>
                  <option value="International Students II">International Students II</option>
                  <option value="Diamond Jubilee">Diamond Jubilee</option>
                  <option value="Pent">Pent</option>
                  <option value="Bani">Bani</option>
                  <option value="Evandy">Evandy</option>
                  <option value="TF">TF</option>
                  <option value="Non Resident">Non Resident</option>
                </select>

                <select
                  value={filters.level}
                  onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                >
                  <option value="">All Levels</option>
                  <option value="L100">L100</option>
                  <option value="L200">L200</option>
                  <option value="L300">L300</option>
                  <option value="L400">L400</option>
                  <option value="L500">L500</option>
                  <option value="L600">L600</option>
                </select>

                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
                >
                  <option value="">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
                <button
                  onClick={markAllPresent}
                  className="flex-1 rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700 sm:flex-none"
                >
                  Mark All
                </button>
                <button
                  onClick={unmarkAll}
                  className="flex-1 rounded bg-gray-600 px-4 py-2 text-sm text-white hover:bg-gray-700 sm:flex-none"
                >
                  Unmark All
                </button>
              </div>
            </div>

            {/* Members List */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold sm:text-lg">Members List</h3>
                <span className="text-sm text-gray-600">
                  {presentCount} of {totalCount} marked present
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading members...</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student) => (
                    <div key={student.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <input
                        type="checkbox"
                        checked={attendance[student.id] || false}
                        onChange={(e) => handleAttendanceChange(student.id, e.target.checked)}
                        disabled={attendanceStatus?.isClosed}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 sm:h-12 sm:w-12">
                        {student.profileImageUrl ? (
                          <img
                            src={student.profileImageUrl}
                            alt={student.fullName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            <span className="text-lg">👤</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium sm:text-base">{student.fullName}</div>
                        <div className="text-xs text-gray-500 sm:text-sm">
                          {student.hall} • {student.level}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Visitor Form */}
            <div className="mb-6 rounded-lg border bg-white p-4 sm:p-6">
              <h3 className="mb-4 text-base font-semibold sm:text-lg">Add Visitor</h3>
              {attendanceStatus?.isClosed && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-sm text-red-600">Attendance is closed for this date. No new visitors can be added.</p>
                </div>
              )}
              <form onSubmit={handleVisitorSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitorForm.fullName}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter visitor's full name"
                    className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Hall of Residence <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={visitorForm.hall}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, hall: e.target.value }))}
                    className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  >
                    <option value="">Select Hall</option>
                    <option value="Legon">Legon</option>
                    <option value="Akuafo">Akuafo</option>
                    <option value="Commonwealth">Commonwealth</option>
                    <option value="Mensah Sarbah">Mensah Sarbah</option>
                    <option value="Volta">Volta</option>
                    <option value="Alexander Adum Kwapong">Alexander Adum Kwapong</option>
                    <option value="Elizabeth Frances Sey">Elizabeth Frances Sey</option>
                    <option value="Hilla Limann">Hilla Limann</option>
                    <option value="Jean Nelson Aka">Jean Nelson Aka</option>
                    <option value="Jubilee">Jubilee</option>
                    <option value="Valco Trust">Valco Trust</option>
                    <option value="International Students I">International Students I</option>
                    <option value="International Students II">International Students II</option>
                    <option value="Diamond Jubilee">Diamond Jubilee</option>
                    <option value="Pent">Pent</option>
                    <option value="Bani">Bani</option>
                    <option value="Evandy">Evandy</option>
                    <option value="TF">TF</option>
                    <option value="Non Resident">Non Resident</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={visitorForm.level}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, level: e.target.value }))}
                    className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  >
                    <option value="">Select Level</option>
                    <option value="L100">L100</option>
                    <option value="L200">L200</option>
                    <option value="L300">L300</option>
                    <option value="L400">L400</option>
                    <option value="L500">L500</option>
                    <option value="L600">L600</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Purpose of Visit <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={visitorForm.purpose}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="e.g., Fellowship, Meeting, Event"
                    className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={visitorForm.phone}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={visitorForm.email}
                    onChange={(e) => setVisitorForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="visitor@example.com"
                    className="w-full rounded border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-base"
                  />
                </div>

                <div className="sm:col-span-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={attendanceStatus?.isClosed}
                    className="w-48 rounded bg-[#0E3F8E] px-4 py-2 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add Visitor
                  </button>
                </div>
              </form>
            </div>

            {/* Visitors List */}
            <div className="mb-6 rounded-lg border bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold sm:text-lg">Visitors List</h3>
                <span className="text-sm text-gray-600">
                  {presentCount} of {totalCount} marked present
                </span>
              </div>

              {visitors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No visitors added yet</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {visitors.map((visitor) => (
                    <div key={visitor.id} className="flex items-center gap-3 rounded-lg border p-3">
                      <input
                        type="checkbox"
                        checked={attendance[visitor.id!] || false}
                        onChange={(e) => handleVisitorAttendanceChange(visitor.id!, e.target.checked)}
                        disabled={attendanceStatus?.isClosed}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200 sm:h-12 sm:w-12">
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <span className="text-lg">👤</span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium sm:text-base">{visitor.fullName}</div>
                        <div className="text-xs text-gray-500 sm:text-sm">
                          {visitor.hall} • {visitor.level}
                        </div>
                        <div className="text-xs text-gray-400">{visitor.purpose}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Submit Attendance */}
        <div className="rounded-lg border bg-white p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-semibold sm:text-lg">Submit Attendance</h3>
              <p className="text-sm text-gray-600">
                {presentCount} {activeTab === 'members' ? 'members' : 'visitors'} marked as present
              </p>
            </div>
            <button
              onClick={closeAttendance}
              disabled={attendanceStatus?.isClosed}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-lg bg-[#0E3F8E] px-6 py-3 text-sm font-medium text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed sm:text-base"
            >
              <span>🔒</span>
              <span>{attendanceStatus?.isClosed ? 'Attendance Closed' : 'Close Attendance'}</span>
            </button>
          </div>
        </div>
      </main>

      {/* Detailed Stats Modal */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold sm:text-xl">
                    {modalType === 'members-present' && 'Members Present'}
                    {modalType === 'members-absent' && 'Members Absent'}
                    {modalType === 'visitors' && 'Visitors'}
                    {modalType === 'overview' && 'Attendance Overview'}
                  </h3>
                  <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
                </div>
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="rounded-full p-2 hover:bg-gray-100"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              {/* Members Present Table */}
              {modalType === 'members-present' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold">Profile</th>
                        <th className="p-3 text-left text-sm font-semibold">Full Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Student ID</th>
                        <th className="p-3 text-left text-sm font-semibold">Level</th>
                        <th className="p-3 text-left text-sm font-semibold">Hall</th>
                        <th className="p-3 text-left text-sm font-semibold">Gender</th>
                        <th className="p-3 text-left text-sm font-semibold">Email</th>
                        <th className="p-3 text-left text-sm font-semibold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((member: any) => (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {member.profileImageUrl ? (
                              <img
                                src={member.profileImageUrl}
                                alt={member.fullName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-lg">👤</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-medium">{member.fullName}</td>
                          <td className="p-3 text-sm text-gray-600">{member.code}</td>
                          <td className="p-3">{member.level}</td>
                          <td className="p-3">{member.hall}</td>
                          <td className="p-3">{member.gender}</td>
                          <td className="p-3 text-sm">{member.email || '-'}</td>
                          <td className="p-3 text-sm">{member.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {modalData.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      No members marked present for this date
                    </div>
                  )}
                </div>
              )}

              {/* Members Absent Table */}
              {modalType === 'members-absent' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold">Profile</th>
                        <th className="p-3 text-left text-sm font-semibold">Full Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Student ID</th>
                        <th className="p-3 text-left text-sm font-semibold">Level</th>
                        <th className="p-3 text-left text-sm font-semibold">Hall</th>
                        <th className="p-3 text-left text-sm font-semibold">Gender</th>
                        <th className="p-3 text-left text-sm font-semibold">Email</th>
                        <th className="p-3 text-left text-sm font-semibold">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((member: any) => (
                        <tr key={member.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            {member.profileImageUrl ? (
                              <img
                                src={member.profileImageUrl}
                                alt={member.fullName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                                <span className="text-lg">👤</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3 font-medium">{member.fullName}</td>
                          <td className="p-3 text-sm text-gray-600">{member.code}</td>
                          <td className="p-3">{member.level}</td>
                          <td className="p-3">{member.hall}</td>
                          <td className="p-3">{member.gender}</td>
                          <td className="p-3 text-sm">{member.email || '-'}</td>
                          <td className="p-3 text-sm">{member.phone || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {modalData.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      No members marked absent for this date
                    </div>
                  )}
                </div>
              )}

              {/* Visitors Table */}
              {modalType === 'visitors' && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="p-3 text-left text-sm font-semibold">Full Name</th>
                        <th className="p-3 text-left text-sm font-semibold">Hall</th>
                        <th className="p-3 text-left text-sm font-semibold">Level</th>
                        <th className="p-3 text-left text-sm font-semibold">Purpose</th>
                        <th className="p-3 text-left text-sm font-semibold">Phone</th>
                        <th className="p-3 text-left text-sm font-semibold">Email</th>
                        <th className="p-3 text-left text-sm font-semibold">Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalData.map((visitor: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{visitor.visitorName}</td>
                          <td className="p-3">{visitor.visitorHall}</td>
                          <td className="p-3">{visitor.visitorLevel}</td>
                          <td className="p-3">{visitor.visitorPurpose}</td>
                          <td className="p-3 text-sm">{visitor.visitorPhone || '-'}</td>
                          <td className="p-3 text-sm">{visitor.visitorEmail || '-'}</td>
                          <td className="p-3 text-sm text-gray-600">
                            {new Date(visitor.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {modalData.length === 0 && (
                    <div className="py-8 text-center text-gray-500">
                      No visitors recorded for this date
                    </div>
                  )}
                </div>
              )}

              {/* Overview */}
              {modalType === 'overview' && attendanceStats && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="rounded-lg border bg-white p-4">
                    <h4 className="mb-4 text-base font-semibold">Members Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Members</span>
                        <span className="font-semibold">{attendanceStats.totalMembers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Present</span>
                        <span className="font-semibold text-green-600">{attendanceStats.membersPresent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Absent</span>
                        <span className="font-semibold text-red-600">{attendanceStats.membersAbsent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Attendance Rate</span>
                        <span className="font-semibold">
                          {attendanceStats.totalMembers > 0 
                            ? Math.round((attendanceStats.membersPresent / attendanceStats.totalMembers) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-white p-4">
                    <h4 className="mb-4 text-base font-semibold">Overall Summary</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Attendees</span>
                        <span className="font-semibold">{attendanceStats.totalPresent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Members</span>
                        <span className="font-semibold text-green-600">{attendanceStats.membersPresent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Visitors</span>
                        <span className="font-semibold text-blue-600">{attendanceStats.visitorsPresent}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status</span>
                        <span className={`font-semibold ${attendanceStatus?.isClosed ? 'text-red-600' : 'text-green-600'}`}>
                          {attendanceStatus?.isClosed ? 'Closed' : 'Open'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="rounded-lg bg-gray-500 px-6 py-2 text-sm font-medium text-white hover:bg-gray-600 sm:text-base"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowStatsModal(false);
                    setShowDatePicker(true);
                  }}
                  className="rounded-lg bg-[#0E3F8E] px-6 py-2 text-sm font-medium text-white hover:opacity-95 sm:text-base"
                >
                  Change Date
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}