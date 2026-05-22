import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { SEED_PROJECT, SEED_PRODUCTS, SEED_COLORS } from '../data/seedData'
import { fetchIgProfile, fetchIgMedia, fetchIgMediaWithInsights } from '../lib/instagram'

const LOCAL_DATA_KEY  = 'brandropos_data_v1'
const LOCAL_THEME_KEY = 'brandropos_theme'

function applyThemeClass(theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const actual = theme === 'system'
    ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  if (actual === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function getInitialTheme() {
  try {
    return localStorage.getItem(LOCAL_THEME_KEY) || 'light'
  } catch { return 'light' }
}

// Apply theme immediately on module load (before React mounts)
if (typeof window !== 'undefined') applyThemeClass(getInitialTheme())

function getLocalData() {
  try {
    const raw = localStorage.getItem(LOCAL_DATA_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveLocalData(data) {
  try { localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(data)) } catch {}
}

function buildInitialLocalData() {
  return {
    projects:        [SEED_PROJECT],
    products:        SEED_PRODUCTS,
    productColors:   SEED_COLORS,
    shots:           [],
    references:      [],
    btsIdeas:        [],
    matchingShirts:  [],
    stylingPairings: [],
    contentItems:    [],
    campaigns:       [],
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const useStore = create((set, get) => ({
  // --- Auth ---
  currentUser:  null,   // Supabase auth user object
  userProfile:  null,   // profiles row { username, workspace_name }
  isLoading:    true,
  authLoading:  false,
  error:        null,

  // --- Instagram ---
  instagramAccount: null,   // row from instagram_accounts table
  igMedia:          [],     // recent posts from IG API
  igLoading:        false,

  // --- Theme ---
  theme: getInitialTheme(),   // 'light' | 'dark' | 'system'

  setTheme(theme) {
    try { localStorage.setItem(LOCAL_THEME_KEY, theme) } catch {}
    applyThemeClass(theme)
    set({ theme })
  },

  // --- Data ---
  projects:        [],
  activeProjectId: null,
  products:        [],
  productColors:   [],
  shots:           [],
  references:      [],
  btsIdeas:        [],
  matchingShirts:  [],
  stylingPairings: [],
  contentItems:    [],
  campaigns:       [],

  // --- Init ---
  async init() {
    if (!isSupabaseConfigured) {
      const local = getLocalData() || buildInitialLocalData()
      set({
        currentUser:     { id: 'dev', email: 'dev@local' },
        userProfile:     { username: 'dev', workspace_name: 'Dev Workspace' },
        isLoading:       false,
        projects:        local.projects        || [SEED_PROJECT],
        activeProjectId: local.projects?.[0]?.id || null,
        products:        local.products        || SEED_PRODUCTS,
        productColors:   local.productColors   || SEED_COLORS,
        shots:           local.shots           || [],
        references:      local.references      || [],
        btsIdeas:        local.btsIdeas        || [],
        matchingShirts:  local.matchingShirts  || [],
        stylingPairings: local.stylingPairings || [],
      })
      return
    }

    // Hard timeout: never let loading screen stick for more than 6s
    const safetyTimer = setTimeout(() => {
      if (get().isLoading) {
        console.warn('Init timeout — forcing app to load')
        set({ isLoading: false })
      }
    }, 6000)

    try {
      // Check existing session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ currentUser: session.user })
        // Fire profile + data load in parallel — don't block on either
        Promise.all([
          get().loadUserProfile().catch((e) => console.error('profile load:', e)),
          get().loadFromSupabase().catch((e) => console.error('data load:', e)),
        ]).finally(() => {
          clearTimeout(safetyTimer)
          set({ isLoading: false })
        })
      } else {
        clearTimeout(safetyTimer)
        set({ isLoading: false, currentUser: null })
      }
    } catch (err) {
      console.error('init error:', err)
      clearTimeout(safetyTimer)
      set({ isLoading: false })
    }

    // Listen for auth state changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        set({ currentUser: session.user, isLoading: true })
        await get().loadUserProfile()
        await get().loadFromSupabase()
      } else if (event === 'SIGNED_OUT') {
        set({
          currentUser: null, userProfile: null,
          projects: [], products: [], productColors: [],
          shots: [], references: [], btsIdeas: [],
          matchingShirts: [], stylingPairings: [],
          activeProjectId: null, isLoading: false,
        })
      }
    })
  },

  async loadFromSupabase() {
    try {
      const safe = async (query) => {
        const { data, error } = await query
        if (error) console.error('Supabase query error:', error.message)
        return data || []
      }

      const [projects, products, productColors, shots, references, btsIdeas, matchingShirts, stylingPairings, contentItems, campaigns] =
        await Promise.all([
          safe(supabase.from('projects').select('*').order('created_at')),
          safe(supabase.from('products').select('*').order('priority').order('created_at')),
          safe(supabase.from('product_colors').select('*').order('created_at')),
          safe(supabase.from('shots').select('*').order('shot_number').order('created_at')),
          safe(supabase.from('shot_references').select('*').order('created_at')),
          safe(supabase.from('bts_ideas').select('*').order('created_at')),
          safe(supabase.from('matching_shirts').select('*').order('created_at')),
          safe(supabase.from('styling_pairings').select('*').order('created_at')),
          safe(supabase.from('content_items').select('*').order('created_at', { ascending: false })),
          safe(supabase.from('campaigns').select('*').order('created_at', { ascending: false })),
        ])

      set({
        projects,
        activeProjectId: projects[0]?.id || null,
        products,
        productColors,
        shots,
        references,
        btsIdeas,
        matchingShirts,
        stylingPairings,
        contentItems,
        campaigns,
      })
      // Load Instagram account in background — non-blocking
      get().loadInstagramAccount().catch((e) => console.error('IG load:', e))
    } catch (err) {
      console.error('loadFromSupabase:', err)
      set({ error: err.message })
    }
  },

  subscribeRealtime() {
    if (!isSupabaseConfigured) return () => {}
    const reload = () => get().loadFromSupabase()
    const channel = supabase
      .channel('shoot-os-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shots' },           reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'references' },      reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bts_ideas' },       reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matching_shirts' }, reload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'styling_pairings'},  reload)
      .subscribe()
    return () => supabase.removeChannel(channel)
  },

  // --- Auth ---
  async signUp({ email, username, password, workspaceName }) {
    set({ authLoading: true, error: null })
    try {
      // Check username availability first
      const { data: existing } = await supabase
        .from('profiles').select('id').eq('username', username).maybeSingle()
      if (existing) throw new Error('Username already taken')

      // Pass username + workspace as metadata — the DB trigger creates profile & project
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://indirookh-shoot-os.vercel.app',
          data: {
            username,
            workspace_name: workspaceName || username,
          },
        },
      })
      if (error) throw error

      set({ authLoading: false })
      // Return whether we got an immediate session (email confirm disabled)
      // or need to wait for email verification
      return { needsEmailConfirm: !data.session }
    } catch (err) {
      set({ authLoading: false, error: err.message })
      throw err
    }
  },

  async signIn({ emailOrUsername, password }) {
    set({ authLoading: true, error: null })
    try {
      let email = emailOrUsername.trim()
      if (!email.includes('@')) {
        // Username login — look up email via DB function
        const { data, error } = await supabase.rpc('get_email_by_username', { p_username: email })
        if (error || !data) throw new Error('Username not found')
        email = data
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      set({ authLoading: false })
    } catch (err) {
      set({ authLoading: false, error: err.message })
      throw err
    }
  },

  async signOut() {
    await supabase.auth.signOut()
    localStorage.removeItem(LOCAL_DATA_KEY)
  },

  async loadUserProfile() {
    const { data } = await supabase.from('profiles').select('*').maybeSingle()
    if (data) set({ userProfile: data })
  },

  // ── Instagram ──────────────────────────────────────────────────────────

  async loadInstagramAccount() {
    if (!isSupabaseConfigured) return null
    const { data } = await supabase.from('instagram_accounts').select('*').maybeSingle()
    set({ instagramAccount: data || null })
    return data
  },

  async disconnectInstagram() {
    const { currentUser } = get()
    if (!currentUser || !isSupabaseConfigured) return
    await supabase.from('instagram_accounts').delete().eq('user_id', currentUser.id)
    set({ instagramAccount: null, igMedia: [] })
  },

  async syncInstagramData(opts = {}) {
    const { instagramAccount } = get()
    if (!instagramAccount?.access_token) return
    set({ igLoading: true })
    try {
      const limit = opts.limit || 50
      // Fetch profile + media-with-insights in parallel
      const [profile, mediaData] = await Promise.all([
        fetchIgProfile(instagramAccount.access_token),
        fetchIgMediaWithInsights(instagramAccount.access_token, limit),
      ])
      if (isSupabaseConfigured) {
        await supabase.from('instagram_accounts').update({
          followers_count: profile.followers_count ?? instagramAccount.followers_count,
          media_count:     profile.media_count     ?? instagramAccount.media_count,
          last_synced_at:  new Date().toISOString(),
        }).eq('user_id', instagramAccount.user_id)
      }
      set({
        instagramAccount: { ...instagramAccount, ...profile },
        igMedia:          mediaData.data || [],
        igLoading:        false,
      })
    } catch (err) {
      console.error('syncInstagramData:', err)
      set({ igLoading: false })
    }
  },

  async updateUserProfile({ workspaceName, username, avatarUrl }) {
    const { currentUser } = get()
    if (!currentUser) throw new Error('Not logged in')
    const updates = { updated_at: new Date().toISOString() }
    if (workspaceName !== undefined) updates.workspace_name = workspaceName
    if (username      !== undefined) updates.username       = username
    if (avatarUrl     !== undefined) updates.avatar_url     = avatarUrl
    const { error } = await supabase.from('profiles').update(updates).eq('id', currentUser.id)
    if (error) throw error
    set((s) => ({ userProfile: { ...s.userProfile, ...updates } }))
  },

  async uploadAvatar(file) {
    if (!isSupabaseConfigured) return URL.createObjectURL(file)
    const ext  = file.name.split('.').pop()
    const path = `avatars/${uid()}.${ext}`
    const { error } = await supabase.storage.from('shoot-media').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('shoot-media').getPublicUrl(path)
    return data.publicUrl
  },

  // --- Local persistence ---
  _saveLocal() {
    if (isSupabaseConfigured) return
    const s = get()
    saveLocalData({
      projects:        s.projects,
      products:        s.products,
      productColors:   s.productColors,
      shots:           s.shots,
      references:      s.references,
      btsIdeas:        s.btsIdeas,
      matchingShirts:  s.matchingShirts,
      stylingPairings: s.stylingPairings,
      contentItems:    s.contentItems,
      campaigns:       s.campaigns,
    })
  },

  // --- Shots ---
  async addShot(shotData) {
    const { currentUser, activeProjectId, shots } = get()
    // Sanitize: convert empty strings to null for FK and optional fields
    const sanitize = (obj) => Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v])
    )
    const newShot = sanitize({
      id:           uid(),
      project_id:   activeProjectId,
      product_id:   null,
      color_id:     null,
      shot_number:  shots.filter((s) => s.shot_type === 'product').length + 1,
      status:       'pending',
      shot_type:    'product',
      media_type:   'photo',
      priority:     'normal',
      creator:      currentUser?.id || 'maam',
      created_at:   new Date().toISOString(),
      updated_at:   new Date().toISOString(),
      ...shotData,
    })
    set((state) => ({ shots: [...state.shots, newShot] }))
    get()._saveLocal()
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('shots').insert(newShot)
      if (error) console.error('Shot insert error:', error)
    }
    return newShot
  },

  async updateShot(id, updates) {
    set((state) => ({
      shots: state.shots.map((s) =>
        s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s
      ),
    }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('shots').update(updates).eq('id', id)
  },

  async deleteShot(id) {
    set((state) => ({ shots: state.shots.filter((s) => s.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('shots').delete().eq('id', id)
  },

  async markShotDone(id)    { return get().updateShot(id, { status: 'done' }) },
  async markShotPending(id) { return get().updateShot(id, { status: 'pending' }) },

  // --- References ---
  async addReference(refData) {
    const { currentUser, activeProjectId } = get()
    const sanitize = (obj) => Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, v === '' ? null : v])
    )
    const newRef = sanitize({
      id:         uid(),
      project_id: activeProjectId,
      shot_id:    null,
      product_id: null,
      creator:    currentUser?.id || 'maam',
      created_at: new Date().toISOString(),
      ...refData,
    })
    set((state) => ({ references: [...state.references, newRef] }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('shot_references').insert(newRef)
    return newRef
  },

  async deleteReference(id) {
    set((state) => ({ references: state.references.filter((r) => r.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('shot_references').delete().eq('id', id)
  },

  // --- BTS ---
  async addBTSIdea(ideaData) {
    const { currentUser, activeProjectId } = get()
    const newIdea = {
      id:         uid(),
      project_id: activeProjectId,
      type:       'general',
      creator:    currentUser?.id || 'maam',
      created_at: new Date().toISOString(),
      ...ideaData,
    }
    set((state) => ({ btsIdeas: [...state.btsIdeas, newIdea] }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('bts_ideas').insert(newIdea)
    return newIdea
  },

  async deleteBTSIdea(id) {
    set((state) => ({ btsIdeas: state.btsIdeas.filter((b) => b.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('bts_ideas').delete().eq('id', id)
  },

  // --- Matching shirts (legacy) ---
  async addMatchingShirt(shirtData) {
    const { currentUser } = get()
    const s = { id: uid(), creator: currentUser?.id || 'maam', created_at: new Date().toISOString(), ...shirtData }
    set((state) => ({ matchingShirts: [...state.matchingShirts, s] }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('matching_shirts').insert(s)
    return s
  },

  async deleteMatchingShirt(id) {
    set((state) => ({ matchingShirts: state.matchingShirts.filter((s) => s.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('matching_shirts').delete().eq('id', id)
  },

  // --- Styling pairings (new) ---
  async addStylingPairing(data) {
    const { currentUser } = get()
    const p = {
      id:           uid(),
      type:         'shirt',
      creator:      currentUser?.id || 'maam',
      created_at:   new Date().toISOString(),
      ...data,
    }
    set((state) => ({ stylingPairings: [...state.stylingPairings, p] }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('styling_pairings').insert(p)
    return p
  },

  async deleteStylingPairing(id) {
    set((state) => ({ stylingPairings: state.stylingPairings.filter((p) => p.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('styling_pairings').delete().eq('id', id)
  },

  async updateStylingPairing(id, updates) {
    set((state) => ({
      stylingPairings: state.stylingPairings.map((p) => p.id === id ? { ...p, ...updates } : p),
    }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('styling_pairings').update(updates).eq('id', id)
  },

  // --- Products ---
  async addProduct(productData) {
    const { activeProjectId } = get()
    const p = { id: uid(), project_id: activeProjectId, priority: 1, created_at: new Date().toISOString(), ...productData }
    set((state) => ({ products: [...state.products, p] }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('products').insert(p)
    return p
  },

  async addProductColor(colorData) {
    const c = { id: uid(), created_at: new Date().toISOString(), ...colorData }
    set((state) => ({ productColors: [...state.productColors, c] }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('product_colors').insert(c)
    return c
  },

  async deleteProductColor(id) {
    set((state) => ({ productColors: state.productColors.filter((c) => c.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('product_colors').delete().eq('id', id)
  },

  async deleteProduct(id) {
    set((state) => ({
      products:      state.products.filter((p) => p.id !== id),
      productColors: state.productColors.filter((c) => c.product_id !== id),
    }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('products').delete().eq('id', id)
  },

  async saveShootOrder(orderedIds) {
    const updates = orderedIds.map((id, i) => ({ id, shot_number: i + 1 }))
    set((state) => ({
      shots: state.shots.map((s) => {
        const u = updates.find((x) => x.id === s.id)
        return u ? { ...s, shot_number: u.shot_number } : s
      }),
    }))
    get()._saveLocal()
    if (isSupabaseConfigured) {
      await Promise.all(updates.map(({ id, shot_number }) =>
        supabase.from('shots').update({ shot_number }).eq('id', id)
      ))
    }
  },

  // --- Content Items (Instagram / Pinterest) ---
  async addContentItem(data) {
    const { currentUser, activeProjectId } = get()
    const item = {
      id:          uid(),
      project_id:  activeProjectId,
      user_id:     currentUser?.id,
      platform:    'instagram',
      status:      'idea',
      analytics:   {},
      created_at:  new Date().toISOString(),
      updated_at:  new Date().toISOString(),
      ...data,
    }
    set((s) => ({ contentItems: [item, ...s.contentItems] }))
    get()._saveLocal()
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('content_items').insert(item)
      if (error) console.error('content_items insert:', error)
    }
    return item
  },

  async updateContentItem(id, updates) {
    set((s) => ({
      contentItems: s.contentItems.map((c) =>
        c.id === id ? { ...c, ...updates, updated_at: new Date().toISOString() } : c
      ),
    }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('content_items').update(updates).eq('id', id)
  },

  async deleteContentItem(id) {
    set((s) => ({ contentItems: s.contentItems.filter((c) => c.id !== id) }))
    get()._saveLocal()
    if (isSupabaseConfigured) await supabase.from('content_items').delete().eq('id', id)
  },

  // --- Image upload ---
  async uploadImage(file) {
    if (!isSupabaseConfigured) return URL.createObjectURL(file)
    const ext  = file.name.split('.').pop()
    const path = `${uid()}.${ext}`
    const { error } = await supabase.storage.from('shoot-media').upload(path, file)
    if (error) {
      alert('Upload error: ' + error.message)
      return URL.createObjectURL(file)
    }
    const { data } = supabase.storage.from('shoot-media').getPublicUrl(path)
    return data.publicUrl
  },
}))

export default useStore
