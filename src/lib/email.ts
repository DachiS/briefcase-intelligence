// src/lib/email.ts
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendVerificationEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your Spy Magazine account',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #C8102E; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">SPY MAGAZINE</h1>
        <p style="font-size: 18px;">Verify your identity, agent.</p>
        <p>Click the link below to activate your account. This link expires in 24 hours.</p>
        <a href="${url}" style="display: inline-block; background: #C8102E; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">VERIFY EMAIL</a>
        <p style="color: #666; font-size: 12px;">If you did not request this, ignore this message.</p>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, name: string, plan: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Spy Magazine — Your subscription is active',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #C8102E; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">SPY MAGAZINE</h1>
        <p style="font-size: 18px;">Welcome, ${name}.</p>
        <p>Your <strong>${plan}</strong> subscription is now active. You have full access to all issues.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/issues" style="display: inline-block; background: #C8102E; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">ACCESS ISSUES</a>
      </div>
    `,
  })
}

// Sent when someone tries to register with an email that already has an
// account. Lets the registration endpoint return an identical response for new
// and existing emails (no user enumeration) while still guiding a real user.
export async function sendAccountExistsEmail(email: string) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'You already have a Spy Magazine account',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #C8102E; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">SPY MAGAZINE</h1>
        <p style="font-size: 18px;">An account already exists for this email.</p>
        <p>Someone (possibly you) just tried to register using this address. If it was you, simply sign in instead — no new account was created.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display: inline-block; background: #C8102E; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">SIGN IN</a>
        <p style="color: #666; font-size: 12px;">If you have forgotten your password, use the "forgot password" link on the sign-in page. If this wasn't you, you can safely ignore this message.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Reset your Spy Magazine password',
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0A0A0A; color: #F5F0E8; padding: 40px;">
        <h1 style="color: #C8102E; font-size: 28px; letter-spacing: 4px; text-transform: uppercase;">SPY MAGAZINE</h1>
        <p style="font-size: 18px;">Password Reset Request</p>
        <p>Click below to reset your password. This link expires in 1 hour.</p>
        <a href="${url}" style="display: inline-block; background: #C8102E; color: white; padding: 14px 28px; text-decoration: none; font-weight: bold; letter-spacing: 2px; margin: 20px 0;">RESET PASSWORD</a>
        <p style="color: #666; font-size: 12px;">If you did not request this, your password remains unchanged.</p>
      </div>
    `,
  })
}
