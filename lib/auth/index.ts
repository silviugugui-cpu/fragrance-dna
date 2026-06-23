'use client';

// This file provides a unified export point for auth utilities
// Actual implementation is in authContext.ts

// Re-export auth provider and hooks
export { AuthProvider, useAuth } from './authContext';
export type { User, AuthContextType } from './authContext';

