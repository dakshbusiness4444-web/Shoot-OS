import { create } from 'zustand'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { SEED_PROJECT, SEED_PRODUCTS, SEED_COLORS, USERS } from '../data/seedData'

const LOCAL_USER_KEY  = 'shootos_user'
const LOCAL_DATA_KEY  = 'shootos_data_v2'   // v2 forces re-seed with new product names

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
  }
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

const useStore = create((set, get) => ({
  // --- Auth ---
  currentUser: null,
  isLoading:   true,
  error:       null,

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

  // --- Init ---
  init() {
    const storedUser = localStorage.getItem(LOCAL_USER_KEY)
    const user = storedUser ? JSON.parse(storedUser) : null

    if (!isSupabaseConfigured) {
      const local = getLocalData() || buildInitialLocalData()
      set({
        currentUser:     user,
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

    set({ currentUser: user, isLoading: true })
    get().loadFromSupabase()
  },

  async loadFromSupabase() {
    try {
      const [
        { data: projects },
        { data: products },
        { data: productColors },
        { data: shots },
        { data: references },
        { data: btsIdeas },
        { data: matchingShirts },
        { data: stylingPairings },
      ] = await Promise.all([
        supabase.from('projects').select('*').order('created_at'),
        supabase.from('products').select('*').order('priority').order('created_at'),
        supabase.from('product_colors').select('*').order('created_at'),
        supabase.from('shots').select('*').order('shot_number').order('created_at'),
        supabase.from('shot_references').select('*').order('created_at'),
        supabase.from('bts_ideas').select('*').order('created_at'),
        supabase.from('matching_shirts').select('*').order('created_at'),
        supabase.from('styling_pairings').select('*').order('created_at'),
      ])
      set({
        isLoading:       false,
        projects:        projects        || [],
        activeProjectId: (projects || [])[0]?.id || null,
        products:        products        || [],
        productColors:   productColors   || [],
        shots:           shots           || [],
        references:      references      || [],
        btsIdeas:        btsIdeas        || [],
        matchingShirts:  matchingShirts  || [],
        stylingPairings: stylingPairings || [],
      })
    } catch (err) {
      set({ isLoading: false, error: err.message })
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
  loginAs(userKey) {
    const user = USERS[userKey]
    if (!user) return
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user))
    set({ currentUser: user })
  },
  logout() {
    localStorage.removeItem(LOCAL_USER_KEY)
    set({ currentUser: null })
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
    })
  },

  // --- Shots ---
  async addShot(shotData) {
    const { currentUser, activeProjectId, shots } = get()
    const newShot = {
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
    }
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
    const newRef = {
      id:         uid(),
      project_id: activeProjectId,
      shot_id:    null,
      product_id: null,
      creator:    currentUser?.id || 'maam',
      created_at: new Date().toISOString(),
      ...refData,
    }
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
