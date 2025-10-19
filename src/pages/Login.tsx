import { useState } from 'react';
import logo from '../assets/gnaasug.png';
import { useAuthStore } from '../store/auth';
import toast from 'react-hot-toast';

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function Login() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SECRETARY' | 'SUPER_ADMIN'>('SECRETARY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Login failed');
      if (role === 'SECRETARY' && data?.user?.role !== 'SECRETARY') throw new Error('Not a Secretary account');
      if (role === 'SUPER_ADMIN' && data?.user?.role !== 'SUPER_ADMIN') throw new Error('Not a Super Admin account');
      setAuth(data.token, data.user.role, data.user);
      toast.success('Signed in successfully');
      window.location.href = data.user.role === 'SUPER_ADMIN' ? '/admin' : '/secretary';
      console.log(data);
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-[#0d3b84] text-white shadow-xl">
        <div className="flex flex-col items-center p-6">
          <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow">
            <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          </div>
          <h1 className="mt-4 text-xl font-semibold">{role === 'SECRETARY' ? 'Secretary' : 'Super Admin'}</h1>
          <p className="mt-1 text-xs text-blue-100">Access your {role === 'SECRETARY' ? 'Secretary' : 'Admin'} dashboard</p>
          <div className="mt-4 inline-flex rounded-md bg-white/10 p-1 text-sm">
            <button onClick={() => setRole('SECRETARY')} className={`px-3 py-1 rounded ${role === 'SECRETARY' ? 'bg-white text-[#0d3b84]' : 'text-white'}`}>Secretary</button>
            <button onClick={() => setRole('SUPER_ADMIN')} className={`px-3 py-1 rounded ${role === 'SUPER_ADMIN' ? 'bg-white text-[#0d3b84]' : 'text-white'}`}>Super Admin</button>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          {error && <div className="rounded bg-red-100 p-2 text-red-700">{error}</div>}
          <div>
            <label className="mb-1 block text-xs">Email Address</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="admin@example.com" className="w-full rounded border border-white/20 bg-white/95 p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
          </div>
          <div>
            <label className="mb-1 block text-xs">Password</label>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Enter your password" className="w-full rounded border border-white/20 bg-white/95 p-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white" />
          </div>
          <div className="flex items-center gap-2 text-xs">
            <input id="remember" type="checkbox" className="h-4 w-4 rounded border-white/30 bg-white/20 text-blue-600" />
            <label htmlFor="remember">Remember me</label>
          </div>
          <button disabled={loading} className="w-full rounded bg-white py-2 font-medium text-[#0d3b84] shadow hover:bg-blue-50 disabled:opacity-60">{loading ? 'Signing in...' : 'Sign In'}</button>
        </form>
      </div>
    </div>
  );
}
