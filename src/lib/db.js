import { openDB } from 'idb'

const DB_NAME = 'lachiwana-cache'
const DB_VERSION = 4

let dbPromise = null

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('notebooks')) {
          db.createObjectStore('notebooks', { keyPath: 'userId' })
        }
        if (!db.objectStoreNames.contains('notebooks-by-id')) {
          db.createObjectStore('notebooks-by-id', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('transactions')) {
          db.createObjectStore('transactions', { keyPath: 'id' })
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

export async function getNotebook(id) {
  const db = await getDb()
  const record = await db.get('notebooks-by-id', id)
  return record?.notebook ?? null
}

export async function saveNotebook(id, notebook) {
  const db = await getDb()
  await db.put('notebooks-by-id', { id, notebook, updatedAt: Date.now() })
}

export async function getTransactions(cacheKey) {
  const db = await getDb()
  const record = await db.get('transactions', cacheKey)
  return record?.data ?? null
}

export async function saveTransactions(cacheKey, data) {
  const db = await getDb()
  await db.put('transactions', { id: cacheKey, data, updatedAt: Date.now() })
}

export async function clearUserCache(userId) {
  const db = await getDb()
  await db.delete('notebooks', userId)
}
