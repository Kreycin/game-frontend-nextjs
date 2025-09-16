// src/context/ClientAuthProvider.tsx
'use client'; // <-- บรรทัดนี้สำคัญมาก!

import { AuthProvider } from './AuthContext';
import { ReactNode } from 'react';

export default function ClientAuthProvider({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}