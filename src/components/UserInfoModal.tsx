import { formatDistanceToNow } from 'date-fns';

interface Student {
  id: string;
  code: string | null;
  fullName: string;
  gender: string;
  level: string;
  programOfStudy: string | null;
  programDurationYears: number;
  expectedCompletionYear: number | null;
  hall: string;
  role: string;
  dateOfAdmission: string;
  dateOfBirth: string | null;
  residence: string | null;
  guardianName: string | null;
  guardianContact: string | null;
  localChurchName: string | null;
  localChurchLocation: string | null;
  district: string | null;
  email: string | null;
  phone: string | null;
  profileImageUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface UserInfoModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserInfoModal({ student, isOpen, onClose }: UserInfoModalProps) {
  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">Student Information</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Profile Section */}
          <div className="mb-6 flex flex-col items-center border-b border-gray-200 pb-6 sm:flex-row sm:items-start sm:space-x-6">
            <div className="mb-4 sm:mb-0">
              <div className="h-24 w-24 overflow-hidden rounded-full bg-gray-200 sm:h-32 sm:w-32">
                {student.profileImageUrl ? (
                  <img 
                    src={student.profileImageUrl} 
                    alt={student.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-2xl text-gray-500 sm:text-4xl">
                    {student.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-xl font-semibold text-gray-900 sm:text-2xl">{student.fullName}</h3>
              <p className="text-sm text-gray-600 sm:text-base">ID: {student.code}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {student.role}
                </span>
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Personal Information */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">Personal Information</h4>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Full Name:</span>
                  <p className="text-sm font-medium text-gray-900">{student.fullName}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Gender:</span>
                  <p className="text-sm font-medium text-gray-900">{student.gender}</p>
                </div>
                {student.dateOfBirth && (
                  <div>
                    <span className="text-xs text-gray-500">Date of Birth:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(student.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {student.residence && (
                  <div>
                    <span className="text-xs text-gray-500">Place of Residence:</span>
                    <p className="text-sm font-medium text-gray-900">{student.residence}</p>
                  </div>
                )}
                {student.email && (
                  <div>
                    <span className="text-xs text-gray-500">Email:</span>
                    <p className="text-sm font-medium text-gray-900">{student.email}</p>
                  </div>
                )}
                {student.phone && (
                  <div>
                    <span className="text-xs text-gray-500">Phone:</span>
                    <p className="text-sm font-medium text-gray-900">{student.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Academic Information */}
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">Academic Information</h4>
              <div className="mt-3 space-y-2">
                <div>
                  <span className="text-xs text-gray-500">Level:</span>
                  <p className="text-sm font-medium text-gray-900">{student.level}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500">Hall:</span>
                  <p className="text-sm font-medium text-gray-900">{student.hall}</p>
                </div>
                {student.programOfStudy && (
                  <div>
                    <span className="text-xs text-gray-500">Program of Study:</span>
                    <p className="text-sm font-medium text-gray-900">{student.programOfStudy}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">Program Duration:</span>
                  <p className="text-sm font-medium text-gray-900">{student.programDurationYears} year{student.programDurationYears > 1 ? 's' : ''}</p>
                </div>
                {student.expectedCompletionYear && (
                  <div>
                    <span className="text-xs text-gray-500">Expected Completion Year:</span>
                    <p className="text-sm font-medium text-gray-900">{student.expectedCompletionYear}</p>
                  </div>
                )}
                <div>
                  <span className="text-xs text-gray-500">Date of Admission:</span>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(student.dateOfAdmission).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            {(student.guardianName || student.guardianContact) && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-900">Guardian Information</h4>
                <div className="mt-3 space-y-2">
                  {student.guardianName && (
                    <div>
                      <span className="text-xs text-gray-500">Guardian Name:</span>
                      <p className="text-sm font-medium text-gray-900">{student.guardianName}</p>
                    </div>
                  )}
                  {student.guardianContact && (
                    <div>
                      <span className="text-xs text-gray-500">Guardian Contact:</span>
                      <p className="text-sm font-medium text-gray-900">{student.guardianContact}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Church Information */}
            {(student.localChurchName || student.localChurchLocation || student.district) && (
              <div className="rounded-lg bg-gray-50 p-4">
                <h4 className="text-sm font-medium text-gray-900">Church Information</h4>
                <div className="mt-3 space-y-2">
                  {student.localChurchName && (
                    <div>
                      <span className="text-xs text-gray-500">Local Church Name:</span>
                      <p className="text-sm font-medium text-gray-900">{student.localChurchName}</p>
                    </div>
                  )}
                  {student.localChurchLocation && (
                    <div>
                      <span className="text-xs text-gray-500">Church Location:</span>
                      <p className="text-sm font-medium text-gray-900">{student.localChurchLocation}</p>
                    </div>
                  )}
                  {student.district && (
                    <div>
                      <span className="text-xs text-gray-500">District:</span>
                      <p className="text-sm font-medium text-gray-900">{student.district}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* System Information */}
          {(student.createdAt || student.updatedAt) && (
            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-medium text-gray-900">System Information</h4>
              <div className="mt-3 space-y-2">
                {student.createdAt && (
                  <div>
                    <span className="text-xs text-gray-500">Created:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDistanceToNow(new Date(student.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
                {student.updatedAt && (
                  <div>
                    <span className="text-xs text-gray-500">Last Updated:</span>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDistanceToNow(new Date(student.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-gray-200 p-4 sm:p-6">
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
