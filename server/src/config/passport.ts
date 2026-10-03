import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import env from '../config/env.js'
import authService from '../services/auth.service.js'
import { createAccessToken, createRefreshToken, hashToken } from '../utils/token.js'

const serverUrl = env.SERVER_URL || `http://localhost:${env.PORT}`

if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${serverUrl}/api/v1/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await authService.findOrCreateOAuthUser(profile, 'google')
          const accessToken = createAccessToken(user._id)
          const refreshToken = createRefreshToken()
          await authService.setRefreshToken(user._id, hashToken(refreshToken))
          done(null, { user: user.toObject(), accessToken, refreshToken })
        } catch (error) {
          done(error, null)
        }
      }
    )
  )
}

if (env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
        callbackURL: `${serverUrl}/api/v1/auth/github/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const user = await authService.findOrCreateOAuthUser(profile, 'github')
          const accessToken = createAccessToken(user._id)
          const refreshToken = createRefreshToken()
          await authService.setRefreshToken(user._id, hashToken(refreshToken))
          done(null, { user: user.toObject(), accessToken, refreshToken })
        } catch (error) {
          done(error, null)
        }
      }
    )
  )
}

passport.serializeUser((data, done) => done(null, data))
passport.deserializeUser((data, done) => done(null, data))

export default passport
