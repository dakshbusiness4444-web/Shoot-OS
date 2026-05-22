// ── Instagram Graph API helpers ───────────────────────────────────────────
// Docs: https://developers.facebook.com/docs/instagram-platform

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const IG_API       = 'https://graph.instagram.com/v21.0'

export const IG_APP_ID      = import.meta.env.VITE_INSTAGRAM_APP_ID || ''
export const IG_REDIRECT_URI = `${SUPABASE_URL}/functions/v1/instagram-callback`

export const IG_SCOPES = 'instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish,instagram_business_manage_insights'

/** Build the OAuth URL — matches Meta's recommended format from "Set up Instagram business login" */
export function getInstagramOAuthUrl(userId) {
  const params = new URLSearchParams({
    force_reauth: 'true',
    client_id:    IG_APP_ID,
    redirect_uri: IG_REDIRECT_URI,
    response_type:'code',
    scope:        IG_SCOPES,
    state:        userId,
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
export async function fetchIgMedia(token, limit = 25) {
  return igFetch(
    `/me/media?fields=id,caption,media_type,media_product_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=${limit}`,
    token
  )
}

// ── Per-post insights (reach, saves, shares, plays, total_interactions) ───
// Different metrics for different media types. We try the broadest set and fail
// gracefully — Instagram returns errors per-metric if unsupported for that media.
export async function fetchMediaInsights(token, mediaId, mediaType) {
  // Reels (VIDEO media_product_type=REELS) support: reach,saved,likes,comments,shares,total_interactions,plays
  // Posts/Carousels support: reach,saved,likes,comments,shares,total_interactions (no plays)
  const isVideo = mediaType === 'VIDEO'
  const metrics = isVideo
    ? 'reach,saved,shares,total_interactions,plays,likes,comments'
    : 'reach,saved,shares,total_interactions,likes,comments'

  try {
    const data = await igFetch(`/${mediaId}/insights?metric=${metrics}`, token)
    const out = {}
    ;(data.data || []).forEach((m) => {
      const val = m.values?.[0]?.value
      if (val !== undefined) out[m.name] = typeof val === 'object' ? 0 : val
    })
    return out
  } catch (err) {
    // Fall back to minimal metrics that always work
    try {
      const data = await igFetch(`/${mediaId}/insights?metric=reach,saved,total_interactions`, token)
      const out = {}
      ;(data.data || []).forEach((m) => {
        out[m.name] = m.values?.[0]?.value || 0
      })
      return out
    } catch (e2) {
      console.warn('Insights failed for', mediaId, e2.message)
      return {}
    }
  }
}

// Fetch media + enrich each with insights (parallel)
export async function fetchIgMediaWithInsights(token, limit = 25) {
  const mediaData = await fetchIgMedia(token, limit)
  const media     = mediaData.data || []

  // Fire all insights requests in parallel — limit concurrency lightly
  const insightsResults = await Promise.all(
    media.map((m) => fetchMediaInsights(token, m.id, m.media_type).catch(() => ({})))
  )

  const enriched = media.map((m, i) => ({ ...m, insights: insightsResults[i] }))
  return { data: enriched }
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
