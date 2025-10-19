/// <reference types="jest" />

describe('Auth Store Integration Test', () => {
  it('should login and get real token from backend', async () => {
    // Test real login flow
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gnaasug.com',
        password: 'admin123',
        role: 'SUPER_ADMIN'
      })
    });

    expect(loginResponse.ok).toBe(true);
    const loginData = await loginResponse.json();
    expect(loginData.token).toBeDefined();
    expect(loginData.user).toBeDefined();
    expect(loginData.user.role).toBe('SUPER_ADMIN');
  }, 10000);

  it('should fetch students with real token', async () => {
    // First login
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gnaasug.com',
        password: 'admin123',
        role: 'SUPER_ADMIN'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Then fetch students
    const studentsResponse = await fetch('http://localhost:4000/students', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(studentsResponse.ok).toBe(true);
    const students = await studentsResponse.json();
    expect(Array.isArray(students)).toBe(true);
  }, 10000);

  it('should fetch attendance summary with real token', async () => {
    // First login
    const loginResponse = await fetch('http://localhost:4000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@gnaasug.com',
        password: 'admin123',
        role: 'SUPER_ADMIN'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;

    // Then fetch attendance summary for today
    const today = new Date().toISOString().split('T')[0];
    const attendanceResponse = await fetch(`http://localhost:4000/attendance/summary/${today}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(attendanceResponse.ok).toBe(true);
    const attendance = await attendanceResponse.json();
    expect(attendance).toHaveProperty('date');
    expect(attendance).toHaveProperty('membersPresent');
    expect(attendance).toHaveProperty('membersAbsent');
    expect(attendance).toHaveProperty('totalMembers');
  }, 10000);
});