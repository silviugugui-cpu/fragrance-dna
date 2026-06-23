'use client';

import { useState } from 'react';

export interface AuthFormProps {
  type: 'signin' | 'signup' | 'reset';
  onSubmit: (data: {
    email?: string;
    password?: string;
    name?: string;
    confirmPassword?: string;
  }) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AuthForm({
  type,
  onSubmit,
  isLoading = false,
  submitLabel = type === 'signin' ? 'Sign In' : type === 'signup' ? 'Create Account' : 'Reset Password',
}: AuthFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'email':
        if (!value) {
          newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Please enter a valid email';
        } else {
          delete newErrors.email;
        }
        break;

      case 'password':
        if (!value) {
          newErrors.password = 'Password is required';
        } else if (type === 'signup' && value.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        } else {
          delete newErrors.password;
        }
        break;

      case 'confirmPassword':
        if (type === 'signup') {
          if (!value) {
            newErrors.confirmPassword = 'Please confirm your password';
          } else if (value !== formData.password) {
            newErrors.confirmPassword = 'Passwords do not match';
          } else {
            delete newErrors.confirmPassword;
          }
        }
        break;

      case 'name':
        if (type === 'signup') {
          if (!value) {
            newErrors.name = 'Name is required';
          } else if (value.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
          } else {
            delete newErrors.name;
          }
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const fieldsToValidate =
      type === 'signin'
        ? ['email', 'password']
        : type === 'signup'
          ? ['email', 'password', 'confirmPassword', 'name']
          : ['email'];

    fieldsToValidate.forEach(field => {
      setTouched(prev => ({ ...prev, [field]: true }));
      validateField(field, formData[field as keyof typeof formData]);
    });

    // Check if there are any errors
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const inputClasses =
    'w-full px-4 py-3 bg-black/30 border border-gold/30 rounded-lg text-white placeholder-gray-500 transition-all duration-300 focus:outline-none focus:border-gold focus:bg-black/40 focus:ring-2 focus:ring-gold/20';

  const errorClasses = 'mt-1 text-sm text-red-400 font-medium';

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="you@example.com"
          className={inputClasses}
          disabled={isLoading}
        />
        {touched.email && errors.email && <p className={errorClasses}>{errors.email}</p>}
      </div>

      {/* Name Field (Sign Up Only) */}
      {type === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your Name"
            className={inputClasses}
            disabled={isLoading}
          />
          {touched.name && errors.name && <p className={errorClasses}>{errors.name}</p>}
        </div>
      )}

      {/* Password Field (Sign In & Sign Up Only) */}
      {type !== 'reset' && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            {type === 'signup' ? 'Create Password' : 'Password'}
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
            className={inputClasses}
            disabled={isLoading}
          />
          {touched.password && errors.password && (
            <p className={errorClasses}>{errors.password}</p>
          )}
          {type === 'signup' && !errors.password && (
            <p className="mt-1 text-xs text-gray-400">
              At least 8 characters, mix of letters, numbers, and symbols
            </p>
          )}
        </div>
      )}

      {/* Confirm Password Field (Sign Up Only) */}
      {type === 'signup' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="••••••••"
            className={inputClasses}
            disabled={isLoading}
          />
          {touched.confirmPassword && errors.confirmPassword && (
            <p className={errorClasses}>{errors.confirmPassword}</p>
          )}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || Object.keys(errors).length > 0}
        className="w-full px-4 py-3 mt-6 bg-gold hover:bg-opacity-90 text-black font-semibold rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-gold/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Processing...' : submitLabel}
      </button>
    </form>
  );
}
