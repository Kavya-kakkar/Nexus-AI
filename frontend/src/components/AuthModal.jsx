import React, { useState } from 'react';
import { authApi } from '../services/api';

export default function AuthModal({ onLoginSuccess, onBackToLanding }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.login(username.trim(), password);
      localStorage.setItem('token', data.access_token);
      onLoginSuccess(data.access_token);
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(
        err.response?.data?.detail || 'Incorrect username or password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter both username and password.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters long.');
      return;
    }

    setLoading(true);
    try {
      await authApi.register(username.trim(), password);
      setSuccessMsg('Registration successful! Logging you in...');
      // Automatically log the user in
      const data = await authApi.login(username.trim(), password);
      localStorage.setItem('token', data.access_token);
      setTimeout(() => {
        onLoginSuccess(data.access_token);
      }, 500);
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMsg(
        err.response?.data?.detail ||
          'Registration failed. Username may already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = () => {
    setUsername('demo_analyst');
    setPassword('demopass123');
    setConfirmPassword('demopass123');
  };

  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center font-body-md text-on-surface relative overflow-hidden p-4">
      {/* Ambient background blurred glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-fixed-dim opacity-40 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary-fixed-dim opacity-25 blur-3xl pointer-events-none"></div>
      <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] rounded-full bg-tertiary-fixed-dim opacity-25 blur-2xl pointer-events-none"></div>

      <main className="w-full max-w-md z-10 relative my-8">
        {/* Top Brand Banner */}
        <div className="text-center mb-6">
          <button
            onClick={onBackToLanding}
            className="inline-flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer group"
          >
            <span
              className="material-symbols-outlined text-primary text-[36px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              dataset
            </span>
            <span className="font-extrabold text-3xl tracking-tight text-primary">
              Nexus-AI
            </span>
          </button>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Verified Q&amp;A &amp; Intelligent Document Analysis
          </p>
        </div>

        {/* Auth Form Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0_4px_25px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-outline-variant text-xs">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-3.5 font-bold text-center transition-colors cursor-pointer ${
                activeTab === 'login'
                  ? 'text-primary border-b-2 border-primary bg-surface/50'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/60'
              }`}
            >
              Log in
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-3.5 font-bold text-center transition-colors cursor-pointer ${
                activeTab === 'signup'
                  ? 'text-primary border-b-2 border-primary bg-surface/50'
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container/60'
              }`}
            >
              Sign up
            </button>
          </div>

          <div className="p-6 md:p-8">
            {/* Feedback Banners */}
            {errorMsg && (
              <div className="mb-5 p-3 rounded-xl bg-error-container/40 border border-error/50 text-error text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  error
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-5 p-3 rounded-xl bg-tertiary-container/20 border border-tertiary/40 text-tertiary text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
                <span>{successMsg}</span>
              </div>
            )}

            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      person
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. analyst_john"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-10 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-surface-tint text-on-primary font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      sync
                    </span>
                  )}
                  <span>Log in</span>
                </button>
              </form>
            )}

            {/* Sign Up Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Choose Username
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      person_add
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="e.g. data_analyst"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      lock
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-10 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                      lock_reset
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-3.5 py-2.5 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-primary hover:bg-surface-tint text-on-primary font-bold text-xs rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  {loading && (
                    <span className="material-symbols-outlined text-[16px] animate-spin">
                      sync
                    </span>
                  )}
                  <span>Create Account</span>
                </button>
              </form>
            )}

            {/* Quick Demo Credentials Helper */}
            <div className="mt-6 pt-5 border-t border-outline-variant/50 text-center">
              <button
                type="button"
                onClick={fillDemoAccount}
                className="text-[11px] font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">
                  key
                </span>
                <span>Fill sample credentials for testing</span>
              </button>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-4">
          <button
            onClick={onBackToLanding}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[16px]">
              arrow_back
            </span>
            <span>Back to Homepage</span>
          </button>
        </div>
      </main>
    </div>
  );
}
