export class PublicError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'PublicError'
  }
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  return error instanceof PublicError ? error.message : fallback
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback

  const authError = error as { code?: string; status?: number; message?: string }
  switch (authError.code) {
    case 'invalid_credentials':
      return 'The email or password is incorrect.'
    case 'email_not_confirmed':
      return 'Confirm your email address before signing in.'
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
      return 'Too many attempts. Please wait a moment and try again.'
    case 'email_address_invalid':
    case 'validation_failed':
      return 'Enter a valid email address.'
    case 'otp_expired':
      return 'That sign-in code has expired. Request a new one.'
    case 'otp_disabled':
      return 'Email sign-in is not available right now.'
    default:
      return fallback
  }
}
