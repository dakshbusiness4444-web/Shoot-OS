// ── Instagram Graph API helpers ───────────────────────────────────────────
// Docs: https://developers.facebook.com/docs/instagram-platform

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const IG_API       = 'https://graph.instagram.com/v21.0'

export const IG_APP_ID      = import.meta.env.VITE_INSTAGRAM_APP_ID || ''
export const IG_REDIRECT_URI = `${SUPABASE_URL}/functions/v1/instagram-callback`

export const IG_SCOPES = [
  'instagram_business_basic',
  'instagram_business_content_publish',
  'instagram_business_manage_insights',
].join(',')

/** Build the OAuth URL — pass currentUser.id as state so the edge function can save to the right user */
export function getInstagramOAuthUrl(userId) {
  const params = new URLSearchParams({
    client_id:     IG_APP_ID,
    redirect_uri:  IG_REDIRECT_URI,
    response_type: 'code',
    scope:         IG_SCOPES,
    state:         userId,
  })
  return `https://www.instagram.com/oauth/authorize?${params}`
}

// ── API fetch wrapper ──────────────────────────────────────────────────────
async function igFetch(endpoint, token) {
  const sep = endpoint.includes('?') ? '&' : '?'
  const res  = await fetch(`${IG_API}${endpoint}${sep}access_token=${token}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error.message || 'Instagram API error')
  return data
}

// ── Profile ────────────────────────────────────────────────────────────────
export async function fetchIgProfile(token) {
  return igFetch(
    '/me?fields=id,username,name,biography,followers_count,media_count,profile_picture_url,website',
    token
  )
}

// ── Media ──────────────────────────────────────────────────────────────────
export async function fetchIgMedia(token, limit = 12) {
  return igFetch(
    `/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=${limit}`,
    token
  )
}

// ── Account insights (reach / impressions / profile_views) ─────────────────
export async function fetchIgInsights(token, igUserId) {
  const since = Math.floor((Date.now() - 30 * 86400 * 1000) / 1000)
  const until = Math.floor(Date.now() / 1000)
  return igFetch(
    `/${igUserId}/insights?metric=reach,impressions,profile_views&period=day&since=${since}&until=${until}`,
    token
  )
}

// ── Publish a single-image post ────────────────────────────────────────────
export async function publishIgPost({ token, igUserId, imageUrl, caption }) {
  // Step 1 — create media container
  const containerParams = new URLSearchParams({ image_url: imageUrl, caption, access_token: token })
  const containerRes    = await fetch(`${IG_API}/${igUserId}/media`, {
    method: 'POST', body: containerParams,
  })
  const container = await containerRes.json()
  if (container.error) throw new Error(container.error.message)

  // Step 2 — publish
  const pubParams = new URLSearchParams({ creation_id: container.id, access_token: token })
  const pubRes    = await fetch(`${IG_API}/${igUserId}/media_publish`, {
    method: 'POST', body: pubParams,
  })
  const result = await pubRes.json()
  if (result.error) throw new Error(result.error.message)
  return result
}

// ── Publish carousel (multiple images) ────────────────────────────────────
export async function publishIgCarousel({ token, igUserId, imageUrls, caption }) {
  // Step 1 — create a container per image
  const childIds = await Promise.all(
    imageUrls.map(async (imageUrl) => {
      const p   = new URLSearchParams({ image_url: imageUrl, is_carousel_item: 'true', access_token: token })
      const res = await fetch(`${IG_API}/${igUserId}/media`, { method: 'POST', body: p })
      const d   = await res.json()
      if (d.error) throw new Error(d.error.message)
      return d.id
    })
  )

  // Step 2 — create carousel container
  const carParams = new URLSearchParams({
    media_type:   'CAROUSEL',
    children:     childIds.join(','),
    caption,
    access_token: token,
  })
  const carRes = await fetch(`${IG_API}/${igUserId}/media`, { method: 'POST', body: carParams })
  const car    = await carRes.json()
  if (car.error) throw new Error(car.error.message)

  // Step 3 — publish
  const pubParams = new URLSearchParams({ creation_id: car.id, access_token: token })
  const pubRes    = await fetch(`${IG_API}/${igUserId}/media_publish`, { method: 'POST', body: pubParams })
  const result    = await pubRes.json()
  if (result.error) throw new Error(result.error.message)
  return result
}
