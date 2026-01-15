'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function ProfilePage() {
  const { user, profile, loading, refetchProfile, isLoggedIn } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize form data when profile imports
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  // Protect the route
  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
  }, [loading, isLoggedIn, router]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        displayName,
        bio
      }, { merge: true });

      await refetchProfile();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-700">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold text-gradient-flame">User Profile</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-3xl font-bold">
                {profile?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold">{profile?.displayName || 'User'}</h2>
                <p className="text-gray-400">{user?.email}</p>
              </div>
            </div>

            {isEditing ? (
              <div className="space-y-4 animate-in fade-in">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your display name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setDisplayName(profile?.displayName || '');
                      setBio(profile?.bio || '');
                    }}
                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition disabled:brightness-75"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-750 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">About Me</h3>
                <p className="text-gray-200 leading-relaxed min-h-[60px] whitespace-pre-wrap">
                  {profile?.bio || "No bio yet. Click edit to add one!"}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-gray-700 mt-6">
              <h3 className="text-lg font-semibold mb-4">Account Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-blue-400">0</span>
                  <span className="text-sm text-gray-400">Comments</span>
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg text-center">
                  <span className="block text-2xl font-bold text-yellow-400">0</span>
                  <span className="text-sm text-gray-400">Favorites</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
