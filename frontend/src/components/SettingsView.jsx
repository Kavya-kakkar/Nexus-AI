import React, { useState, useEffect } from 'react';
import { authApi } from '../services/api';

export default function SettingsView({ currentUser, onUpdateUser, onBack, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'preferences'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    bio: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        full_name: currentUser.full_name || '',
        bio: currentUser.bio || '',
        avatar_url: currentUser.avatar_url || '',
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const updated = await authApi.updateMe({
        email: formData.email || undefined,
        full_name: formData.full_name || undefined,
        bio: formData.bio || undefined,
        avatar_url: formData.avatar_url || undefined,
      });
      if (onUpdateUser) onUpdateUser(updated);
      setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
      setTimeout(() => setStatusMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setStatusMsg({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to update profile settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-surface">
      {/* Settings Top Header */}
      <header className="flex items-center px-4 md:px-8 py-3.5 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-10 shadow-[0px_2px_8px_rgba(0,0,0,0.02)]">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors rounded-lg px-2 py-1 -ml-2 text-xs font-semibold cursor-pointer group"
        >
          <span className="material-symbols-outlined text-lg group-hover:-translate-x-0.5 transition-transform">
            arrow_back
          </span>
          <span>Back to Workspace</span>
        </button>
        <div className="h-5 w-px bg-outline-variant mx-4 hidden md:block"></div>
        <h1 className="text-sm font-bold text-on-surface hidden md:block">
          Settings &amp; Account
        </h1>
      </header>

      {/* Main Settings Layout */}
      <main className="flex-1 flex flex-col md:flex-row w-full max-w-6xl mx-auto px-4 md:px-8 py-8 gap-8">
        {/* Left Settings Navigation */}
        <aside className="w-full md:w-60 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-1.5">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-primary-container text-on-primary-container shadow-xs'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Preferences</span>
            </button>

            <div className="hidden md:block my-2 h-px bg-outline-variant/60"></div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-error hover:bg-error-container/20 transition-all text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign out</span>
            </button>
          </nav>
        </aside>

        {/* Right Settings Form Area */}
        <div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 md:p-8 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]">
          {activeTab === 'profile' && (
            <div>
              <div className="mb-6 pb-4 border-b border-outline-variant/60">
                <h2 className="text-lg font-bold text-on-surface">
                  Public Profile
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Manage your personal details and account information.
                </p>
              </div>

              {/* Status Banner */}
              {statusMsg.text && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-semibold mb-6 flex items-center gap-2 ${
                    statusMsg.type === 'success'
                      ? 'bg-tertiary-container/20 text-tertiary border border-tertiary/40'
                      : 'bg-error-container/40 text-error border border-error/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {statusMsg.type === 'success' ? 'check_circle' : 'error'}
                  </span>
                  <span>{statusMsg.text}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-variant border border-outline-variant flex items-center justify-center overflow-hidden">
                    {formData.avatar_url ? (
                      <img
                        src={formData.avatar_url}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {formData.username ? formData.username.charAt(0).toUpperCase() : 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-on-surface">
                      Profile Avatar
                    </h3>
                    <p className="text-[11px] text-on-surface-variant mb-2">
                      Enter an image URL below to set your avatar photo.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username (read-only) */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      disabled
                      className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3.5 py-2 text-xs text-on-surface-variant cursor-not-allowed"
                    />
                    <span className="text-[10px] text-outline mt-1 block">
                      Username cannot be changed after registration.
                    </span>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      placeholder="e.g. Alex Mercer"
                      value={formData.full_name}
                      onChange={handleChange}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="alex@nexus-ai.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>

                  {/* Avatar URL */}
                  <div>
                    <label className="block text-xs font-semibold text-on-surface mb-1">
                      Avatar URL
                    </label>
                    <input
                      type="url"
                      name="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatar_url}
                      onChange={handleChange}
                      className="w-full bg-surface border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-semibold text-on-surface mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    rows={3}
                    placeholder="Tell us about your research focus or role..."
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full bg-surface border border-outline-variant rounded-lg px-3.5 py-2 text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30"
                  />
                </div>

                <div className="pt-4 border-t border-outline-variant/60 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 bg-primary text-on-primary hover:bg-surface-tint rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    {loading && (
                      <span className="material-symbols-outlined text-[16px] animate-spin">
                        sync
                      </span>
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div>
              <div className="mb-6 pb-4 border-b border-outline-variant/60">
                <h2 className="text-lg font-bold text-on-surface">
                  System Preferences
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Configure verification parameters and model settings.
                </p>
              </div>

              <div className="space-y-5 text-xs text-on-surface">
                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant">
                  <div>
                    <h4 className="font-bold">Strict Citation Verification</h4>
                    <p className="text-on-surface-variant text-[11px] mt-0.5">
                      Highlight exact timestamps and page numbers for every generated claim.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-surface rounded-xl border border-outline-variant">
                  <div>
                    <h4 className="font-bold">Auto-Seek on Citation Click</h4>
                    <p className="text-on-surface-variant text-[11px] mt-0.5">
                      Jump the media player to the exact timestamp when a citation chip is clicked.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
