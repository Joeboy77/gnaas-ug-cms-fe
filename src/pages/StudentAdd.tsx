import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';
import logo from '../assets/gnaasug.png';
import { notificationService } from '../services/notificationService';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function StudentAdd() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [nextCode, setNextCode] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: '',
    gender: '',
    level: '',
    programDurationYears: '',
    hall: '',
    role: '',
    dateOfAdmission: '',
    phone: '',
    email: '',
    profileImageUrl: '',
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onPickImage = () => {
    console.log('onPickImage called');
    fileInputRef.current?.click();
  };
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('onFileChange called', e.target.files);
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    console.log('File selected:', file.name, file.type);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      console.log('File read successfully, setting preview');
      setImagePreview(dataUrl);
      setForm({ ...form, profileImageUrl: dataUrl });
    };
    reader.onerror = () => {
      console.error('Error reading file');
    };
    reader.readAsDataURL(file);
  };

  const onImageUrlSubmit = () => {
    if (imageUrl.trim()) {
      setImagePreview(imageUrl);
      setForm({ ...form, profileImageUrl: imageUrl });
      setShowImageModal(false);
      setImageUrl('');
    }
  };

  const onRemoveImage = () => {
    setImagePreview('');
    setForm({ ...form, profileImageUrl: '' });
  };

  const loadNextCode = async () => {
    try {
      const res = await fetch(`${API}/students/next-code`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data?.code) setNextCode(data.code);
    } catch {}
  };

  useEffect(() => {
    if (token) loadNextCode();
  }, [token]);

  const submit = async (closeAfter: boolean) => {
    if (!form.fullName || !form.gender || !form.level || !form.programDurationYears || !form.hall || !form.role || !form.dateOfAdmission) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...form,
          programDurationYears: Number(form.programDurationYears),
          profileImageUrl: form.profileImageUrl || null,
          phone: form.phone || null,
          email: form.email || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Failed to add student');
      toast.success('Student added successfully');
      
      notificationService.studentAdded(form.fullName, data.id || 'unknown');
      
      if (closeAfter) navigate('/secretary');
      else {
        setForm({ ...form, fullName: '', phone: '', email: '', profileImageUrl: '' });
        setImagePreview('');
        await loadNextCode();
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to add student');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-3">
            <img src={logo} alt="GNAASUG" className="h-10 w-10 sm:h-12 sm:w-12" />
            <h1 className="text-base font-bold text-gray-900 sm:text-lg">Add New Student</h1>
          </div>
          <div className="flex items-center justify-between sm:space-x-3">
            <span className="text-xs text-gray-600 sm:text-sm">Secretary Dashboard</span>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">S</span>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-3 sm:p-4 md:p-6">
        <div className="rounded border bg-white p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-base font-semibold sm:text-lg">Add New Student</div>
              <div className="text-xs text-gray-500 sm:text-sm">Fill in the student information below to add them to the system</div>
            </div>
            <div className="rounded bg-gray-100 px-3 py-2 text-xs text-gray-600 sm:text-sm">Auto ID: {nextCode || 'Loading...'}</div>
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="relative">
              <button type="button" onClick={() => setShowImageModal(true)} className="grid h-24 w-24 place-items-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 overflow-hidden sm:h-32 sm:w-32 md:h-36 md:w-36">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover"/>
                ) : (
                  <span className="text-lg text-gray-400 sm:text-xl md:text-2xl">📷</span>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => setShowImageModal(true)}
                className="absolute bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-[#0E3F8E] text-white text-lg border-2 border-white shadow hover:bg-blue-700 sm:bottom-2 sm:-right-2 sm:h-10 sm:w-10 sm:text-xl sm:border-4"
              >
                +
              </button>
              {imagePreview && (
                <button 
                  type="button" 
                  onClick={onRemoveImage}
                  className="absolute top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-red-500 text-white text-xs border-2 border-white shadow hover:bg-red-600 sm:top-2 sm:-right-2 sm:h-6 sm:w-6 sm:text-sm"
                >
                  ×
                </button>
              )}
              <input 
                ref={fileInputRef} 
                onChange={onFileChange} 
                type="file" 
                accept="image/*" 
                className="hidden"
                key={imagePreview ? 'with-image' : 'no-image'}
              />
            </div>
            <div className="mt-3 text-sm text-gray-600 sm:text-base">Upload Profile Image (Optional)</div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium">Full Name<span className="text-red-500">*</span></label>
              <input name="fullName" value={form.fullName} onChange={onChange} placeholder="Enter first and last name" className="w-full rounded border p-3 text-sm sm:text-base" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Gender<span className="text-red-500">*</span></label>
              <select name="gender" value={form.gender} onChange={onChange} className="w-full rounded border p-3 text-sm sm:text-base">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Level<span className="text-red-500">*</span></label>
              <select name="level" value={form.level} onChange={onChange} className="w-full rounded border p-3 text-sm sm:text-base">
                <option value="">Select Level</option>
                {['L100','L200','L300','L400','L500','L600'].map(l=> <option key={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Program Duration<span className="text-red-500">*</span></label>
              <select name="programDurationYears" value={form.programDurationYears} onChange={onChange} className="w-full rounded border p-3 text-sm sm:text-base">
                <option value="">Select Duration</option>
                {[1,2,3,4,5,6].map(y=> <option key={y} value={y}>{y} year{y>1?'s':''}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Hall<span className="text-red-500">*</span></label>
              <select name="hall" value={form.hall} onChange={onChange} className="w-full rounded border p-3 text-sm sm:text-base">
                <option value="">Select Hall</option>
                {[
                  'Legon',
                  'Akuafo',
                  'Commonwealth',
                  'Mensah Sarbah',
                  'Volta',
                  'Alexander Adum Kwapong',
                  'Elizabeth Frances Sey',
                  'Hilla Limann',
                  'Jean Nelson Aka',
                  'Jubilee',
                  'Valco Trust',
                  'International Students I',
                  'International Students II',
                  'Diamond Jubilee',
                  'Pent',
                  'Bani',
                  'Evandy',
                  'TF',
                  'Non Resident',
                ].map(h=> <option key={h}>{h}</option>)}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Role<span className="text-red-500">*</span></label>
              <select name="role" value={form.role} onChange={onChange} className="w-full rounded border p-3 text-sm sm:text-base">
                <option value="">Select Role</option>
                <option>Member</option>
                <option>Visitor</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Date of Admission<span className="text-red-500">*</span></label>
              <input name="dateOfAdmission" type="date" value={form.dateOfAdmission} onChange={onChange} className="w-full rounded border p-3 text-sm sm:text-base" />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Phone Number</label>
              <input name="phone" value={form.phone} onChange={onChange} placeholder="+233 XX XXX XXXX" className="w-full rounded border p-3 text-sm sm:text-base" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={onChange} placeholder="student@example.com" className="w-full rounded border p-3 text-sm sm:text-base" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <button 
              onClick={() => submit(false)} 
              disabled={submitting} 
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0E3F8E] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60 sm:gap-3 sm:px-6 sm:py-4 sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5"><path d="M3.5 2A1.5 1.5 0 002 3.5v13A1.5 1.5 0 003.5 18h13a1.5 1.5 0 001.5-1.5V6.914a1.5 1.5 0 00-.44-1.06L14.146 2.44A1.5 1.5 0 0013.085 2H3.5zM5 4.5h6A.5.5 0 0111.5 5v2a.5.5 0 01-.5.5H5A.5.5 0 014.5 7V5a.5.5 0 01.5-.5zM5 11h10v4H5v-4z"/></svg>
              <span>Save & Add New</span>
            </button>
            <button 
              onClick={() => submit(true)} 
              disabled={submitting} 
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60 sm:gap-3 sm:px-6 sm:py-4 sm:text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0L3.293 9.957a1 1 0 111.414-1.414l3.043 3.043 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
              <span>Save & Close</span>
            </button>
            <Link 
              to="/secretary" 
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-95 sm:col-span-2 sm:gap-3 sm:px-6 sm:py-4 sm:text-base lg:col-span-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 sm:h-5 sm:w-5"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
              <span>Cancel</span>
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded border bg-white p-4 sm:p-5">
          <div className="text-sm font-semibold sm:text-base">Preview Before Save</div>
          <div className="mt-3 rounded border p-3 text-sm text-gray-600 sm:p-4 sm:text-base">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-gray-100 sm:h-16 sm:w-16">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="h-full w-full object-cover"/>
                ) : (
                  <span className="text-sm text-gray-400 sm:text-lg">📷</span>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-semibold text-gray-900 sm:text-lg">{form.fullName || 'Student Name'}</div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 sm:px-3 sm:text-sm">{form.role || 'Member'}</span>
                  <span className="text-xs text-gray-500 sm:text-sm">{(form.level || 'L100')} • {(form.hall || 'Akuafo')}</span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">ID: {nextCode || '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Image URL Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-xl sm:p-6">
            <div className="mb-4">
              <h3 className="text-base font-semibold sm:text-lg">Add Image URL</h3>
              <p className="text-xs text-gray-600 sm:text-sm">Enter the URL of the profile image</p>
            </div>
            <div className="mb-4">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full rounded border p-3 text-sm sm:text-base"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={onImageUrlSubmit}
                className="flex-1 rounded bg-[#0E3F8E] px-4 py-2 text-sm text-white hover:bg-blue-700 sm:text-base"
              >
                Add Image
              </button>
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                }}
                className="flex-1 rounded bg-gray-500 px-4 py-2 text-sm text-white hover:bg-gray-600 sm:text-base"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

