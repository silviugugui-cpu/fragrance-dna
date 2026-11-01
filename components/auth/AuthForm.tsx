'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

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
  submitLabel,
}: AuthFormProps) {
  const { t } = useLanguage();
  const resolvedSubmitLabel = submitLabel ?? t.auth.form.defaultSubmit[type];
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const buildFieldError = (name: string, value: string, source: typeof formData): string | null => {
    switch (name) {
      case 'email':
        if (!value) {
          return type === 'signin'
            ? t.auth.form.errors.usernameOrEmailRequired
            : t.auth.form.errors.emailRequired;
        }
        if (type !== 'signin' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return t.auth.form.errors.emailInvalid;
        }
        return null;

      case 'password':
        if (!value) {
          return t.auth.form.errors.passwordRequired;
        }
        if (type === 'signup' && value.length < 8) {
          return t.auth.form.errors.passwordTooShort;
        }
        return null;

      case 'confirmPassword':
        if (type === 'signup') {
          if (!value) {
            return t.auth.form.errors.confirmPasswordRequired;
          }
          if (value !== source.password) {
            return t.auth.form.errors.passwordsDoNotMatch;
          }
        }
        return null;

      case 'name':
        if (type === 'signup') {
          if (!value) {
            return t.auth.form.errors.nameRequired;
          }
          if (value.length < 2) {
            return t.auth.form.errors.nameTooShort;
          }
        }
        return null;

      default:
        return null;
    }
  };

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    const nextFormData = {
      ...formData,
      [name]: value,
    };
    const error = buildFieldError(name, value, nextFormData);
    if (error) {
      newErrors[name] = error;
    } else {
      delete newErrors[name];
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

    const nextTouched = { ...touched };
    const nextErrors: Record<string, string> = {};

    fieldsToValidate.forEach(field => {
      nextTouched[field] = true;
      const value = formData[field as keyof typeof formData];
      const error = buildFieldError(field, value, formData);
      if (error) {
        nextErrors[field] = error;
      }
    });

    setTouched(nextTouched);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
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
          {type === 'signin' ? t.auth.form.labels.usernameOrEmail : t.auth.form.labels.email}
        </label>
        <input
          id="email"
          type={type === 'signin' ? 'text' : 'email'}
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={t.auth.form.placeholders.email}
          className={inputClasses}
          disabled={isLoading}
        />
        {touched.email && errors.email && <p className={errorClasses}>{errors.email}</p>}
      </div>

      {/* Name Field (Sign Up Only) */}
      {type === 'signup' && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            {t.auth.form.labels.fullName}
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder={t.auth.form.placeholders.name}
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
            {type === 'signup' ? t.auth.form.labels.createPassword : t.auth.form.labels.password}
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
              {t.auth.form.passwordHint}
            </p>
          )}
        </div>
      )}

      {/* Confirm Password Field (Sign Up Only) */}
      {type === 'signup' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
            {t.auth.form.labels.confirmPassword}
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
        {isLoading ? t.auth.form.processing : resolvedSubmitLabel}
      </button>
    </form>
  );
}
