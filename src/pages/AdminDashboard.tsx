import { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import logo from '../assets/gnaasug.png';
import totalIcon from '../assets/totalstudents.png';
import graduationIcon from '../assets/graduation.png';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import NotificationDropdown from '../components/NotificationDropdown';
import ExportDataModal from '../components/ExportDataModal';
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
  Area,
  AreaChart
} from 'recharts';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  graduationReady: number;
}

interface AttendanceInsight {
  month: string;
  present: number;
  absent: number;
  attendanceRate: number;
}

interface GenderData {
  name: string;
  value: number;
  color: string;
}

interface HallData {
  hall: string;
  totalStudents: number;
  presentToday: number;
  attendanceRate: number;
  graduationReady: number;
}

export default function AdminDashboard(){
  const token = useAuthStore((s) => s.token);
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    graduationReady: 0
  });
  const [loading, setLoading] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportBy, setExportBy] = useState('All Students');
  const [exportFormat, setExportFormat] = useState('excel');
  const [attendanceInsights, setAttendanceInsights] = useState<AttendanceInsight[]>([]);
  const [genderData, setGenderData] = useState<GenderData[]>([]);
  const [hallData, setHallData] = useState<HallData[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);
  const [promotionFrom, setPromotionFrom] = useState('L100');
  const [promotionTo, setPromotionTo] = useState('L200');
  const [promotionLoading, setPromotionLoading] = useState(false);
  const [availableLevels, setAvailableLevels] = useState<{level: string, count: number, label: string, hasStudents: boolean}[]>([]);
  const [validTargets, setValidTargets] = useState<string[]>([]);
  const [alumniEligibleCount, setAlumniEligibleCount] = useState(0);
  const [lastPromotionActionId, setLastPromotionActionId] = useState<string | null>(null);
  const [undoingPromotion, setUndoingPromotion] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Export modal handlers
  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const closeExportModal = () => {
    setIsExportModalOpen(false);
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];

      // Fetch total students
      const studentsRes = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();

      // Fetch today's attendance
      const attendanceRes = await fetch(`${API}/attendance/summary/${today}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const attendanceData = await attendanceRes.json();

      if (studentsRes.ok && attendanceRes.ok) {
        setStats({
          totalStudents: studentsData.length,
          presentToday: attendanceData.membersPresent || 0,
          absentToday: attendanceData.membersAbsent || 0,
          graduationReady: Math.floor(studentsData.length * 0.05) // 5% of students as placeholder
        });
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchChartsData = async () => {
    try {
      setChartsLoading(true);
      
      // Fetch real data from backend APIs
      const [attendanceRes, genderRes, hallRes] = await Promise.all([
        fetch(`${API}/admin/attendance-insights`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API}/admin/gender-distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API}/admin/hall-distribution`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendanceInsights(attendanceData);
      }

      if (genderRes.ok) {
        const genderData = await genderRes.json();
        setGenderData(genderData);
      }

      if (hallRes.ok) {
        const hallData = await hallRes.json();
        setHallData(hallData);
      }
    } catch (e) {
      console.error('Failed to fetch charts data:', e);
      toast.error('Failed to load charts data');
    } finally {
      setChartsLoading(false);
    }
  };


  const fetchAvailableLevels = async () => {
    try {
      const levelsRes = await fetch(`${API}/admin/available-levels`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (levelsRes.ok) {
        const levelsData = await levelsRes.json();
        setAvailableLevels(levelsData);
        
        // Set default promotion values - only from levels that have students
        const levelsWithStudents = levelsData.filter((level: any) => level.hasStudents);
        if (levelsWithStudents.length > 0) {
          setPromotionFrom(levelsWithStudents[0].level);
          // Fetch valid targets for the first level
          await fetchValidTargets(levelsWithStudents[0].level);
        }
      }
    } catch (e) {
      console.error('Failed to fetch levels:', e);
    }
  };

  const fetchValidTargets = async (fromLevel: string) => {
    try {
      const response = await fetch(`${API}/admin/valid-promotion-targets?fromLevel=${fromLevel}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const targets = await response.json();
        setValidTargets(targets);
        
        // Set default "to" value
        if (targets.length > 0) {
          setPromotionTo(targets[0]);
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error fetching valid targets:', error);
    }
  };

  const fetchAlumniEligibleCount = async () => {
    try {
      const alumniRes = await fetch(`${API}/admin/alumni-eligible`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (alumniRes.ok) {
        const alumniData = await alumniRes.json();
        setAlumniEligibleCount(alumniData.eligibleCount);
      }
    } catch (e) {
      console.error('Failed to fetch alumni count:', e);
    }
  };

  const handleBatchPromotion = async () => {
    if (promotionFrom === promotionTo) {
      toast.error('Please select different levels for promotion');
      return;
    }

    try {
      setPromotionLoading(true);
      
      const response = await fetch(`${API}/admin/promote-students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          fromLevel: promotionFrom,
          toLevel: promotionTo
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Successfully promoted ${result.promotedCount} students from ${promotionFrom} to ${promotionTo}`);
        
        // Store action ID for undo functionality
        if (result.actionId) {
          setLastPromotionActionId(result.actionId);
        }
        
        // Refresh data
        fetchDashboardStats();
        fetchChartsData();
        fetchAvailableLevels();
        fetchAlumniEligibleCount();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to promote students');
      }
    } catch (e) {
      console.error('Promotion error:', e);
      toast.error('Network error during promotion');
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleUndoPromotion = async () => {
    if (!lastPromotionActionId || !token) return;

    setUndoingPromotion(true);
    try {
      const response = await fetch(`${API}/admin/promotions/undo/${lastPromotionActionId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully undone promotion. ${data.undone} students reverted.`);
        
        // Clear the action ID
        setLastPromotionActionId(null);
        
        // Refresh data
        fetchDashboardStats();
        fetchChartsData();
        fetchAvailableLevels();
        fetchAlumniEligibleCount();
      } else {
        toast.error(data.message || 'Failed to undo promotion');
      }
    } catch (e) {
      console.error('Undo promotion error:', e);
      toast.error('Failed to undo promotion');
    } finally {
      setUndoingPromotion(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
      fetchChartsData();
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
            <div className="text-xs sm:text-sm font-semibold truncate">Super Admin Dashboard</div>
            <button
              onClick={fetchDashboardStats}
              disabled={loading}
              className="ml-1 sm:ml-4 rounded bg-[#0E3F8E] px-2 py-1 text-xs text-white hover:opacity-95 disabled:opacity-50 whitespace-nowrap"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
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
      <div className="flex flex-col lg:flex-row">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6">
          <div className="grid grid-cols-2 gap-1 sm:gap-2 md:gap-3 lg:gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatIcon
              title="Total Students"
              value={loading ? "..." : stats.totalStudents.toLocaleString()}
              valueClass="text-gray-900"
              icon={<img src={totalIcon} alt="total" className="h-5 w-5"/>}
              iconBoxClass="bg-[#DBEAFE] border border-[#E5E7EB]"
            />
            <StatIcon
              title="Present Today"
              value={loading ? "..." : stats.presentToday.toLocaleString()}
              valueClass="text-[#16A34A]"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16A34A" className="h-5 w-5"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>}
              iconBoxClass="bg-[#DCFCE7] border border-[#E5E7EB]"
            />
            <StatIcon
              title="Absent Today"
              value={loading ? "..." : stats.absentToday.toLocaleString()}
              valueClass="text-[#DC2626]"
              icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#DC2626" className="h-5 w-5"><path d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6.3z"/></svg>}
              iconBoxClass="bg-[#FEE2E2] border border-[#E5E7EB]"
            />
            <StatIcon
              title="Graduation Ready"
              value={loading ? "..." : stats.graduationReady.toLocaleString()}
              valueClass="text-[#9333EA]"
              icon={<img src={graduationIcon} alt="graduation" className="h-5 w-5"/>}
              iconBoxClass="bg-[#F3E8FF] border border-[#E5E7EB]"
            />
          </div>
          <section className="mt-3 sm:mt-4 md:mt-6">
            <Card title="Export Data" rightAction={<button aria-label="download" className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 rounded-full border border-gray-200 text-gray-500 text-xs sm:text-sm">⬇️</button>}>
              <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Export By</label>
                  <select 
                    value={exportBy}
                    onChange={(e) => setExportBy(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {['All Students','Level','Gender','Hall'].map(v=> (<option key={v}>{v}</option>))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">Export Format</label>
                  <div className="rounded border border-gray-300 p-2">
                    <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm">
                      <label className="inline-flex items-center gap-2">
                        <input 
                          name="fmt" 
                          type="radio" 
                          value="excel"
                          checked={exportFormat === 'excel'}
                          onChange={(e) => setExportFormat(e.target.value)}
                        /> 
                        <span className="inline-grid h-5 w-5 place-items-center rounded bg-[#DCFCE7] text-[#16A34A] border border-[#E5E7EB]">✔</span> Excel (.xlsx)
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input 
                          name="fmt" 
                          type="radio" 
                          value="pdf"
                          checked={exportFormat === 'pdf'}
                          onChange={(e) => setExportFormat(e.target.value)}
                        /> 
                        <span className="inline-grid h-5 w-5 place-items-center rounded bg-[#FEE2E2] text-[#DC2626] border border-[#E5E7EB]">✖</span> PDF (.pdf)
                      </label>
                      <label className="inline-flex items-center gap-2">
                        <input 
                          name="fmt" 
                          type="radio" 
                          value="csv"
                          checked={exportFormat === 'csv'}
                          onChange={(e) => setExportFormat(e.target.value)}
                        /> 
                        <span className="inline-grid h-5 w-5 place-items-center rounded bg-[#DBEAFE] text-blue-600 border border-[#E5E7EB]">CSV</span> CSV (.csv)
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 grid grid-cols-1 lg:grid-cols-2">
                <div className="hidden lg:block"/>
                <button
                  onClick={handleExportClick}
                  className="inline-flex items-center justify-center gap-2 rounded bg-[#0E3F8E] px-3 py-2 sm:px-4 text-sm sm:text-base text-white hover:opacity-95 lg:justify-self-end lg:w-80"
                >
                  <span>Export Data</span>
                </button>
              </div>
            </Card>
          </section>
          <section className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-2">
            <Card title="Attendance Insights">
              {chartsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="h-32 sm:h-40 md:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={attendanceInsights}>
                      <defs>
                        <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="present"
                        stroke="#3B82F6"
                        fillOpacity={1}
                        fill="url(#colorPresent)"
                        name="Present"
                      />
                      <Area
                        type="monotone"
                        dataKey="absent"
                        stroke="#EF4444"
                        fillOpacity={1}
                        fill="url(#colorAbsent)"
                        name="Absent"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
            
            <Card title="Gender Distribution">
              {chartsLoading ? (
                <div className="h-48 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="h-32 sm:h-40 md:h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderData as any}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {genderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </section>
          
          <section className="mt-6">
            <Card title="Hall Distribution">
              {chartsLoading ? (
                <div className="h-56 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="h-40 sm:h-48 md:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hallData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis 
                        dataKey="hall" 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke="#6B7280"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #E5E7EB',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="totalStudents" fill="#3B82F6" name="Total Students" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="presentToday" fill="#10B981" name="Present Today" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="graduationReady" fill="#F59E0B" name="Graduation Ready" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>
          </section>
          <section className="mt-3 sm:mt-4 md:mt-6 grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 lg:grid-cols-2">
            <Card title="Batch Promotion">
              <div className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">From</label>
                  <select 
                    value={promotionFrom}
                    onChange={(e) => {
                      setPromotionFrom(e.target.value);
                      fetchValidTargets(e.target.value);
                    }}
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {availableLevels
                      .filter(level => level.hasStudents)
                      .map(level => (
                        <option key={level.level} value={level.level}>{level.label}</option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">To</label>
                  <select 
                    value={promotionTo}
                    onChange={(e) => setPromotionTo(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {validTargets.map(target => (
                      <option key={target} value={target}>
                        {target === 'ALUMNI' ? 'Alumni Status' : target}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3">
                <button 
                  onClick={handleBatchPromotion}
                  disabled={promotionLoading || promotionFrom === promotionTo}
                  className="w-full rounded bg-[#0E3F8E] py-2 px-3 text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-all duration-200"
                >
                  {promotionLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Promoting...
                    </div>
                  ) : (
                    'Promote Students'
                  )}
                </button>
                {lastPromotionActionId && (
                  <button 
                    onClick={handleUndoPromotion}
                    disabled={undoingPromotion}
                    className="w-full rounded bg-red-600 py-2 px-3 text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm font-medium transition-all duration-200"
                  >
                    {undoingPromotion ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Undoing...
                      </div>
                    ) : (
                      'Undo Last Promotion'
                    )}
                  </button>
                )}
              </div>
            </Card>
            <Card title="Auto-Alumni Status">
              <div className="rounded border border-yellow-200 bg-yellow-50 p-2 sm:p-3 text-xs sm:text-sm text-yellow-800">
                {alumniEligibleCount} students eligible for Alumni status
              </div>
              <button className="mt-2 sm:mt-3 w-full rounded bg-[#0E3F8E] py-2 px-3 text-white hover:opacity-95 text-xs sm:text-sm font-medium">Review & Update Status</button>
            </Card>
          </section>
        </main>
      </div>
      
      <ExportDataModal 
        isOpen={isExportModalOpen}
        onClose={closeExportModal}
        initialExportBy={exportBy}
        initialFormat={exportFormat}
      />
    </div>
  );
}

function StatIcon({ title, value, icon, iconBoxClass, valueClass }: { title: string; value: string; icon: React.ReactNode; iconBoxClass: string; valueClass?: string }){
  return (
    <div className="rounded border bg-white p-2 sm:p-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-gray-500 truncate">{title}</div>
          <div className={`mt-1 text-lg sm:text-xl md:text-2xl font-semibold ${valueClass || ''} truncate`}>{value}</div>
        </div>
        <div className={`grid h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 place-items-center rounded flex-shrink-0 ml-2 ${iconBoxClass}`}>{icon}</div>
      </div>
    </div>
  );
}

function Card({ title, children, rightAction }: { title: string; children: React.ReactNode; rightAction?: React.ReactNode }){
  return (
    <div className="rounded border bg-white p-3 sm:p-4">
      <div className="mb-2 sm:mb-3 flex items-center justify-between">
        <div className="text-sm font-semibold truncate">{title}</div>
        {rightAction}
      </div>
      {children}
    </div>
  );
}
