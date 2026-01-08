import https from 'https'
import { config } from '@/config'
import { TMDB } from '@plotwist_app/tmdb'

export const tmdb = TMDB(config.services.TMDB_ACCESS_TOKEN, {
  httpsAgent: new https.Agent({ family: 4 }),
})
