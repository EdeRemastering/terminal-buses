import { useState, useEffect, useRef, useCallback } from 'react';

export interface FormDialogState<T> {
  errors: Partial<Record<keyof T, string>>;
  success: boolean;
  submitted: boolean;
}

export function useFormDialog<T extends Record<string, unknown>>() {
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [success, setSuccess] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  const startSuccess = useCallback((onComplete?: () => void) => {
    setSuccess(true);
    successTimeoutRef.current = setTimeout(() => {
      setSuccess(false);
      onComplete?.();
    }, 1200);
  }, []);

  const buildFieldErrors = useCallback(
    (issues: ReadonlyArray<{ path: ReadonlyArray<PropertyKey>; message: string }>): Partial<Record<keyof T, string>> => {
      const fieldErrors: Partial<Record<keyof T, string>> = {};
      for (const issue of issues) {
        const field = issue.path[0] as keyof T;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      return fieldErrors;
    },
    []
  );

  const resetAll = useCallback(() => {
    setErrors({});
    setSuccess(false);
    setSubmitted(false);
  }, []);

  const isFormError = useCallback(
    (name: keyof T) => submitted && !!errors[name],
    [submitted, errors]
  );

  return {
    errors,
    setErrors,
    success,
    startSuccess,
    buildFieldErrors,
    resetAll,
    isFormError,
    setSubmitted,
  };
}
