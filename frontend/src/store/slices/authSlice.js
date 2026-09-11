import { createSlice } from '@reduxjs/toolkit';

export const PROTECTED_VIEWS = ['dashboard', 'map', 'alerts', 'assets', 'analytics'];

const getStoredToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('sanket_token') || null;
};

const getStoredUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('sanket_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const getInitialViewFromUrl = () => {
  if (typeof window === 'undefined') return 'landing';
  const path = window.location.pathname.toLowerCase().replace(/^\/+|\/+$/g, '');
  const storedToken = getStoredToken();
  const hasAuth = !!storedToken;

  if (path === 'auth') {
    return 'auth';
  }

  if (!path || path === 'landing') {
    return 'landing';
  }

  let requestedView = 'landing';
  if (path.startsWith('app/')) {
    const sub = path.split('/')[1];
    requestedView = PROTECTED_VIEWS.includes(sub) ? sub : 'dashboard';
  } else if (PROTECTED_VIEWS.includes(path)) {
    requestedView = path;
  } else if (path === 'app') {
    requestedView = localStorage.getItem('sanket_app_tab') || 'dashboard';
  }

  if (PROTECTED_VIEWS.includes(requestedView)) {
    if (!hasAuth) {
      localStorage.setItem('sanket_redirect_after_auth', requestedView);
      if (window.location.pathname !== '/auth') {
        window.history.replaceState(null, '', '/auth');
      }
      return 'auth';
    }
    return requestedView;
  }

  return 'landing';
};

const initialToken = getStoredToken();
const initialUser = getStoredUser();

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!(initialToken && initialUser),
  currentView: getInitialViewFromUrl(),
  redirectAfterLogin: typeof window !== 'undefined' ? (localStorage.getItem('sanket_redirect_after_auth') || null) : null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;

      if (typeof window !== 'undefined') {
        localStorage.setItem('sanket_token', token);
        localStorage.setItem('sanket_user', JSON.stringify(user));
      }

      const destination = state.redirectAfterLogin || 
        (typeof window !== 'undefined' ? localStorage.getItem('sanket_redirect_after_auth') : null) || 
        'dashboard';
      
      state.redirectAfterLogin = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('sanket_redirect_after_auth');
        localStorage.setItem('sanket_app_tab', destination);
        window.history.pushState(null, '', `/app/${destination}`);
      }
      state.currentView = destination;
    },

    setAuth: (state, action) => {
      // Alias for loginSuccess for backward compatibility
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      if (typeof window !== 'undefined') {
        localStorage.setItem('sanket_token', action.payload.token);
        localStorage.setItem('sanket_user', JSON.stringify(action.payload.user));
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.currentView = 'landing';
      state.redirectAfterLogin = null;

      if (typeof window !== 'undefined') {
        localStorage.removeItem('sanket_token');
        localStorage.removeItem('sanket_user');
        localStorage.removeItem('sanket_app_tab');
        localStorage.removeItem('sanket_redirect_after_auth');
        if (window.location.pathname !== '/') {
          window.history.pushState(null, '', '/');
        }
      }
    },

    setRedirectAfterLogin: (state, action) => {
      state.redirectAfterLogin = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('sanket_redirect_after_auth', action.payload);
        } else {
          localStorage.removeItem('sanket_redirect_after_auth');
        }
      }
    },

    setCurrentView: (state, action) => {
      let targetView = action.payload;

      // Unauthenticated Guard: Redirect any protected in-app route to auth
      if (PROTECTED_VIEWS.includes(targetView) && !state.isAuthenticated) {
        state.redirectAfterLogin = targetView;
        if (typeof window !== 'undefined') {
          localStorage.setItem('sanket_redirect_after_auth', targetView);
        }
        targetView = 'auth';
      }

      state.currentView = targetView;

      if (typeof window !== 'undefined') {
        if (targetView === 'landing') {
          if (window.location.pathname !== '/') {
            window.history.pushState(null, '', '/');
          }
        } else if (targetView === 'auth') {
          if (window.location.pathname !== '/auth') {
            window.history.pushState(null, '', '/auth');
          }
        } else {
          localStorage.setItem('sanket_app_tab', targetView);
          const targetPath = `/app/${targetView}`;
          if (window.location.pathname !== targetPath) {
            window.history.pushState(null, '', targetPath);
          }
        }
      }
    }
  }
});

export const { loginSuccess, setAuth, logout, setCurrentView, setRedirectAfterLogin } = authSlice.actions;
export default authSlice.reducer;
