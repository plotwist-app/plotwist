import axios from 'axios'

const URL = process.env.VERCEL_PROJECT_PRODUCTION_URL

export const api = axios.create({
  baseURL: `http://${URL}/api` || 'http://localhost:3000/api',
  timeout: 30000, // 30 seconds timeout to prevent hanging requests
})
