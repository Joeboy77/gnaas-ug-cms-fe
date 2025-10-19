import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import logo from '../assets/gnaasug.png';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';
import AdminProfileDropdown from '../components/AdminProfileDropdown';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface AttendanceReport {
  date: string;
  present: number;
  absent: number;
  attendanceRate: number;
}

interface LevelReport {
  level: string;
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
}

interface HallReport {
  hall: string;
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
}

interface GenderReport {
  gender: string;
  count: number;
  percentage: number;
}

interface MonthlyTrend {
  month: string;
  totalAttendance: number;
  averageRate: number;
}

export default function Reports() {
  const { token } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Report data states
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport[]>([]);
  const [levelReport, setLevelReport] = useState<LevelReport[]>([]);
  const [hallReport, setHallReport] = useState<HallReport[]>([]);
  const [genderReport, setGenderReport] = useState<GenderReport[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  
  // Date range for reports
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  // Fetch all reports data
  const fetchReportsData = async () => {
    try {
      setLoading(true);
      
      // Fetch attendance report
      const attendanceRes = await fetch(`${API}/reports/attendance?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch level report
      const levelRes = await fetch(`${API}/reports/levels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch hall report
      const hallRes = await fetch(`${API}/reports/halls`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch gender report
      const genderRes = await fetch(`${API}/reports/gender`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch monthly trends
      const monthlyRes = await fetch(`${API}/reports/monthly-trends`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (attendanceRes.ok) {
        const data = await attendanceRes.json();
        setAttendanceReport(data);
      }

      if (levelRes.ok) {
        const data = await levelRes.json();
        setLevelReport(data);
      }

      if (hallRes.ok) {
        const data = await hallRes.json();
        setHallReport(data);
      }

      if (genderRes.ok) {
        const data = await genderRes.json();
        setGenderReport(data);
      }

      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlyTrend(data);
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReportsData();
    }
  }, [token, dateRange]);

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = async (reportType: string, format: 'pdf' | 'excel' | 'csv') => {
    try {
      const response = await fetch(`${API}/reports/export/${reportType}?format=${format}&startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-report.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${reportType} report exported successfully`);
      } else {
        toast.error('Failed to export report');
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Error exporting report');
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

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
            <div className="text-xs sm:text-sm font-semibold truncate">Reports & Analytics</div>
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
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Reports & Analytics</h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Comprehensive reports and analytics for student attendance and demographics</p>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 md:mb-6">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Report Period</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              {/* Monthly Attendance Trends */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Monthly Attendance Trends</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => exportReport('monthly-trends', 'pdf')}
                      className="px-2 sm:px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => exportReport('monthly-trends', 'excel')}
                      className="px-2 sm:px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Excel
                    </button>
                  </div>
                </div>
                <div className="h-48 sm:h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="month" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="totalAttendance" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="averageRate" stackId="2" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Level-wise Attendance */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Level-wise Attendance</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => exportReport('levels', 'pdf')}
                      className="px-2 sm:px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => exportReport('levels', 'excel')}
                      className="px-2 sm:px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Excel
                    </button>
                  </div>
                </div>
                <div className="h-48 sm:h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={levelReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="level" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar dataKey="totalStudents" fill="#8884d8" name="Total Students" />
                      <Bar dataKey="presentToday" fill="#82ca9d" name="Present Today" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Hall-wise Attendance */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Hall-wise Attendance</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => exportReport('halls', 'pdf')}
                      className="px-2 sm:px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => exportReport('halls', 'excel')}
                      className="px-2 sm:px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Excel
                    </button>
                  </div>
                </div>
                <div className="h-48 sm:h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hallReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="hall" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Bar dataKey="totalStudents" fill="#8884d8" name="Total Students" />
                      <Bar dataKey="presentToday" fill="#82ca9d" name="Present Today" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Gender Distribution</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => exportReport('gender', 'pdf')}
                      className="px-2 sm:px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => exportReport('gender', 'excel')}
                      className="px-2 sm:px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Excel
                    </button>
                  </div>
                </div>
                <div className="h-48 sm:h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderReport}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        fontSize={10}
                      >
                        {genderReport.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Daily Attendance Report */}
              <div className="bg-white rounded-lg shadow-sm border p-2 sm:p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-2 sm:mb-0">Daily Attendance Report</h3>
                  <div className="flex gap-1 sm:gap-2">
                    <button
                      onClick={() => exportReport('attendance', 'pdf')}
                      className="px-2 sm:px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => exportReport('attendance', 'excel')}
                      className="px-2 sm:px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Excel
                    </button>
                  </div>
                </div>
                <div className="h-48 sm:h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={attendanceReport}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis 
                        fontSize={10}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          fontSize: '12px',
                          padding: '8px',
                          borderRadius: '6px'
                        }}
                      />
                      <Legend 
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="present" stroke="#8884d8" name="Present" />
                      <Line type="monotone" dataKey="absent" stroke="#82ca9d" name="Absent" />
                      <Line type="monotone" dataKey="attendanceRate" stroke="#ffc658" name="Attendance Rate %" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
