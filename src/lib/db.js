import { openDB } from 'idb'

const DB_NAME = 'lachiwana-cache'
const DB_VERSION = 1

let dbPromise = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notebooks')) {
          db.createObjectStore('notebooks', { keyPath: 'userId' })
        }
      },
    })
  }
  return dbPromise
}

export async function getNotebooks(userId) {
  const db = await getDb()
  const record = await db.get('notebooks', userId)
  return record?.notebooks ?? null
}

export async function saveNotebooks(userId, notebooks) {
  const db = await getDb()
  await db.put('notebooks', { userId, notebooks, updatedAt: Date.now() })
}

export async function clearUserCache(userId) {
  const db = await getDb()
  await db.delete('notebooks', userId)
}
