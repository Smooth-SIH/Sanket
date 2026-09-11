import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setCurrentView } from '../../store/slices/authSlice';
import { loginApi, registerApi } from '../../services/api';
import { 
  ShieldAlert, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  BadgeCheck, 
  ArrowLeft, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export const AuthView = () => {
  const dispatch = useDispatch();
  const redirectAfterLogin = useSelector((state) => state.auth.redirectAfterLogin);

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('DISASTER_OFFICER');
  const [regOrg, setRegOrg] = useState('State Emergency Operations Centre (SEOC)');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both your official email and security password.');
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi({
        email: loginEmail.trim(),
        password: loginPassword.trim()
      });

      setSuccessMessage('Identity verified. Entering Operational Console...');
      setTimeout(() => {
        dispatch(loginSuccess({ user: data.user, token: data.token }));
      }, 400);
    } catch (err) {
      console.error('Login error:', err);
      const msg = err.response?.data?.message || 'Access Denied: Unregistered personnel or invalid credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e?.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Full name, official email, and password are required.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      const data = await registerApi({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        organization: regOrg.trim()
      });

      setSuccessMessage('Official account registered. Granting console access...');
      setTimeout(() => {
        dispatch(loginSuccess({ user: data.user, token: data.token }));
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => dispatch(setCurrentView('landing'))}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Public Portal Overview</span>
        </button>

        {/* Security Header Banner */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-900 text-white shadow-sm shrink-0">
              <ShieldAlert className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">SANKET</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-200">
                  Restricted Command Portal
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Severe Weather Early Warning & Real-Time Geospatial Intelligence
              </p>
            </div>
          </div>

          {/* Access Warning Note */}
          <div className="flex items-start space-x-3 bg-amber-50/80 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 mb-6">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold">Authorised Personnel Only: </span>
              Access to live telemetry, XGBoost nowcast models, and emergency bulletin dispatch is restricted to registered disaster officers and meteorological analysts.
              {redirectAfterLogin && (
                <span className="block mt-1 font-medium text-amber-800">
                  (You will be redirected directly to <strong>{redirectAfterLogin.toUpperCase()}</strong> upon authorization)
                </span>
              )}
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-lg bg-slate-100 p-1 mb-6 border border-slate-200">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Personnel Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${
                mode === 'register'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register New Personnel
            </button>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="flex items-start space-x-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs mb-5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-xs mb-5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. officer@sanket.gov.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Security Passphrase / Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Authorize & Enter Operations Console</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Registration Form */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name & Designation
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Commander R. K. Sharma"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Departmental Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. rksharma@seoc.gov.in"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Command Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                  >
                    <option value="DISASTER_OFFICER">Disaster Duty Officer</option>
                    <option value="ANALYST">Meteorological Analyst</option>
                    <option value="ADMIN">Command Center Director</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Agency / Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={regOrg}
                      onChange={(e) => setRegOrg(e.target.value)}
                      placeholder="e.g. State Disaster Management Authority"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Security Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-md border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Personnel...</span>
                  </>
                ) : (
                  <>
                    <BadgeCheck className="w-4 h-4" />
                    <span>Register & Issue Authorization Credentials</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
