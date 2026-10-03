import { Resend } from 'resend'
import env from '../config/env.js'
import logger from '../utils/logger.js'

let resend = null

const getResend = () => {
  if (resend) return resend
  if (env.RESEND_API_KEY) {
    resend = new Resend(env.RESEND_API_KEY)
    logger.info('Using Resend for email delivery')
  }
  return resend
}

const sendEmail = async ({ to, subject, html }) => {
  const client = getResend()
  if (!client) {
    logger.warn('No email provider configured — skipping email send')
    return
  }

  try {
    const { data, error } = await client.emails.send({
      from: env.SMTP_FROM || 'DevFlow <onboarding@resend.dev>',
      to,
      subject,
      html,
    })

    if (error) {
      logger.error(`Failed to send email via Resend: ${error.message}`)
      return
    }

    logger.info(`Email sent via Resend: ${data?.id}`)
    return data
  } catch (error) {
    logger.error(`Failed to send email: ${error.message}`)
  }
}

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Verify your DevFlow email',
    html: `
      <h2>Welcome to DevFlow!</h2>
      <p>Please verify your email by clicking the link below:</p>
      <a href="${verificationUrl}" style="display:inline-block;padding:12px 24px;background:#0284c7;color:white;text-decoration:none;border-radius:8px;">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `,
  })
}

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`
  await sendEmail({
    to: email,
    subject: 'Reset your DevFlow password',
    html: `
      <h2>Password Reset</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#0284c7;color:white;text-decoration:none;border-radius:8px;">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  })
}

export default {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
}
