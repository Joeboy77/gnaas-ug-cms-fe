import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/auth';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import logo from '../assets/gnaasug.png';
import NotificationDropdown from '../components/NotificationDropdown';
import ProfileModal from '../components/ProfileModal';
import SecretaryProfileButton from '../components/SecretaryProfileButton';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface DailyStats {
  date: string;
  dayName: string;
  present: number;
  absent: number;
  visitors: number;
  total: number;
  attendanceRate: number;
}

interface WeeklyStats {
  week: string;
  dateRange: {
    start: string;
    end: string;
  };
  totalStudents: number;
  dailyStats: DailyStats[];
  weeklyTotals: {
    totalPresent: number;
    totalAbsent: number;
    totalVisitors: number;
    averageAttendanceRate: number;
  };
  hallStats: Array<{
    hall: string;
    totalAttendance: number;
    presentCount: number;
    attendanceRate: number;
  }>;
  levelStats: Array<{
    level: string;
    totalAttendance: number;
    presentCount: number;
    attendanceRate: number;
  }>;
}

interface MonthlyTrends {
  totalStudents: number;
  trends: Array<{
    month: string;
    year: number;
    monthNumber: number;
    present: number;
    visitors: number;
    totalAttendance: number;
    attendanceRate: number;
  }>;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'];

export default function WeeklyAttendance() {
  const token = useAuthStore((s) => s.token);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState('');
  
  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Profile modal handlers
  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  const fetchWeeklyStats = async (week?: string) => {
    try {
      const url = week ? `${API}/attendance/weekly-stats?week=${week}` : `${API}/attendance/weekly-stats`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setWeeklyStats(data);
      } else {
        notificationService.systemError('Failed to fetch weekly statistics');
      }
    } catch (e) {
      console.error('Failed to fetch weekly stats:', e);
      notificationService.systemError('Network error while fetching weekly statistics');
    }
  };

  const fetchMonthlyTrends = async () => {
    try {
      const res = await fetch(`${API}/attendance/monthly-trends?months=6`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok) {
        setMonthlyTrends(data);
      } else {
        notificationService.systemError('Failed to fetch monthly trends');
      }
    } catch (e) {
      console.error('Failed to fetch monthly trends:', e);
      notificationService.systemError('Network error while fetching monthly trends');
    }
  };

  useEffect(() => {
    if (token) {
      Promise.all([fetchWeeklyStats(selectedWeek), fetchMonthlyTrends()])
        .finally(() => setLoading(false));
    }
  }, [token, selectedWeek]);

  const generateWeekOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - (i * 7));
      const year = date.getFullYear();
      const weekNum = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
      const weekStr = `${year}-${weekNum.toString().padStart(2, '0')}`;
      const startOfWeek = new Date(date);
      startOfWeek.setDate(date.getDate() - date.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      options.push({
        value: weekStr,
        label: `Week ${weekNum} (${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()})`
      });
    }
    
    return options;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attendance statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/secretary" className="cursor-pointer">
              <img src={logo} alt="GNAASUG" className="h-10 w-10 object-contain sm:h-12 sm:w-12 hover:opacity-80 transition-opacity"/>
            </Link>
            <div>
              <div className="text-sm font-semibold sm:text-base">Weekly Attendance Reports</div>
              <div className="text-xs text-gray-500 sm:text-sm">GNAAS UG Student Management System</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Current Week</option>
              {generateWeekOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <NotificationDropdown />
            <SecretaryProfileButton onClick={handleProfileClick} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-3 sm:p-4 md:p-6">
        {weeklyStats && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{weeklyStats.totalStudents}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Present</p>
                    <p className="text-2xl font-semibold text-gray-900">{weeklyStats.weeklyTotals.totalPresent}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Visitors</p>
                    <p className="text-2xl font-semibold text-gray-900">{weeklyStats.weeklyTotals.totalVisitors}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg. Attendance Rate</p>
                    <p className="text-2xl font-semibold text-gray-900">{weeklyStats.weeklyTotals.averageAttendanceRate}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Attendance Chart */}
            <div className="bg-white rounded-lg border p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyStats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dayName" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [value, name === 'present' ? 'Present' : name === 'visitors' ? 'Visitors' : 'Absent']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="present" fill="#10B981" name="Present" />
                    <Bar dataKey="visitors" fill="#F59E0B" name="Visitors" />
                    <Bar dataKey="absent" fill="#EF4444" name="Absent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Attendance Rate Trend */}
            <div className="bg-white rounded-lg border p-4 sm:p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Attendance Rate Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyStats.dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dayName" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value) => [`${value}%`, 'Attendance Rate']}
                      labelFormatter={(label) => `Day: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="attendanceRate" 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hall-wise Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hall-wise Attendance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={weeklyStats.hallStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ hall, attendanceRate }) => `${hall}: ${attendanceRate}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="attendanceRate"
                      >
                        {weeklyStats.hallStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Level-wise Attendance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyStats.levelStats} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="level" type="category" width={60} />
                      <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                      <Bar dataKey="attendanceRate" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Monthly Trends */}
        {monthlyTrends && (
          <div className="bg-white rounded-lg border p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Attendance Trends (Last 6 Months)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'attendanceRate' ? `${value}%` : value,
                      name === 'attendanceRate' ? 'Attendance Rate' : name === 'present' ? 'Present' : 'Visitors'
                    ]}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="attendanceRate" stroke="#3B82F6" strokeWidth={3} name="Attendance Rate" />
                  <Line type="monotone" dataKey="present" stroke="#10B981" strokeWidth={2} name="Present" />
                  <Line type="monotone" dataKey="visitors" stroke="#F59E0B" strokeWidth={2} name="Visitors" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}
