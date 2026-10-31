
/* eslint-disable react/jsx-key */
'use client';

import { createContext, useContext, ReactNode, useState, useEffect, createElement } from 'react';
import type { User } from './types';
import { hydratePersistentUserProfile } from './persistentProfile';

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

interface AuthApiResponse {
	user?: User;
	error?: string;
}

const cacheUser = (user: User): void => {
	localStorage.setItem('fragrancedna_user', JSON.stringify(user));
};

const parseApiError = (fallback: string, payload?: AuthApiResponse): string => {
	if (payload?.error && payload.error.trim().length > 0) {
		return payload.error;
	}
	return fallback;
};

const postAuth = async <TBody extends object>(url: string, body: TBody, fallbackError: string): Promise<User> => {
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(body),
	});

	const payload = (await response.json().catch(() => ({}))) as AuthApiResponse;
	if (!response.ok || !payload.user) {
		throw new Error(parseApiError(fallbackError, payload));
	}

	return payload.user;
};

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// The server cookie is authoritative; localStorage is only a display cache.
	useEffect(() => {
		let active = true;
		void fetch('/api/auth/session', { cache: 'no-store' })
			.then(async (response) => {
				const payload = (await response.json().catch(() => ({}))) as AuthApiResponse;
				if (!active) return;
				if (response.ok && payload.user) {
					setUser(payload.user);
					cacheUser(payload.user);
					await hydratePersistentUserProfile();
				} else {
					setUser(null);
					localStorage.removeItem('fragrancedna_user');
				}
			})
			.catch(() => {
				if (active) setUser(null);
			})
			.finally(() => {
				if (active) setIsLoading(false);
			});
		return () => {
			active = false;
		};
	}, []);

	const signIn = async (email: string, password: string) => {
		setIsLoading(true);
		try {
			const signedInUser = await postAuth(
				'/api/auth/sign-in',
				{ email, password },
				'Sign in failed. Please try again.',
			);
			setUser(signedInUser);
			cacheUser(signedInUser);
			await hydratePersistentUserProfile();
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
			const signedUpUser = await postAuth(
				'/api/auth/sign-up',
				{ email, password, name },
				'Sign up failed. Please try again.',
			);
			setUser(signedUpUser);
			cacheUser(signedUpUser);
			await hydratePersistentUserProfile();
		} catch (error) {
			setIsLoading(false);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const signInWithGoogle = async () => {
		// Full-page redirect into the server-side OAuth flow; the session cookie is
		// set by the callback route and picked up on the next page load.
		window.location.assign('/api/auth/oauth/google/start');
	};

	const signInWithApple = async () => {
		window.location.assign('/api/auth/oauth/apple/start');
	};

	const signOut = async () => {
		setIsLoading(true);
		try {
			await fetch('/api/auth/sign-out', { method: 'POST' });
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
			if (!email) {
				throw new Error('Email is required');
			}
			throw new Error('Password reset email delivery is not configured. Contact the platform administrator to reset this account.');
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

