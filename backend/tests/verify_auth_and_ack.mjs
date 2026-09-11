import express from 'express';
import http from 'http';
import authRoutes from '../src/routes/authRoutes.js';
import alertRoutes from '../src/routes/alertRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertRoutes);

const server = http.createServer(app);

server.listen(0, async () => {
  const port = server.address().port;
  const API_BASE = `http://127.0.0.1:${port}/api`;
  console.log(`[Test Server] Running ephemeral test server on port ${port}`);

  try {
    // 1. Test Unregistered user rejection
    const resBadUser = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'random_hacker@unknown.com', password: 'password123' })
    });
    console.log(`[Test 1] Random unregistered user status: ${resBadUser.status} (Expected: 401)`);
    if (resBadUser.status !== 401) throw new Error('Unregistered user was not rejected!');

    // 2. Test Invalid Password
    const resBadPw = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer@sanket.gov.in', password: 'wrongpassword' })
    });
    console.log(`[Test 2] Invalid password status: ${resBadPw.status} (Expected: 401)`);
    if (resBadPw.status !== 401) throw new Error('Invalid password was not rejected!');

    // 3. Test Authorized Login (Pre-registered officer)
    const resLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'officer@sanket.gov.in', password: 'sanket2026' })
    });
    console.log(`[Test 3] Pre-registered officer login status: ${resLogin.status} (Expected: 200)`);
    if (resLogin.status !== 200) throw new Error('Registered officer login failed!');
    const loginData = await resLogin.json();
    console.log(`  -> Officer Authorized: ${loginData.user.name} (${loginData.user.organization})`);
    const token = loginData.token;

    // 4. Test Protected Route (/auth/me) with and without token
    const resMeNoToken = await fetch(`${API_BASE}/auth/me`);
    console.log(`[Test 4a] Protected /me without token status: ${resMeNoToken.status} (Expected: 401)`);
    if (resMeNoToken.status !== 401) throw new Error('Unprotected access allowed to /auth/me!');

    const resMeWithToken = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`[Test 4b] Protected /me with token status: ${resMeWithToken.status} (Expected: 200)`);
    const meData = await resMeWithToken.json();
    console.log(`  -> Validated Session: ${meData.user.name}, Role: ${meData.user.role}`);

    // 5. Test Alert Acknowledgment with Authenticated Officer
    const resAck = await fetch(`${API_BASE}/alerts/ALT-901/acknowledge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        officerName: `${loginData.user.name} (${loginData.user.organization})`
      })
    });
    console.log(`[Test 5] Alert acknowledgment status: ${resAck.status} (Expected: 200)`);
    const ackData = await resAck.json();
    console.log(`  -> Acknowledged By: "${ackData.alert.acknowledgedBy}" at ${ackData.alert.acknowledgedAt}`);
    if (!ackData.alert.acknowledged || !ackData.alert.acknowledgedBy.includes(loginData.user.name)) {
      throw new Error('Alert acknowledgment failed to record authenticated officer!');
    }

    // 6. Test New Personnel Registration
    const newEmail = `officer_${Date.now()}@sanket.gov.in`;
    const resReg = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Capt. Aditya Sen',
        email: newEmail,
        password: 'aditya_pass_2026',
        role: 'DISASTER_OFFICER',
        organization: 'Uttarakhand State Disaster Management Authority (USDMA)'
      })
    });
    console.log(`[Test 6] Register new personnel status: ${resReg.status} (Expected: 201)`);
    const regData = await resReg.json();
    console.log(`  -> Registered: ${regData.user.name}, Org: ${regData.user.organization}`);

    // 7. Test Login with Newly Registered Personnel
    const resNewLogin = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, password: 'aditya_pass_2026' })
    });
    console.log(`[Test 7] Login with newly registered user: ${resNewLogin.status} (Expected: 200)`);
    if (resNewLogin.status !== 200) throw new Error('Failed to login with newly registered credentials!');

    console.log('--- ALL AUTH & ALERT ACKNOWLEDGMENT TESTS PASSED PERFECTLY! ---');
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failure:', err);
    server.close();
    process.exit(1);
  }
});
