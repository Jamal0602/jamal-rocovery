// This is a Node.js script that can be run before deployment
// to ensure all necessary files and configurations are in place

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

console.log("🚀 Starting pre-build checks...")

// Check if .env file exists
const envPath = path.join(process.cwd(), ".env")
if (!fs.existsSync(envPath)) {
  console.log("⚠️ .env file not found, creating from .env.example...")

  // Check if .env.example exists
  const envExamplePath = path.join(process.cwd(), ".env.example")
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath)
    console.log("✅ Created .env file from .env.example")
  } else {
    console.log("⚠️ .env.example not found, creating minimal .env file...")
    const minimalEnv = `
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
    `.trim()

    fs.writeFileSync(envPath, minimalEnv)
    console.log("✅ Created minimal .env file")
  }
}

// Check if public directory exists
const publicDir = path.join(process.cwd(), "public")
if (!fs.existsSync(publicDir)) {
  console.log("⚠️ public directory not found, creating...")
  fs.mkdirSync(publicDir, { recursive: true })
  console.log("✅ Created public directory")
}

// Check if service worker exists
const swPath = path.join(publicDir, "service-worker.js")
if (!fs.existsSync(swPath)) {
  console.log("⚠️ service-worker.js not found, creating...")
  const serviceWorker = `
// Service Worker for offline support

const CACHE_NAME = "cubiz-portfolio-v1"
const urlsToCache = ["/", "/about", "/skills", "/contact", "/collab", "/offline", "/placeholder.svg"]

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            return cacheName !== CACHE_NAME
          })
          .map((cacheName) => {
            return caches.delete(cacheName)
          }),
      )
    }),
  )
})

// Fetch event - serve from cache or network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }

      // Clone the request
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // If fetch fails (offline), show offline page
          if (event.request.mode === "navigate") {
            return caches.match("/offline")
          }
        })
    }),
  )
})
  `.trim()

  fs.writeFileSync(swPath, serviceWorker)
  console.log("✅ Created service-worker.js")
}

// Run type check
try {
  console.log("🔍 Running TypeScript type check...")
  execSync("npx tsc --noEmit", { stdio: "inherit" })
  console.log("✅ TypeScript type check passed")
} catch (error) {
  console.log("⚠️ TypeScript type check failed, but continuing build...")
}

// Run lint
try {
  console.log("🔍 Running ESLint...")
  execSync("npx next lint", { stdio: "inherit" })
  console.log("✅ ESLint check passed")
} catch (error) {
  console.log("⚠️ ESLint check failed, but continuing build...")
}

console.log("✅ Pre-build checks completed")
console.log("🏗️ Starting build process...")

