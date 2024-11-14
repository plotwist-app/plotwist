import axios from 'axios'

const URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
console.log({ pokedex: URL })

export const api = axios.create({
  baseURL: URL || 'http://localhost:3000/api',
})
