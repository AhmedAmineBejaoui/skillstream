export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  PASSWORD_TOO_WEAK: 'PASSWORD_TOO_WEAK',
  
  // Business Logic
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  ALREADY_ENROLLED: 'ALREADY_ENROLLED',
  NOT_ENROLLED: 'NOT_ENROLLED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CART_EMPTY: 'CART_EMPTY',
  QUIZ_ATTEMPTS_EXCEEDED: 'QUIZ_ATTEMPTS_EXCEEDED',
  
  // System
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FILE_TYPE: 'UNSUPPORTED_FILE_TYPE'
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export class ApiError extends Error {
  status: number;
  code: ErrorCode | string;
  details?: unknown;

  constructor(status: number, code: ErrorCode | string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
