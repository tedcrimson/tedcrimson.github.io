import React, { useState } from 'react';
import { useData, SiteSettings } from '../context/DataContext';
import { Project, ProjectMedia, parseProjectCredits, ProjectCredit } from '../data/projects';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  Check,
  ArrowLeft,
  LogOut,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Image as ImageIcon,
} from 'lucide-react';

interface AdminPanelProps {
  onExit: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onExit }) => {
  const {
    projects,
    siteSettings,
    user,
    isAdmin,
    authLoading,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
    resetPassword,
    logout,
    saveProject,
    deleteProject,
    saveSiteSettings,
    uploadMedia,
  } = useData();

  const [activeTab, setActiveTab] = useState<'projects' | 'settings' | 'sync'>('projects');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingGalleryIdx, setUploadingGalleryIdx] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Email/Password auth state
  const [emailInput, setEmailInput] = useState('tedomakharadze95@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMode, setAuthMode] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Settings form state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  // Sync settingsForm whenever siteSettings update
  React.useEffect(() => {
    setSettingsForm(siteSettings);
  }, [siteSettings]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setSubmittingAuth(true);

    try {
      if (authMode === 'signin') {
        await signInWithEmail(emailInput, passwordInput);
      } else if (authMode === 'register') {
        await registerWithEmail(emailInput, passwordInput);
        setAuthSuccess('Account created successfully! You are now logged in.');
      } else if (authMode === 'forgot') {
        await resetPassword(emailInput);
        setAuthSuccess('Password reset link has been sent to your email.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const msg = err?.message || 'Authentication failed.';
      if (msg.includes('auth/operation-not-allowed')) {
        setAuthError(
          'Email/Password sign-in is not yet enabled in your Firebase Console. Please open the Firebase Console (Authentication > Sign-in method) and enable Email/Password.'
        );
      } else if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password')) {
        setAuthError('Incorrect email or password. If you have not created a password yet, click "Set Up / Register Password" below.');
      } else if (msg.includes('auth/user-not-found')) {
        setAuthError('No account found for this email. Click "Set Up / Register Password" to create your login credentials.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setAuthError('This email is already registered. Please sign in with your password, or use "Forgot Password".');
      } else if (msg.includes('auth/weak-password')) {
        setAuthError('Password should be at least 6 characters long.');
      } else {
        setAuthError(msg);
      }
    } finally {
      setSubmittingAuth(false);
    }
  };

  // Auth Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center">
        <div className="text-center space-y-2">
          <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#666666]" />
          <p className="text-xs tracking-wider text-[#666666] uppercase">Verifying Authorization...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#fcfcfc] border border-[#d8d8d8] p-8 rounded-[3px] shadow-sm">
          <div className="text-center mb-6">
            <span className="text-[11px] font-tabular tracking-[0.25em] text-[#777777] uppercase font-semibold">
              Restricted Area
            </span>
            <h1 className="text-2xl font-medium tracking-wider text-black mt-2">
              Portfolio Administration
            </h1>
            <p className="text-xs text-[#555555] mt-1.5 leading-relaxed">
              Sign in with your email and password to manage artworks, exhibitions, and website content.
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] leading-relaxed">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-[2px] leading-relaxed">
              {authSuccess}
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-[#444444] mb-1">
                Admin Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="tedomakharadze95@gmail.com"
                className="w-full bg-white border border-[#cccccc] px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#444444]">
                    Password
                  </label>
                  {authMode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className="text-[11px] text-[#777777] hover:text-black underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#cccccc] px-3 py-2 text-xs text-black focus:outline-none focus:border-black"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              className="w-full py-2.5 px-4 bg-black text-white hover:bg-neutral-800 transition-colors text-xs tracking-wider uppercase font-semibold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {submittingAuth ? (
                <span>Processing...</span>
              ) : authMode === 'signin' ? (
                <span>Sign in with Email & Password</span>
              ) : authMode === 'register' ? (
                <span>Create & Register Password</span>
              ) : (
                <span>Send Password Reset Link</span>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="text-center text-xs text-[#666666] space-y-2 border-t border-[#e0e0e0] pt-4 mb-4">
            {authMode === 'signin' ? (
              <p>
                First time using password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="font-medium text-black underline cursor-pointer"
                >
                  Set up / Register Password
                </button>
              </p>
            ) : (
              <p>
                Already have a password?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                    setAuthSuccess(null);
                  }}
                  className="font-medium text-black underline cursor-pointer"
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>

          {/* Google Sign In option */}
          <div className="border-t border-[#e0e0e0] pt-4 text-center">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full py-2 px-3 border border-[#cccccc] hover:border-black bg-white text-xs font-medium text-[#333333] hover:text-black transition-colors cursor-pointer flex items-center justify-center gap-2 mb-4"
            >
              <span>Or sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={onExit}
              className="text-xs text-[#666666] hover:text-black underline cursor-pointer inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Portfolio</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Signed in, but unauthorized email
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#fcfcfc] border border-red-200 p-8 rounded-[3px] text-center">
          <ShieldAlert className="w-8 h-8 text-amber-600 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-black mb-2">Access Unauthorized</h2>
          <p className="text-xs text-[#555555] leading-relaxed mb-6">
            You are signed in as <strong>{user.email}</strong>. Only the registered portfolio owner (<strong>tedomakharadze95@gmail.com</strong>) has write access to the Firebase Firestore database.
          </p>
          <div className="space-y-3">
            <button
              onClick={logout}
              className="w-full py-2 border border-black/30 hover:border-black text-xs uppercase font-medium cursor-pointer"
            >
              Sign out / Switch Account
            </button>
            <button
              onClick={onExit}
              className="text-xs text-[#666666] hover:text-black underline cursor-pointer block mx-auto"
            >
              Return to Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Project creation template (clean, empty values)
  const handleAddNewProject = () => {
    const newProj: Project = {
      id: `project-${Date.now()}`,
      slug: '',
      title: '',
      year: new Date().getFullYear().toString(),
      location: '',
      category: '',
      discipline: 'Installation',
      shortDescription: '',
      statement: '',
      paragraphs: [],
      heroMediaType: 'image',
      heroImage: '',
      gallery: [],
      creditsList: [],
      credits: [],
    };
    setEditingProject(newProj);
    setIsNewProject(true);
  };

  const handleHeroFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    try {
      setUploadingHero(true);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
      const folder = isVideo ? 'hero-videos' : 'hero-images';
      const url = await uploadMedia(file, folder);
      setEditingProject({
        ...editingProject,
        heroImage: url,
        heroMediaType: isVideo ? 'video' : 'image',
      });
    } catch (err) {
      alert('Upload to Firebase Storage failed. Please check network.');
    } finally {
      setUploadingHero(false);
    }
  };

  const handleGalleryFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProject) return;
    try {
      setUploadingGalleryIdx(index);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
      const folder = isVideo ? 'gallery-videos' : 'gallery-images';
      const url = await uploadMedia(file, folder);
      const updatedGallery = [...editingProject.gallery];
      updatedGallery[index] = {
        ...updatedGallery[index],
        url,
        type: isVideo ? 'video' : 'image',
      };
      setEditingProject({ ...editingProject, gallery: updatedGallery });
    } catch (err) {
      alert('Upload to Firebase Storage failed.');
    } finally {
      setUploadingGalleryIdx(null);
    }
  };

  const handleSaveProjectForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    try {
      setSaveStatus('Saving to Firebase Firestore...');
      await saveProject(editingProject);
      setSaveStatus('Project saved successfully!');
      setTimeout(() => {
        setSaveStatus(null);
        setEditingProject(null);
        setIsNewProject(false);
      }, 1000);
    } catch (err) {
      setSaveStatus('Error saving project.');
    }
  };

  const handleDeleteProject = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}" from Firestore?`)) {
      await deleteProject(id);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaveStatus('Updating site settings in Firestore...');
      await saveSiteSettings(settingsForm);
      setSaveStatus('Site settings saved successfully!');
      setTimeout(() => setSaveStatus(null), 1500);
    } catch (err) {
      setSaveStatus('Error saving settings.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#eeeeee] border-b border-[#d8d8d8] h-[48px] px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onExit}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#444444] hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Live Site</span>
          </button>
          <span className="text-neutral-300">|</span>
          <span className="text-xs font-semibold tracking-wider uppercase text-black">
            Firebase Admin Console
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#555555] hidden sm:inline">
            Admin: <strong>{user.email}</strong>
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 text-xs text-[#666666] hover:text-black cursor-pointer px-2 py-1 border border-[#cccccc] bg-white rounded-[2px]"
          >
            <LogOut className="w-3 h-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Content Container */}
      <div className="max-w-[960px] mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#dcdcdc] pb-3 mb-8">
          <button
            onClick={() => {
              setActiveTab('projects');
              setEditingProject(null);
            }}
            className={`px-4 py-1.5 text-xs tracking-wider uppercase font-semibold cursor-pointer rounded-[2px] transition-colors ${
              activeTab === 'projects' ? 'bg-black text-white' : 'text-[#555555] hover:text-black hover:bg-[#eaeaea]'
            }`}
          >
            Projects ({projects.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('settings');
              setEditingProject(null);
            }}
            className={`px-4 py-1.5 text-xs tracking-wider uppercase font-semibold cursor-pointer rounded-[2px] transition-colors ${
              activeTab === 'settings' ? 'bg-black text-white' : 'text-[#555555] hover:text-black hover:bg-[#eaeaea]'
            }`}
          >
            Site Settings & Bio
          </button>

          <button
            onClick={() => {
              setActiveTab('sync');
              setEditingProject(null);
            }}
            className={`px-4 py-1.5 text-xs tracking-wider uppercase font-semibold cursor-pointer rounded-[2px] transition-colors ${
              activeTab === 'sync' ? 'bg-black text-white' : 'text-[#555555] hover:text-black hover:bg-[#eaeaea]'
            }`}
          >
            Firestore Sync
          </button>
        </div>

        {/* Status Message */}
        {saveStatus && (
          <div className="mb-6 p-3 bg-black text-white text-xs font-tabular tracking-wider flex items-center gap-2 rounded-[2px]">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{saveStatus}</span>
          </div>
        )}

        {/* ----------------- TAB 1: PROJECTS LIST & EDITOR ----------------- */}
        {activeTab === 'projects' && (
          <>
            {editingProject ? (
              /* Project Edit Form */
              <form onSubmit={handleSaveProjectForm} className="bg-white border border-[#d8d8d8] p-6 sm:p-8 rounded-[3px] space-y-6">
                <div className="flex items-center justify-between border-b border-[#e0e0e0] pb-4">
                  <h2 className="text-lg font-medium text-black">
                    {isNewProject ? 'Add New Project' : `Edit: ${editingProject.title}`}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="text-xs text-[#666666] hover:text-black underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.title}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          title: e.target.value,
                          slug: editingProject.slug || e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                        })
                      }
                      className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.slug}
                      onChange={(e) => setEditingProject({ ...editingProject, slug: e.target.value })}
                      className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">Year *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.year}
                      onChange={(e) => setEditingProject({ ...editingProject, year: e.target.value })}
                      className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">Location *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.location}
                      onChange={(e) => setEditingProject({ ...editingProject, location: e.target.value })}
                      className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">Category Medium *</label>
                    <input
                      type="text"
                      required
                      value={editingProject.category}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                      placeholder="e.g. Interactive Audiovisual Installation"
                      className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#444444] mb-1">Discipline *</label>
                    <select
                      value={editingProject.discipline}
                      onChange={(e) =>
                        setEditingProject({
                          ...editingProject,
                          discipline: e.target.value as any,
                        })
                      }
                      className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none focus:border-black"
                    >
                      <option value="Installation">Installation</option>
                      <option value="Audiovisual">Audiovisual</option>
                      <option value="Realtime & Generative">Realtime & Generative</option>
                      <option value="Spatial & Dome">Spatial & Dome</option>
                      <option value="Kinetic">Kinetic</option>
                    </select>
                  </div>
                </div>

                {/* Hero Media (Image or Video) & Storage Upload */}
                <div className="border border-[#e0e0e0] p-4 bg-[#fbfbfb] rounded-[2px] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-black uppercase tracking-wider">
                      Hero Exhibition Media (Image or Video)
                    </label>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-[#666666]">Media Type:</span>
                      <select
                        value={editingProject.heroMediaType || (editingProject.heroImage?.toLowerCase().includes('.mp4') ? 'video' : 'image')}
                        onChange={(e) =>
                          setEditingProject({
                            ...editingProject,
                            heroMediaType: e.target.value as 'image' | 'video',
                          })
                        }
                        className="bg-white border border-[#cccccc] px-2 py-0.5 text-xs text-black"
                      >
                        <option value="image">Image</option>
                        <option value="video">Video (MP4 / WebM / Vimeo / YouTube)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {editingProject.heroImage && (
                      <div className="w-36 h-24 bg-black border border-[#cccccc] rounded-[2px] overflow-hidden flex items-center justify-center shrink-0">
                        {(editingProject.heroMediaType === 'video' || editingProject.heroImage?.toLowerCase().includes('.mp4') || editingProject.heroImage?.toLowerCase().includes('.webm')) ? (
                          <video
                            src={editingProject.heroImage}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={editingProject.heroImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    )}
                    <div className="flex-1 space-y-2 w-full">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingProject.heroImage}
                          onChange={(e) => {
                            const val = e.target.value;
                            const isVid = val.toLowerCase().includes('.mp4') || val.toLowerCase().includes('.webm') || val.toLowerCase().includes('vimeo') || val.toLowerCase().includes('youtube');
                            setEditingProject({
                              ...editingProject,
                              heroImage: val,
                              heroMediaType: isVid ? 'video' : (editingProject.heroMediaType || 'image'),
                            });
                          }}
                          placeholder="Paste image/video URL (or Vimeo/YouTube link), or upload below..."
                          className="flex-1 bg-white border border-[#cccccc] px-3 py-1.5 text-xs text-black focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs font-medium cursor-pointer hover:bg-neutral-800">
                          <Upload className="w-3.5 h-3.5" />
                          <span>{uploadingHero ? 'Uploading to Storage...' : 'Upload Image or Video (Firebase Storage)'}</span>
                          <input
                            type="file"
                            accept="image/*,video/*"
                            disabled={uploadingHero}
                            onChange={handleHeroFileUpload}
                            className="hidden"
                          />
                        </label>
                        <span className="text-[11px] text-[#666666]">Supports MP4, WebM, MOV, JPG, PNG, WEBP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Short Synopsis Description */}
                <div>
                  <label className="block text-xs font-semibold text-[#444444] mb-1">
                    Short Synopsis (Featured on Homepage feed) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={editingProject.shortDescription}
                    onChange={(e) => setEditingProject({ ...editingProject, shortDescription: e.target.value })}
                    className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
                  />
                </div>

                {/* Project Texts: Paragraphs with Optional Titles */}
                <div className="border border-[#e0e0e0] p-4 bg-[#fbfbfb] rounded-[2px] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-black uppercase tracking-wider">
                        Project Texts & Paragraphs
                      </h3>
                      <p className="text-[11px] text-[#666666]">
                        Add narrative paragraphs, curatorial statements, or conceptual descriptions with optional section titles.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentParas = editingProject.paragraphs && editingProject.paragraphs.length > 0
                          ? editingProject.paragraphs
                          : editingProject.statement
                          ? [{ title: '', text: editingProject.statement }]
                          : [];
                        setEditingProject({
                          ...editingProject,
                          paragraphs: [...currentParas, { title: '', text: '' }],
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs text-black border border-[#cccccc] bg-white px-2.5 py-1 hover:border-black cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Paragraph</span>
                    </button>
                  </div>

                  {(() => {
                    const currentParas = editingProject.paragraphs && editingProject.paragraphs.length > 0
                      ? editingProject.paragraphs
                      : editingProject.statement
                      ? [{ title: '', text: editingProject.statement }]
                      : [{ title: '', text: '' }];

                    return currentParas.map((para, idx) => (
                      <div key={idx} className="p-3 bg-white border border-[#cccccc] rounded-[2px] space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-semibold text-[#555555] uppercase tracking-wider">
                            Paragraph #{idx + 1}
                          </label>
                          {currentParas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentParas.filter((_, i) => i !== idx);
                                setEditingProject({
                                  ...editingProject,
                                  paragraphs: updated,
                                  statement: updated.map(p => p.title ? `${p.title}\n${p.text}` : p.text).join('\n\n'),
                                });
                              }}
                              className="text-red-500 hover:text-red-700 text-xs p-1 cursor-pointer inline-flex items-center gap-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>

                        <div>
                          <input
                            type="text"
                            value={para.title || ''}
                            onChange={(e) => {
                              const updated = [...currentParas];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setEditingProject({
                                ...editingProject,
                                paragraphs: updated,
                                statement: updated.map(p => p.title ? `${p.title}\n${p.text}` : p.text).join('\n\n'),
                              });
                            }}
                            placeholder="Section Title / Heading (optional, e.g. Concept, Interaction, Spatial Setup)"
                            className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-xs font-medium text-black focus:outline-none focus:border-black"
                          />
                        </div>

                        <div>
                          <textarea
                            rows={4}
                            required
                            value={para.text}
                            onChange={(e) => {
                              const updated = [...currentParas];
                              updated[idx] = { ...updated[idx], text: e.target.value };
                              setEditingProject({
                                ...editingProject,
                                paragraphs: updated,
                                statement: updated.map(p => p.title ? `${p.title}\n${p.text}` : p.text).join('\n\n'),
                              });
                            }}
                            placeholder="Enter paragraph text..."
                            className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-2 text-sm text-black focus:outline-none focus:border-black leading-relaxed"
                          />
                        </div>
                      </div>
                    ));
                  })()}
                </div>

                {/* Additional Documentation Gallery (Images & Videos) */}
                <div className="border border-[#e0e0e0] p-4 bg-[#fbfbfb] rounded-[2px] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-black uppercase tracking-wider">
                        Documentation Gallery ({editingProject.gallery?.length || 0})
                      </h3>
                      <p className="text-[11px] text-[#666666]">
                        Photographs, video captures (MP4/WebM), or Vimeo/YouTube documentation.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            gallery: [
                              ...(editingProject.gallery || []),
                              {
                                type: 'image',
                                url: '',
                                caption: '',
                                aspectRatio: '16:9',
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-black border border-[#cccccc] bg-white px-2 py-1 hover:border-black cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingProject({
                            ...editingProject,
                            gallery: [
                              ...(editingProject.gallery || []),
                              {
                                type: 'video',
                                url: '',
                                caption: '',
                                aspectRatio: '16:9',
                              },
                            ],
                          })
                        }
                        className="inline-flex items-center gap-1 text-xs font-medium text-black border border-[#cccccc] bg-white px-2 py-1 hover:border-black cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Video</span>
                      </button>
                    </div>
                  </div>

                  {editingProject.gallery?.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white border border-[#cccccc] rounded-[2px] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div className="w-24 h-16 bg-black border border-[#ddd] rounded-[2px] overflow-hidden flex items-center justify-center shrink-0">
                        {item.type === 'video' || item.url?.toLowerCase().includes('.mp4') ? (
                          <video src={item.url} className="w-full h-full object-cover" />
                        ) : (
                          <img src={item.url || 'https://placehold.co/160x100?text=No+Media'} alt="Gallery item" className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="flex-1 space-y-1.5 w-full">
                        <div className="flex items-center gap-2">
                          <select
                            value={item.type}
                            onChange={(e) => {
                              const updated = [...editingProject.gallery];
                              updated[idx] = { ...updated[idx], type: e.target.value as 'image' | 'video' };
                              setEditingProject({ ...editingProject, gallery: updated });
                            }}
                            className="bg-[#fafafa] border border-[#ccc] px-2 py-1 text-xs text-black"
                          >
                            <option value="image">Image</option>
                            <option value="video">Video</option>
                          </select>

                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => {
                              const updated = [...editingProject.gallery];
                              const val = e.target.value;
                              const isVid = val.toLowerCase().includes('.mp4') || val.toLowerCase().includes('vimeo') || val.toLowerCase().includes('youtube');
                              updated[idx] = {
                                ...updated[idx],
                                url: val,
                                type: isVid ? 'video' : updated[idx].type,
                              };
                              setEditingProject({ ...editingProject, gallery: updated });
                            }}
                            placeholder="Media URL or upload file..."
                            className="flex-1 bg-[#fafafa] border border-[#ccc] px-2.5 py-1 text-xs text-black"
                          />
                        </div>

                        <input
                          type="text"
                          value={item.caption || ''}
                          onChange={(e) => {
                            const updated = [...editingProject.gallery];
                            updated[idx] = { ...updated[idx], caption: e.target.value };
                            setEditingProject({ ...editingProject, gallery: updated });
                          }}
                          placeholder="Caption / description (optional)"
                          className="w-full bg-[#fafafa] border border-[#ccc] px-2.5 py-1 text-xs text-black"
                        />

                        <div className="flex items-center gap-2">
                          <label className="text-[11px] text-blue-700 hover:underline cursor-pointer">
                            <span>{uploadingGalleryIdx === idx ? 'Uploading to Firebase Storage...' : `Upload ${item.type === 'video' ? 'Video' : 'Image'} to Firebase Storage`}</span>
                            <input
                              type="file"
                              accept="image/*,video/*"
                              disabled={uploadingGalleryIdx === idx}
                              onChange={(e) => handleGalleryFileUpload(idx, e)}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const updated = editingProject.gallery.filter((_, i) => i !== idx);
                          setEditingProject({ ...editingProject, gallery: updated });
                        }}
                        className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Project Credits (Roles & Names) */}
                <div className="border border-[#e0e0e0] p-4 bg-[#fbfbfb] rounded-[2px] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold text-black uppercase tracking-wider">
                        Project Credits & Contributors ({(() => parseProjectCredits(editingProject).length)()} Roles)
                      </h3>
                      <p className="text-[11px] text-[#666666]">
                        Define roles and collaborator names stored in Firebase (e.g. Creative Direction, Sound Design, Curation, Visuals).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const currentCredits = parseProjectCredits(editingProject);
                        const updated = [...currentCredits, { role: '', name: '' }];
                        setEditingProject({
                          ...editingProject,
                          creditsList: updated,
                          credits: updated,
                        });
                      }}
                      className="inline-flex items-center gap-1 text-xs text-black border border-[#cccccc] bg-white px-2.5 py-1 hover:border-black cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Role & Name</span>
                    </button>
                  </div>

                  {(() => {
                    const credits = parseProjectCredits(editingProject);
                    if (credits.length === 0) {
                      return (
                        <p className="text-xs text-[#888888] italic py-1">
                          No credits assigned yet. Click &quot;Add Role &amp; Name&quot; above to add contributors.
                        </p>
                      );
                    }

                    return credits.map((credit, idx) => (
                      <div key={idx} className="p-3 bg-white border border-[#cccccc] rounded-[2px] flex flex-col sm:flex-row gap-3 items-center">
                        <input
                          type="text"
                          value={credit.role}
                          onChange={(e) => {
                            const updated = [...credits];
                            updated[idx] = { ...updated[idx], role: e.target.value };
                            setEditingProject({
                              ...editingProject,
                              creditsList: updated,
                              credits: updated,
                            });
                          }}
                          placeholder="Role (e.g. Creative Direction, Sound Design)"
                          className="w-full sm:w-56 bg-[#fafafa] border border-[#ccc] px-2.5 py-1.5 text-xs text-black"
                        />
                        <input
                          type="text"
                          value={credit.name}
                          onChange={(e) => {
                            const updated = [...credits];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setEditingProject({
                              ...editingProject,
                              creditsList: updated,
                              credits: updated,
                            });
                          }}
                          placeholder="Name(s) (e.g. Tedo Makharadze, Studio Partner)"
                          className="flex-1 w-full bg-[#fafafa] border border-[#ccc] px-2.5 py-1.5 text-xs text-black"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = credits.filter((_, i) => i !== idx);
                            setEditingProject({
                              ...editingProject,
                              creditsList: updated,
                              credits: updated,
                            });
                          }}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Remove credit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ));
                  })()}
                </div>

                {/* Form Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-[#e0e0e0]">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-black text-white text-xs tracking-wider uppercase font-semibold hover:bg-neutral-800 cursor-pointer"
                  >
                    Save Project to Firestore
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProject(null)}
                    className="px-4 py-2 border border-[#cccccc] text-xs tracking-wider uppercase font-medium hover:border-black cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              /* Projects Table / Overview */
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-black">
                    Portfolio Works in Firestore
                  </h2>
                  <button
                    onClick={handleAddNewProject}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-xs tracking-wider uppercase font-semibold hover:bg-neutral-800 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Project</span>
                  </button>
                </div>

                <div className="bg-white border border-[#d8d8d8] rounded-[3px] overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e0e0e0] bg-[#f5f5f5] text-[11px] font-semibold tracking-wider text-[#555555] uppercase">
                        <th className="py-2.5 px-4">Artwork</th>
                        <th className="py-2.5 px-4">Year</th>
                        <th className="py-2.5 px-4 hidden sm:table-cell">Discipline</th>
                        <th className="py-2.5 px-4 hidden md:table-cell">Location</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eeeeee] text-xs">
                      {projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="py-3 px-4 flex items-center gap-3">
                            <img
                              src={proj.heroImage}
                              alt={proj.title}
                              className="w-10 h-7 object-cover rounded-[2px] border border-[#dddddd]"
                            />
                            <div>
                              <span className="font-semibold text-black block">{proj.title}</span>
                              <span className="text-[11px] text-[#777777]">{proj.category}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-tabular text-[#444444]">{proj.year}</td>
                          <td className="py-3 px-4 hidden sm:table-cell text-[#555555]">{proj.discipline}</td>
                          <td className="py-3 px-4 hidden md:table-cell text-[#555555]">{proj.location}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setEditingProject(proj);
                                  setIsNewProject(false);
                                }}
                                className="p-1 hover:text-black text-[#555555] cursor-pointer"
                                title="Edit project"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id, proj.title)}
                                className="p-1 hover:text-red-700 text-[#777777] cursor-pointer"
                                title="Delete project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* ----------------- TAB 2: SITE SETTINGS & BIO ----------------- */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="bg-white border border-[#d8d8d8] p-6 sm:p-8 rounded-[3px] space-y-6">
            <div className="border-b border-[#e0e0e0] pb-4">
              <h2 className="text-lg font-medium text-black">Website Information & Biography</h2>
              <p className="text-xs text-[#666666] mt-1">
                Updates saved here reflect live on the website's About, Contact, and Homepage announcement sections.
              </p>
            </div>

            {/* Artist Statement */}
            <div>
              <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
                Artist Statement Quote
              </label>
              <input
                type="text"
                required
                value={settingsForm.aboutStatement}
                onChange={(e) => setSettingsForm({ ...settingsForm, aboutStatement: e.target.value })}
                className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-2 text-sm text-black focus:outline-none focus:border-black"
              />
            </div>

            {/* Biography Paragraphs */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-black uppercase tracking-wider">
                  Biography Paragraphs
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm({
                      ...settingsForm,
                      bioParagraphs: [...settingsForm.bioParagraphs, 'New paragraph content...'],
                    })
                  }
                  className="text-xs font-medium text-black hover:underline cursor-pointer"
                >
                  + Add Paragraph
                </button>
              </div>

              {settingsForm.bioParagraphs.map((para, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <textarea
                    rows={3}
                    value={para}
                    onChange={(e) => {
                      const updated = [...settingsForm.bioParagraphs];
                      updated[i] = e.target.value;
                      setSettingsForm({ ...settingsForm, bioParagraphs: updated });
                    }}
                    className="flex-1 bg-[#fdfdfd] border border-[#cccccc] px-3 py-2 text-sm text-black focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = settingsForm.bioParagraphs.filter((_, idx) => idx !== i);
                      setSettingsForm({ ...settingsForm, bioParagraphs: updated });
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upcoming & Current Exhibitions Notice */}
            <div className="space-y-3 pt-4 border-t border-[#e0e0e0]">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-black uppercase tracking-wider">
                  Current & Upcoming Exhibitions (Homepage Notice Box)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setSettingsForm({
                      ...settingsForm,
                      upcomingExhibitions: [
                        ...settingsForm.upcomingExhibitions,
                        { date: '', title: '', location: '' },
                      ],
                    })
                  }
                  className="text-xs font-medium text-black hover:underline cursor-pointer"
                >
                  + Add Exhibition Notice
                </button>
              </div>

              {settingsForm.upcomingExhibitions.map((item, idx) => (
                <div key={idx} className="p-3 bg-[#fafafa] border border-[#cccccc] rounded-[2px] flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={item.date}
                    onChange={(e) => {
                      const updated = [...settingsForm.upcomingExhibitions];
                      updated[idx] = { ...updated[idx], date: e.target.value };
                      setSettingsForm({ ...settingsForm, upcomingExhibitions: updated });
                    }}
                    placeholder="e.g. Autumn 2025"
                    className="w-32 bg-white border border-[#ccc] px-2.5 py-1 text-xs text-black"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...settingsForm.upcomingExhibitions];
                      updated[idx] = { ...updated[idx], title: e.target.value };
                      setSettingsForm({ ...settingsForm, upcomingExhibitions: updated });
                    }}
                    placeholder="Project title"
                    className="w-48 bg-white border border-[#ccc] px-2.5 py-1 text-xs text-black"
                  />
                  <input
                    type="text"
                    value={item.location}
                    onChange={(e) => {
                      const updated = [...settingsForm.upcomingExhibitions];
                      updated[idx] = { ...updated[idx], location: e.target.value };
                      setSettingsForm({ ...settingsForm, upcomingExhibitions: updated });
                    }}
                    placeholder="Description and venue"
                    className="flex-1 bg-white border border-[#ccc] px-2.5 py-1 text-xs text-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = settingsForm.upcomingExhibitions.filter((_, i) => i !== idx);
                      setSettingsForm({ ...settingsForm, upcomingExhibitions: updated });
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Direct Contact Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#e0e0e0]">
              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  value={settingsForm.email}
                  onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                  className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black uppercase tracking-wider mb-1">
                  Location
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.location}
                  onChange={(e) => setSettingsForm({ ...settingsForm, location: e.target.value })}
                  className="w-full bg-[#fdfdfd] border border-[#cccccc] px-3 py-1.5 text-sm text-black focus:outline-none"
                />
              </div>
            </div>

            {/* Online Archives & Networks */}
            <div className="pt-4 border-t border-[#e0e0e0] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-semibold text-black uppercase tracking-wider">
                    Online Archives & Networks
                  </label>
                  <p className="text-[11px] text-[#666666]">
                    Social links and portfolio repositories stored in Firebase (Instagram, GitHub, LinkedIn, Vimeo, etc.).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const current = settingsForm.socials || [];
                    setSettingsForm({
                      ...settingsForm,
                      socials: [...current, { name: '', href: '', label: '' }],
                    });
                  }}
                  className="inline-flex items-center gap-1 text-xs text-black border border-[#cccccc] bg-white px-2.5 py-1 hover:border-black cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Network Link</span>
                </button>
              </div>

              {(settingsForm.socials || []).map((link, idx) => (
                <div key={idx} className="p-3 bg-[#fafafa] border border-[#cccccc] rounded-[2px] flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="text"
                    value={link.name}
                    onChange={(e) => {
                      const updated = [...(settingsForm.socials || [])];
                      updated[idx] = { ...updated[idx], name: e.target.value };
                      setSettingsForm({ ...settingsForm, socials: updated });
                    }}
                    placeholder="Platform (e.g. Instagram)"
                    className="w-full sm:w-36 bg-white border border-[#ccc] px-2.5 py-1 text-xs text-black"
                  />
                  <input
                    type="text"
                    value={link.href}
                    onChange={(e) => {
                      const updated = [...(settingsForm.socials || [])];
                      updated[idx] = { ...updated[idx], href: e.target.value };
                      setSettingsForm({ ...settingsForm, socials: updated });
                    }}
                    placeholder="URL (e.g. https://instagram.com/tedomakharadze)"
                    className="flex-1 w-full bg-white border border-[#ccc] px-2.5 py-1 text-xs text-black"
                  />
                  <input
                    type="text"
                    value={link.label || ''}
                    onChange={(e) => {
                      const updated = [...(settingsForm.socials || [])];
                      updated[idx] = { ...updated[idx], label: e.target.value };
                      setSettingsForm({ ...settingsForm, socials: updated });
                    }}
                    placeholder="Label / Handle (optional, e.g. @tedomakharadze)"
                    className="w-full sm:w-52 bg-white border border-[#ccc] px-2.5 py-1 text-xs text-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (settingsForm.socials || []).filter((_, i) => i !== idx);
                      setSettingsForm({ ...settingsForm, socials: updated });
                    }}
                    className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e0e0e0]">
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white text-xs tracking-wider uppercase font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Save Site Settings to Firestore
              </button>
            </div>
          </form>
        )}

        {/* ----------------- TAB 3: FIRESTORE & STORAGE SYNC ----------------- */}
        {activeTab === 'sync' && (
          <div className="bg-white border border-[#d8d8d8] p-6 sm:p-8 rounded-[3px] space-y-6">
            <div>
              <h2 className="text-lg font-medium text-black">Firebase Integration Status</h2>
              <p className="text-xs text-[#666666] mt-1">
                Connected to your provisioned Firebase Firestore database and Storage bucket.
              </p>
            </div>

            <div className="bg-[#f9f9f9] border border-[#e0e0e0] p-4 rounded-[2px] text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-[#eee]">
                <span className="text-[#666666]">Firebase Project ID:</span>
                <span className="font-mono text-black">{firebaseConfig.projectId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eee]">
                <span className="text-[#666666]">Firestore Database ID:</span>
                <span className="font-mono text-black">{firebaseConfig.firestoreDatabaseId}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#eee]">
                <span className="text-[#666666]">Firebase Storage Bucket:</span>
                <span className="font-mono text-black">{firebaseConfig.storageBucket}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#666666]">Authorized Admin Account:</span>
                <span className="font-mono text-black">tedomakharadze95@gmail.com</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#e0e0e0] space-y-3">
              <h3 className="text-sm font-semibold text-black">Live Firestore Database Status</h3>
              <p className="text-xs text-[#555555] leading-relaxed">
                All portfolio artworks, gallery photos, and website settings are fetched directly from your Firebase Firestore database in real-time. Currently storing <strong className="text-black">{projects.length} artworks</strong> in the <span className="font-mono text-black">projects</span> collection.
              </p>
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-[2px]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore connection verified & operational</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
