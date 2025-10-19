import logo from '../assets/gnaasug.png';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth';
import NotificationDropdown from '../components/NotificationDropdown';
import { notificationService } from '../services/notificationService';
import UserInfoModal from '../components/UserInfoModal';
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

export default function SecretaryDashboard(){
  const token = useAuthStore((s) => s.token);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    level: '',
    hall: '',
    role: '',
    status: ''
  });
  
  // Modal states
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Modal handlers
  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsUserInfoModalOpen(true);
  };

  const handleViewClick = (student: Student, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(student);
    setIsUserInfoModalOpen(true);
  };

  const closeUserInfoModal = () => {
    setIsUserInfoModalOpen(false);
    setSelectedStudent(null);
  };

  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API}/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStudents(data);
        setFilteredStudents(data);
      } else {
        notificationService.systemError('Failed to fetch students from server');
      }
    } catch (e) {
      console.error('Failed to fetch students:', e);
      notificationService.systemError('Network error while fetching students');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = students;

    // Apply search filter
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase();
      filtered = filtered.filter(student => (
        (student.fullName || '').toLowerCase().includes(searchTerm) ||
        (student.level || '').toLowerCase().includes(searchTerm) ||
        (student.hall || '').toLowerCase().includes(searchTerm) ||
        (student.gender || '').toLowerCase().includes(searchTerm) ||
        (student.code || '').toLowerCase().includes(searchTerm) ||
        (student.role || '').toLowerCase().includes(searchTerm)
      ));
    }

    // Apply dropdown filters
    if (filters.level) {
      filtered = filtered.filter(student => student.level === filters.level);
    }
    if (filters.hall) {
      filtered = filtered.filter(student => student.hall === filters.hall);
    }
    if (filters.role) {
      filtered = filtered.filter(student => student.role === filters.role);
    }
    if (filters.status) {
      filtered = filtered.filter(() => {
        // For now, all students are "Active" - you can modify this logic based on your status field
        return filters.status === 'Active';
      });
    }

    setFilteredStudents(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Apply filters whenever search query or filters change
  useEffect(() => {
    applyFilters();
  }, [searchQuery, filters, students]);

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token]);

  useEffect(() => {
    if (students.length > 0) {
      setFilteredStudents(students);
    }
  }, [students]);
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white px-3 py-3 sm:px-4">
        <div className="mx-auto max-w-7xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/secretary" className="cursor-pointer">
              <img src={logo} alt="GNAASUG" className="h-10 w-10 object-contain sm:h-12 sm:w-12 hover:opacity-80 transition-opacity"/>
            </Link>
            <div>
              <div className="text-sm font-semibold sm:text-base">Secretary Dashboard</div>
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
        <section className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/secretary/students/new"><QuickAction colorBox="bg-[#E7F3FF] border border-[#E5E7EB] text-[#0E3F8E]" icon={
            <span className="text-xl">＋</span>
          } title="Add New Student" subtitle="Register new member"/></Link>
          <Link to="/secretary/attendance"><QuickAction colorBox="bg-[#E8F7EE] border border-[#E5E7EB] text-[#16A34A]" icon={
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#16A34A" className="h-5 w-5"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
          } title="Mark Attendance" subtitle="Members & Visitors"/></Link>
          <Link to="/secretary/weekly-attendance"><QuickAction colorBox="bg-[#F3E8FF] border border-[#E5E7EB] text-[#7C3AED]" icon={
            <span className="text-lg">📅</span>
          } title="Weekly Attendance" subtitle="View reports"/></Link>
        </section>
        <section className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input 
              placeholder="Search by Name, Level, Hall, Gender, Student ID..." 
              className="w-full rounded border bg-white p-3 text-sm sm:p-4 sm:text-base"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <button 
              onClick={() => handleSearch('')}
              className="rounded bg-gray-500 px-4 py-3 text-sm font-medium text-white hover:bg-gray-600 sm:px-6 sm:text-base"
            >
              Clear
            </button>
          </div>
        </section>
        <section className="mt-6 rounded border bg-white">
          <div className="flex items-center justify-between px-4 py-3 text-base font-semibold">Student List</div>
          
          <div className="flex flex-wrap gap-2 px-3 py-3 border-b bg-gray-50 sm:gap-4 sm:px-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">Level:</label>
              <select 
                value={filters.level} 
                onChange={(e) => handleFilterChange('level', e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:text-sm"
              >
                <option value="">All Levels</option>
                <option value="L100">L100</option>
                <option value="L200">L200</option>
                <option value="L300">L300</option>
                <option value="L400">L400</option>
                <option value="L500">L500</option>
                <option value="L600">L600</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">Hall:</label>
              <select 
                value={filters.hall} 
                onChange={(e) => handleFilterChange('hall', e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:text-sm"
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
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">Role:</label>
              <select 
                value={filters.role} 
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:text-sm"
              >
                <option value="">All Roles</option>
                <option value="Member">Member</option>
                <option value="Visitor">Visitor</option>
              </select>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <label className="text-xs font-medium text-gray-700 sm:text-sm">Status:</label>
              <select 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:text-sm"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Alumni">Alumni</option>
              </select>
            </div>
            
            <button 
              onClick={() => {
                setFilters({ level: '', hall: '', role: '', status: '' });
                setSearchQuery('');
              }}
              className="ml-auto rounded bg-gray-500 px-3 py-1 text-xs text-white hover:bg-gray-600 sm:px-4 sm:text-sm"
            >
              Clear All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm sm:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 sm:px-4 sm:py-3"></th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Name</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Level</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Hall</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Gender</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Role</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Status</th>
                  <th className="px-2 py-2 sm:px-4 sm:py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-sm text-gray-500 sm:px-4 sm:text-base">Loading students...</td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-2 py-8 text-center text-sm text-gray-500 sm:px-4 sm:text-base">
                      {searchQuery ? `No students found matching "${searchQuery}"` : "No students found. Add your first student!"}
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleStudentClick(student)}
                    >
                      <td className="px-2 py-3 sm:px-4 sm:py-4">
                        <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200 sm:h-12 sm:w-12">
                          {student.profileImageUrl ? (
                            <img 
                              src={student.profileImageUrl} 
                              alt={student.fullName}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`h-full w-full flex items-center justify-center text-gray-400 ${student.profileImageUrl ? 'hidden' : ''}`}>
                            <span className="text-sm sm:text-xl">👤</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3 sm:px-4 sm:py-4">
                        <div className="text-sm font-medium sm:text-base">{student.fullName}</div>
                        <div className="text-xs text-gray-500 sm:text-sm">ID: {student.code}</div>
                      </td>
                      <td className="px-2 py-3 text-sm sm:px-4 sm:py-4 sm:text-base">{student.level}</td>
                      <td className="px-2 py-3 text-sm sm:px-4 sm:py-4 sm:text-base">{student.hall}</td>
                      <td className="px-2 py-3 text-sm sm:px-4 sm:py-4 sm:text-base">{student.gender}</td>
                      <td className="px-2 py-3 sm:px-4 sm:py-4"><Badge>{student.role}</Badge></td>
                      <td className="px-2 py-3 sm:px-4 sm:py-4"><Badge color="green">Active</Badge></td>
                      <td className="px-2 py-3 sm:px-4 sm:py-4">
                        <button 
                          onClick={(e) => handleViewClick(student, e)}
                          className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700 transition-colors sm:px-4 sm:py-2 sm:text-sm"
                        >
                          👁️ View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="text-xs text-gray-600 sm:text-sm">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1 sm:gap-2">
                <button 
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-base"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`rounded border px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-base ${
                        currentPage === pageNum 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="rounded border px-2 py-1 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 sm:px-4 sm:py-2 sm:text-base"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      
      {/* Modals */}
      <UserInfoModal 
        student={selectedStudent}
        isOpen={isUserInfoModalOpen}
        onClose={closeUserInfoModal}
      />
      
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
      />
    </div>
  );
}

function QuickAction({ icon, title, subtitle, colorBox = 'bg-blue-50 border border-[#E5E7EB] text-blue-700' }: { icon: React.ReactNode; title: string; subtitle: string; colorBox?: string }){
  return (
    <div className="flex items-start gap-3 rounded border bg-white p-3 sm:p-4">
      <div className={`flex h-8 w-8 items-center justify-center rounded sm:h-10 sm:w-10 ${colorBox}`}>{icon}</div>
      <div>
        <div className="text-sm font-semibold sm:text-base">{title}</div>
        <div className="text-xs text-gray-500 sm:text-sm">{subtitle}</div>
      </div>
    </div>
  );
}

function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: 'blue' | 'green' | 'gray' }){
  const map = { blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700', gray: 'bg-gray-100 text-gray-600' } as const;
  return <span className={`rounded px-2 py-1 text-xs ${map[color]}`}>{children}</span>;
}

