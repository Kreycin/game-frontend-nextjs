// src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, useCallback, ReactNode } from 'react';
import axios from 'axios';
import { db } from '../firebase'; // Make sure this firebase instance is for Firestore
import { doc, getDoc } from 'firebase/firestore';

const API_ENDPOINT = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserProfile {
  displayName: string;
}

// 1. Add jwt to the context type
interface AuthContextType {
  user: User | null;
  jwt: string | null; // Added for notification system
  profile: UserProfile | null;
  isLoggedIn: boolean;
  loading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [jwt, setJwt] = useState<string | null>(null); // 2. Add state for JWT
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: number, username: string) => {
    try {
      const profileDocRef = doc(db, 'userProfiles', userId.toString());
      const profileSnap = await getDoc(profileDocRef);
      if (profileSnap.exists()) {
        setProfile(profileSnap.data() as UserProfile);
      } else {
        setProfile({ displayName: username });
      }
    } catch (error) {
      console.error("Failed to fetch Firebase profile", error);
      setProfile({ displayName: username }); // Fallback profile
    }
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('jwt');
      if (token) {
        setJwt(token); // 3. Set JWT from localStorage on initial load
        try {
          const { data: userData } = await axios.get(`${API_ENDPOINT}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(userData);
          await fetchProfile(userData.id, userData.username);
        } catch (error) {
          console.error("Failed to verify token", error);
          localStorage.removeItem('jwt');
          setJwt(null); // Clear JWT if invalid
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [fetchProfile]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('jwt', token);
    setJwt(token); // 4. Set JWT on login
    setUser(userData);
    fetchProfile(userData.id, userData.username);
  };

  const logout = () => {
    localStorage.removeItem('jwt');
    setJwt(null); // 5. Clear JWT on logout
    setUser(null);
    setProfile(null);
    window.location.href = '/'; // Reload to clear all states
  };

  const refetchProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id, user.username);
    }
  }, [user, fetchProfile]);

  return (
    // 6. Provide jwt through the context
    <AuthContext.Provider value={{ user, jwt, profile, isLoggedIn: !!user, loading, login, logout, refetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
