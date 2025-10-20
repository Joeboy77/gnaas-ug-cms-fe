import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

interface Student {
  id: string;
  code: string | null;
  fullName: string;
  email: string | null;
  phone: string | null;
  level: string;
  hall: string;
  programDurationYears: number;
  dateOfAdmission: string;
  gender: string;
  role: string;
  programOfStudy: string | null;
  expectedCompletionYear: number | null;
  dateOfBirth: string | null;
  residence: string | null;
  guardianName: string | null;
  guardianContact: string | null;
  localChurchName: string | null;
  localChurchLocation: string | null;
  district: string | null;
  profileImageUrl: string | null;
}

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  onUpdate: () => void;
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function EditStudentModal({ isOpen, onClose, student, onUpdate }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    level: '',
    hall: '',
    programDurationYears: 4,
    dateOfAdmission: '',
    gender: '',
    role: 'Member',
    programOfStudy: '',
    expectedCompletionYear: '',
    dateOfBirth: '',
    residence: '',
    guardianName: '',
    guardianContact: '',
    localChurchName: '',
    localChurchLocation: '',
    district: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        fullName: student.fullName || '',
        email: student.email || '',
        phone: student.phone || '',
        level: student.level || '',
        hall: student.hall || '',
        programDurationYears: student.programDurationYears || 4,
        dateOfAdmission: student.dateOfAdmission ? student.dateOfAdmission.split('T')[0] : '',
        gender: student.gender || '',
        role: student.role || 'Member',
        programOfStudy: student.programOfStudy || '',
        expectedCompletionYear: student.expectedCompletionYear?.toString() || '',
        dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
        residence: student.residence || '',
        guardianName: student.guardianName || '',
        guardianContact: student.guardianContact || '',
        localChurchName: student.localChurchName || '',
        localChurchLocation: student.localChurchLocation || '',
        district: student.district || ''
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API}/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          expectedCompletionYear: formData.expectedCompletionYear ? parseInt(formData.expectedCompletionYear) : null,
          programOfStudy: formData.programOfStudy || null,
          dateOfBirth: formData.dateOfBirth || null,
          residence: formData.residence || null,
          guardianName: formData.guardianName || null,
          guardianContact: formData.guardianContact || null,
          localChurchName: formData.localChurchName || null,
          localChurchLocation: formData.localChurchLocation || null,
          district: formData.district || null,
          email: formData.email || null,
          phone: formData.phone || null
        })
      });

      if (response.ok) {
        toast.success('Student updated successfully');
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update student');
      }
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Error updating student');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'programDurationYears' ? parseInt(value) : value
    }));
  };

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Edit Student
                </h3>
                <div className="mt-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select Gender</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Level</label>
                        <select
                          name="level"
                          value={formData.level}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Hall</label>
                        <select
                          name="hall"
                          value={formData.hall}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value="">Select Hall</option>
                          <option value="Akuafo Hall">Akuafo Hall</option>
                          <option value="Commonwealth Hall">Commonwealth Hall</option>
                          <option value="Legon Hall">Legon Hall</option>
                          <option value="Mensah Sarbah Hall">Mensah Sarbah Hall</option>
                          <option value="Volta Hall">Volta Hall</option>
                          <option value="International Students Hostel">International Students Hostel</option>
                          <option value="Pentagon Hall">Pentagon Hall</option>
                          <option value="Sarbah Hall">Sarbah Hall</option>
                          <option value="Valco Trust Fund Hostel">Valco Trust Fund Hostel</option>
                          <option value="Off Campus">Off Campus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Program Duration (Years)</label>
                        <select
                          name="programDurationYears"
                          value={formData.programDurationYears}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        >
                          <option value={4}>4 Years</option>
                          <option value={6}>6 Years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Admission</label>
                        <input
                          type="date"
                          name="dateOfAdmission"
                          value={formData.dateOfAdmission}
                          onChange={handleChange}
                          required
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Additional Information</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Program of Study</label>
                          <input
                            type="text"
                            name="programOfStudy"
                            value={formData.programOfStudy}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. Computer Science"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Expected Completion Year</label>
                          <input
                            type="number"
                            name="expectedCompletionYear"
                            value={formData.expectedCompletionYear}
                            onChange={handleChange}
                            min="1900"
                            max="2100"
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. 2027"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Place of Residence</label>
                          <input
                            type="text"
                            name="residence"
                            value={formData.residence}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. Madina"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Parent/Guardian Name</label>
                          <input
                            type="text"
                            name="guardianName"
                            value={formData.guardianName}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Parent/Guardian Contact</label>
                          <input
                            type="tel"
                            name="guardianContact"
                            value={formData.guardianContact}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. +233 XX XXX XXXX"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Local Church Name</label>
                          <input
                            type="text"
                            name="localChurchName"
                            value={formData.localChurchName}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. Legon SDA"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Local Church Location</label>
                          <input
                            type="text"
                            name="localChurchLocation"
                            value={formData.localChurchLocation}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. Legon"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">District</label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. Accra North"
                          />
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating...' : 'Update Student'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
