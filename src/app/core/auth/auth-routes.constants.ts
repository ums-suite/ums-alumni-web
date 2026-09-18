export const AUTH_ROUTES = {
  login: '/login',
  authenticatedHome: '/app/directory',
  /** ALMW-7: where a live session with no linked Alumnus record lands -- see `RegistrationLinkComponent`. */
  registrationPending: '/register',
  /** A self-reported "I think I already have an account" path off the pending-link screen. */
  registrationRecovery: '/register/recovery',
} as const;

export const RETURN_URL_QUERY_PARAM = 'returnUrl';
