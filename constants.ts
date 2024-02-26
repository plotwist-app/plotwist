console.log({ envs: process.env })

export const APP_URL = process.env.VERCEL_URL || 'http://localhost:3000'
