import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'
import { getAnalytics, isSupported } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-analytics.js'
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js'
import { collection, deleteDoc, doc, getDoc, getDocs, getFirestore, setDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-storage.js'

const firebaseConfig = {
  apiKey: 'AIzaSyDLjE7-XuwuwG8KhteLY7n4KFpeO3t00RI',
  authDomain: 'adminbistro-97eed.firebaseapp.com',
  projectId: 'adminbistro-97eed',
  storageBucket: 'adminbistro-97eed.firebasestorage.app',
  messagingSenderId: '342773708193',
  appId: '1:342773708193:web:2e9aa3f28e512f0deb87e0',
  measurementId: 'G-MLD9WGKDKG'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

isSupported()
  .then(supported => {
    if (supported) getAnalytics(app)
  })
  .catch(error => console.warn('Firebase Analytics could not be initialized:', error))

const resources = [
  ['/api/cake-options/flavors', 'flavors'],
  ['/api/cake-options/shapes', 'shapes'],
  ['/api/cake-options/sizes', 'sizes'],
  ['/api/pizza-toppings', 'toppings'],
  ['/api/categories', 'categories'],
  ['/api/products', 'products'],
  ['/api/gallery', 'gallery'],
  ['/api/promotions', 'promotions'],
  ['/api/orders', 'orders'],
  ['/api/expenses', 'expenses']
]

export function observeAuth(callback) {
  return onAuthStateChanged(auth, callback)
}

export async function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOutUser() {
  return signOut(auth)
}

export async function isAdmin(user) {
  const snapshot = await getDoc(doc(db, 'admins', user.uid))
  return snapshot.exists() && snapshot.data().role === 'admin'
}

export async function uploadImage(file) {
  const user = auth.currentUser
  if (!user) throw new Error('Sign in before uploading images.')
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const fileRef = ref(storage, `admin-uploads/${user.uid}/${crypto.randomUUID()}-${safeName}`)
  const snapshot = await uploadBytes(fileRef, file, { contentType: file.type })
  return getDownloadURL(snapshot.ref)
}

export async function firebaseApi(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const resource = resources.find(([prefix]) => path === prefix || path.startsWith(`${prefix}/`))

  if (path === '/api/settings') {
    const settingsRef = doc(db, 'settings', 'store')
    if (method === 'GET') {
      const snapshot = await getDoc(settingsRef)
      return snapshot.exists() ? snapshot.data() : null
    }
    const settings = JSON.parse(options.body)
    await setDoc(settingsRef, settings, { merge: true })
    return settings
  }

  if (!resource) throw new Error(`Unsupported Firebase data path: ${path}`)

  const [prefix, collectionName] = resource
  const suffix = path.slice(prefix.length).replace(/^\//, '')
  const isOrderStatus = collectionName === 'orders' && suffix.endsWith('/status')
  const id = isOrderStatus ? suffix.slice(0, -'/status'.length) : suffix

  if (method === 'GET') {
    if (id) {
      const snapshot = await getDoc(doc(db, collectionName, decodeURIComponent(id)))
      return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null
    }
    const snapshot = await getDocs(collection(db, collectionName))
    return snapshot.docs.map(item => ({ ...item.data(), id: item.id }))
  }

  if (method === 'POST') {
    const payload = JSON.parse(options.body)
    const documentId = payload.id || crypto.randomUUID()
    await setDoc(doc(db, collectionName, documentId), payload)
    return { ...payload, id: documentId }
  }

  if (method === 'PUT') {
    const payload = JSON.parse(options.body)
    const updates = isOrderStatus ? { status: payload.status } : payload
    await updateDoc(doc(db, collectionName, decodeURIComponent(id)), updates)
    return { ...payload, id }
  }

  if (method === 'DELETE') {
    await deleteDoc(doc(db, collectionName, decodeURIComponent(id)))
    return { ok: true }
  }

  throw new Error(`Unsupported Firebase operation: ${method}`)
}
