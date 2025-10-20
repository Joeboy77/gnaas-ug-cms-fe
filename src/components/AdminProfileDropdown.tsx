import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

interface AdminProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SecretaryFormData {
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  level: string;
  programOfStudy: string;
  programDurationYears: number;
  expectedCompletionYear: string;
  hall: string;
  gender: string;
  role: string;
  dateOfAdmission: string;
  dateOfBirth: string;
  residence: string;
  guardianName: string;
  guardianContact: string;
  localChurchName: string;
  localChurchLocation: string;
  district: string;
  profileImageUrl: string;
  password: string;
  confirmPassword: string;
}

export default function AdminProfileDropdown({ isOpen, onClose }: AdminProfileDropdownProps) {
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'add-secretary'>('profile');
  const [loading, setLoading] = useState(false);
  const [secretaryForm, setSecretaryForm] = useState<SecretaryFormData>({
    fullName: '',
    email: '',
    phone: '',
    studentId: '',
    level: '',
    programOfStudy: '',
    programDurationYears: 4,
    expectedCompletionYear: '',
    hall: '',
    gender: '',
    role: 'Member',
    dateOfAdmission: '',
    dateOfBirth: '',
    residence: '',
    guardianName: '',
    guardianContact: '',
    localChurchName: '',
    localChurchLocation: '',
    district: '',
    profileImageUrl: '',
    password: '',
    confirmPassword: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    onClose();
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API}/auth/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        notificationService.custom('success', 'Password Updated', 'Your password has been changed successfully');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setActiveTab('profile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSecretary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (secretaryForm.password !== secretaryForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (secretaryForm.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!secretaryForm.fullName.trim() || !secretaryForm.email.trim() || !secretaryForm.phone.trim() || 
        !secretaryForm.studentId.trim() || !secretaryForm.level || !secretaryForm.hall || 
        !secretaryForm.gender || !secretaryForm.role || !secretaryForm.programDurationYears || !secretaryForm.dateOfAdmission) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API}/admin/secretaries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useAuthStore.getState().token}`
        },
        body: JSON.stringify({
          fullName: secretaryForm.fullName.trim(),
          email: secretaryForm.email.trim(),
          phone: secretaryForm.phone.trim(),
          studentId: secretaryForm.studentId.trim(),
          level: secretaryForm.level,
          programOfStudy: secretaryForm.programOfStudy.trim(),
          programDurationYears: secretaryForm.programDurationYears,
          expectedCompletionYear: secretaryForm.expectedCompletionYear ? parseInt(secretaryForm.expectedCompletionYear) : null,
          hall: secretaryForm.hall,
          gender: secretaryForm.gender,
          role: secretaryForm.role,
          dateOfAdmission: secretaryForm.dateOfAdmission,
          dateOfBirth: secretaryForm.dateOfBirth || null,
          residence: secretaryForm.residence.trim() || null,
          guardianName: secretaryForm.guardianName.trim() || null,
          guardianContact: secretaryForm.guardianContact.trim() || null,
          localChurchName: secretaryForm.localChurchName.trim() || null,
          localChurchLocation: secretaryForm.localChurchLocation.trim() || null,
          district: secretaryForm.district.trim() || null,
          profileImageUrl: secretaryForm.profileImageUrl.trim(),
          password: secretaryForm.password
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Secretary ${result.user.fullName} created successfully`);
        notificationService.custom('success', 'Secretary Added', `Secretary ${result.user.fullName} has been created`);
        setSecretaryForm({ 
          fullName: '', 
          email: '', 
          phone: '',
          studentId: '',
          level: '',
          programOfStudy: '',
          programDurationYears: 4,
          expectedCompletionYear: '',
          hall: '',
          gender: '',
          role: 'Member',
          dateOfAdmission: '',
          dateOfBirth: '',
          residence: '',
          guardianName: '',
          guardianContact: '',
          localChurchName: '',
          localChurchLocation: '',
          district: '',
          profileImageUrl: '',
          password: '', 
          confirmPassword: '' 
        });
        setActiveTab('profile');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create secretary');
      }
    } catch (error) {
      console.error('Add secretary error:', error);
      toast.error('Error creating secretary');
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setSecretaryForm({ 
      fullName: '', 
      email: '', 
      phone: '',
      studentId: '',
      level: '',
      programOfStudy: '',
      programDurationYears: 4,
      expectedCompletionYear: '',
      hall: '',
      gender: '',
      role: 'Member',
      dateOfAdmission: '',
      dateOfBirth: '',
      residence: '',
      guardianName: '',
      guardianContact: '',
      localChurchName: '',
      localChurchLocation: '',
      district: '',
      profileImageUrl: '',
      password: '', 
      confirmPassword: '' 
    });
  };

  const handleTabChange = (tab: 'profile' | 'password' | 'add-secretary') => {
    setActiveTab(tab);
    resetForms();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown - Mobile: Full screen modal, Desktop: Dropdown */}
      <div className="fixed inset-x-0 bottom-0 sm:absolute sm:right-0 sm:top-full sm:bottom-auto sm:mt-2 sm:w-80 md:w-96 sm:max-w-sm bg-white sm:rounded-lg shadow-lg border z-50 sm:max-h-[calc(100vh-8rem)] sm:overflow-y-auto">
        {/* Mobile Header */}
        <div className="sm:hidden p-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-200 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden sm:block p-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-base">
                {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-gray-900 truncate">
                {user?.fullName || 'Super Admin'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.email || 'admin@gnaasug.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => handleTabChange('profile')}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => handleTabChange('password')}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium ${
              activeTab === 'password'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => handleTabChange('add-secretary')}
            className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium ${
              activeTab === 'add-secretary'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Add Secretary
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-4 max-h-[calc(100vh-12rem)] sm:max-h-none overflow-y-auto">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              {/* Mobile Profile Info */}
              <div className="sm:hidden bg-gray-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-gray-900">{user?.fullName || 'Super Admin'}</h3>
                    <p className="text-sm text-gray-500">{user?.email || 'admin@gnaasug.com'}</p>
                    <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                      SUPER_ADMIN
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop Profile Info */}
              <div className="hidden sm:block text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-xl">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <h3 className="text-base font-medium text-gray-900">{user?.fullName || 'Super Admin'}</h3>
                <p className="text-sm text-gray-500">{user?.email || 'admin@gnaasug.com'}</p>
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  SUPER_ADMIN
                </span>
              </div>
              
              <div className="pt-4 border-t">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={6}
                />
              </div>
              
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'add-secretary' && (
            <form onSubmit={handleAddSecretary} className="space-y-4">
              {/* Personal Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Personal Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={secretaryForm.fullName}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Student ID *
                    </label>
                    <input
                      type="text"
                      value={secretaryForm.studentId}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student ID"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={secretaryForm.email}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={secretaryForm.phone}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    value={secretaryForm.profileImageUrl}
                    onChange={(e) => setSecretaryForm(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter profile image URL (optional)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This image will be displayed in the secretary's navbar profile area
                  </p>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Academic Information</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Level *
                    </label>
                    <select
                      value={secretaryForm.level}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, level: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select level</option>
                      <option value="L100">L100</option>
                      <option value="L200">L200</option>
                      <option value="L300">L300</option>
                      <option value="L400">L400</option>
                      <option value="L500">L500</option>
                      <option value="L600">L600</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Hall *
                    </label>
                    <select
                      value={secretaryForm.hall}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, hall: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select hall</option>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      value={secretaryForm.gender}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, gender: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Program Duration *
                    </label>
                    <select
                      value={secretaryForm.programDurationYears}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, programDurationYears: parseInt(e.target.value) }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Duration</option>
                      {[1,2,3,4,5,6].map(y => (
                        <option key={y} value={y}>{y} year{y > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Program of Study
                    </label>
                    <input
                      type="text"
                      value={secretaryForm.programOfStudy}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, programOfStudy: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Expected Completion Year
                    </label>
                    <input
                      type="number"
                      min="1900"
                      max="2100"
                      value={secretaryForm.expectedCompletionYear}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, expectedCompletionYear: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. 2027"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Role *
                    </label>
                    <select
                      value={secretaryForm.role}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, role: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Member">Member</option>
                      <option value="Visitor">Visitor</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={secretaryForm.dateOfBirth}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Date of Admission *
                  </label>
                  <input
                    type="date"
                    value={secretaryForm.dateOfAdmission}
                    onChange={(e) => setSecretaryForm(prev => ({ ...prev, dateOfAdmission: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Additional Information</h4>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Place of Residence
                  </label>
                  <input
                    type="text"
                    value={secretaryForm.residence}
                    onChange={(e) => setSecretaryForm(prev => ({ ...prev, residence: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Madina"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Name
                    </label>
                    <input
                      type="text"
                      value={secretaryForm.guardianName}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, guardianName: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Parent/Guardian Contact
                    </label>
                    <input
                      type="tel"
                      value={secretaryForm.guardianContact}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, guardianContact: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. +233 XX XXX XXXX"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Local Church Name
                    </label>
                    <input
                      type="text"
                      value={secretaryForm.localChurchName}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, localChurchName: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Legon SDA"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Local Church Location
                    </label>
                    <input
                      type="text"
                      value={secretaryForm.localChurchLocation}
                      onChange={(e) => setSecretaryForm(prev => ({ ...prev, localChurchLocation: e.target.value }))}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g. Legon"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={secretaryForm.district}
                    onChange={(e) => setSecretaryForm(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g. Accra North"
                  />
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 border-b pb-2">Account Information</h4>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={secretaryForm.password}
                    onChange={(e) => setSecretaryForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password (min 6 characters)"
                    required
                    minLength={6}
                  />
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={secretaryForm.confirmPassword}
                    onChange={(e) => setSecretaryForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm password"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-2 sm:p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Note:</strong> The secretary will be required to change their password on first login for security purposes.
                </p>
              </div>
              
              <div className="flex space-x-2 sm:space-x-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating...' : 'Create Secretary'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
