'use client'; // บอกว่าเป็น Client Component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ใช้ Router จาก Next.js
import { db } from '@/firebase'; 
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth, UserProfile } from '@/context/AuthContext';

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, refetchProfile, isLoggedIn } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If auth is done loading and user is not logged in, redirect
    if (!loading && !isLoggedIn) {
      router.push('/login');
    }
    // Set display name once user and profile are loaded
    if (user && profile) {
      setDisplayName(profile.displayName || user.username);
    }
  }, [user, profile, loading, isLoggedIn, router]);
  
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    try {
      const profileData: UserProfile = { displayName };
      const profileDocRef = doc(db, 'userProfiles', user.id.toString());
      await setDoc(profileDocRef, profileData, { merge: true });
      await refetchProfile();
      alert('Profile updated successfully!');
    } catch (error) {
      console.error("Failed to update profile", error);
      alert('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  // Show a loading state while auth is being checked
  if (loading || !profile || !user) {
    return <div className="text-white text-center p-8">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Edit Your Profile</h1>
        <p className="text-gray-400 mb-4">Username (Cannot be changed): <strong>{user.username}</strong></p>

        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <label className="block text-lg font-medium mb-2">Display Name</label>
          <p className="text-sm text-gray-400 mb-2">This is the name that will appear in your comments.</p>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-md border border-gray-600"/>
        </div>

        <button onClick={handleSave} disabled={saving}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-md">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
