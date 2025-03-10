# Auth API Service (Hono)

A secure authentication service built with Hono that provides cross-domain authentication capabilities and multiple authentication methods.

## Key Features

• Cross-domain session management with CSRF protection
• Email verification
• Cloudflare Turnstile integration for bot protection
• Secure session management with encryption
• SQLite/Turso database integration
• Two-factor authentication (2FA)
• Multiple authentication methods:

- Email/Password authentication
- One-time password (OTP)
- Google OAuth integration

## API Endpoints

Authentication:
• POST /api_auth/email_password/login - Email/password login
• POST /api_auth/email_password/register - Register new account
• POST /api_auth/otp/request - Request one-time password
• POST /api_auth/otp/verify - Verify OTP code
• POST /api_auth/google_oauth/login - Google OAuth login

Session Management:
• POST /api_auth/user/whoami - Get current user info
• POST /api_auth/user/logout - Logout current user
• POST /api_auth/cross_domain/redirector - Handle cross-domain auth

Two-Factor Authentication:
• POST /api_auth/two_factor_auth/enable - Enable 2FA
• POST /api_auth/two_factor_auth/verify - Verify 2FA code
• POST /api_auth/two_factor_auth/disable - Disable 2FA

## Database Management

• pnpm dev:drizzle-studio - Launch Drizzle database UI
• pnpm generate:sql - Generate production SQL
• pnpm test:prod:migrate - Test database migrations with turso branching
• pnpm prod:migrate - Run production migrations

## Security Features

• CSRF protection with origin validation
• Encrypted sessions with JWT
• Rate limiting and bot protection
• Secure cookie handling
• Cross-domain security checks
• Password hashing with Argon2
• Two-factor authentication
• Email verification

## Environment Modes

• Development: Local SQLite database
• Production: Turso database with optional embedded replicas
• Caddy development: Local development with reverse proxy

For more details, see the source code and type definitions.
