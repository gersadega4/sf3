import { MongoClient } from "mongodb"
import type { Db } from "mongodb"

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

if (!uri) {
  throw new Error("MONGODB_URI is not set. Please add it in Project Settings.")
}
if (!dbName) {
  throw new Error("MONGODB_DB is not set. Please add it in Project Settings.")
}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

const mongoClient = new MongoClient(uri)
if (!global._mongoClientPromise) {
  global._mongoClientPromise = mongoClient.connect()
}
const clientPromise = global._mongoClientPromise as Promise<MongoClient>

export async function getDb(): Promise<Db> {
  const client = await clientPromise
  return client.db(dbName)
}
