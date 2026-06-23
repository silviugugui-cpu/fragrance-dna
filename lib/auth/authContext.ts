
/* eslint-disable react/jsx-key */
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, createElement } from 'react';

export interface User {
	id: string;
	email: string;
	name: string;
	avatar?: string;
	provider: 'email' | 'google' | 'apple';
	createdAt: string;
}

export interface AuthContextType {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (email: string, password: string, name: string) => Promise<void>;
	signInWithGoogle: () => Promise<void>;
	signInWithApple: () => Promise<void>;
	signOut: () => Promise<void>;
	resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Initialize auth state from localStorage
	useEffect(() => {
		const storedUser = localStorage.getItem('fragrancedna_user');
		if (storedUser) {
			try {
				setUser(JSON.parse(storedUser));
			} catch (error) {
				console.error('Failed to parse stored user:', error);
				localStorage.removeItem('fragrancedna_user');
			}
		}
		setIsLoading(false);
	}, []);

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 800));
			if (!email || !password) {
				throw new Error('Email and password are required');
			}
			const newUser: User = {
				id: `user_${Date.now()}`,
				email,
				name: email.split('@')[0],
				provider: 'email',
				createdAt: new Date().toISOString(),
			};
			setUser(newUser);
			localStorage.setItem('fragrancedna_user', JSON.stringify(newUser));
			localStorage.setItem('fragrancedna_session', JSON.stringify({
				token: `token_${Date.now()}`,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			}));
		} catch (error) {
			setIsLoading(false);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signUp = async (email: string, password: string, name: string) => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 1000));
			if (!email || !password || !name) {
				throw new Error('All fields are required');
			}
			if (password.length < 8) {
				throw new Error('Password must be at least 8 characters');
			}
			const newUser: User = {
				id: `user_${Date.now()}`,
				email,
				name,
				provider: 'email',
				createdAt: new Date().toISOString(),
			};
			setUser(newUser);
			localStorage.setItem('fragrancedna_user', JSON.stringify(newUser));
			localStorage.setItem('fragrancedna_session', JSON.stringify({
				token: `token_${Date.now()}`,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
			}));
		} catch (error) {
			setIsLoading(false);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signInWithGoogle = async () => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 1200));
			const googleUser: User = {
				id: `user_google_${Date.now()}`,
				email: `user${Date.now()}@gmail.com`,
				name: 'Google User',
				avatar: 'https://www.google.com/favicon.ico',
				provider: 'google',
				createdAt: new Date().toISOString(),
			};
			setUser(googleUser);
			localStorage.setItem('fragrancedna_user', JSON.stringify(googleUser));
			localStorage.setItem('fragrancedna_session', JSON.stringify({
				token: `token_google_${Date.now()}`,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				provider: 'google',
			}));
		} catch (error) {
			setIsLoading(false);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signInWithApple = async () => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 1200));
			const appleUser: User = {
				id: `user_apple_${Date.now()}`,
				email: `user${Date.now()}@privaterelay.appleid.com`,
				name: 'Apple User',
				avatar: 'https://www.apple.com/favicon.ico',
				provider: 'apple',
				createdAt: new Date().toISOString(),
			};
			setUser(appleUser);
			localStorage.setItem('fragrancedna_user', JSON.stringify(appleUser));
			localStorage.setItem('fragrancedna_session', JSON.stringify({
				token: `token_apple_${Date.now()}`,
				expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
				provider: 'apple',
			}));
		} catch (error) {
			setIsLoading(false);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 500));
			setUser(null);
			localStorage.removeItem('fragrancedna_user');
			localStorage.removeItem('fragrancedna_session');
		} finally {
			setIsLoading(false);
		}
	};

	const resetPassword = async (email: string) => {
		setIsLoading(true);
		try {
			await new Promise(resolve => setTimeout(resolve, 800));
			if (!email) {
				throw new Error('Email is required');
			}
			console.log(`Password reset link sent to ${email}`);
		} finally {
			setIsLoading(false);
		}
	};

	const value: AuthContextType = {
		user,
		isLoading,
		isAuthenticated: !!user,
		signIn,
		signUp,
		signInWithGoogle,
		signInWithApple,
		signOut,
		resetPassword,
	};

	return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

