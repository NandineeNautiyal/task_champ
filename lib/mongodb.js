import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB || 'task_champion'

// Reuse the connection across warm serverless invocations instead of
// opening a new one on every request.
let cachedClientPromise = globalThis._taskChampionMongoClientPromise

export async function getDb() {
  if (!uri) {
    throw new Error(
      'MONGODB_URI is not set. Add it in your Vercel project settings (Settings → Environment Variables) or in a local .env.local file.'
    )
  }
  if (!cachedClientPromise) {
    const client = new MongoClient(uri)
    cachedClientPromise = client.connect()
    globalThis._taskChampionMongoClientPromise = cachedClientPromise
  }
  const client = await cachedClientPromise
  return client.db(dbName)
}
