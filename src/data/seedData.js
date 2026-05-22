export const SEED_PROJECT = {
  id: 'proj-indirookh-ss26',
  name: 'Indirookh SS26 Shoot',
  description: '2-day brand shoot — summer/spring collection',
  status: 'active',
  shoot_date: null,
}

export const SEED_PRODUCTS = [
  {
    id: 'prod-pants',
    project_id: 'proj-indirookh-ss26',
    name: 'Linen Pants',
    category: 'pants',
    description: 'Easy relaxed linen trousers — three colorways',
    priority: 1,
  },
  {
    id: 'prod-shorts',
    project_id: 'proj-indirookh-ss26',
    name: 'Shorts',
    category: 'shorts',
    description: 'Relaxed casual shorts — two colorways',
    priority: 1,
  },
  {
    id: 'prod-culottes',
    project_id: 'proj-indirookh-ss26',
    name: 'Culottes',
    category: 'culottes',
    description: 'Wide-leg cropped trousers — two colorways',
    priority: 1,
  },
  {
    id: 'prod-dress',
    project_id: 'proj-indirookh-ss26',
    name: 'Striped Dress',
    category: 'dress',
    description: 'The strip wali dress — hero piece',
    priority: 1,
  },
  {
    id: 'prod-tops',
    project_id: 'proj-indirookh-ss26',
    name: 'Shirts & Tops',
    category: 'top',
    description: 'Styling and layering pieces',
    priority: 2,
  },
]

export const SEED_COLORS = [
  // Linen Pants — Olive, Khaki, Black
  { id: 'col-pants-olive',   product_id: 'prod-pants',    color_name: 'Olive',   hex_code: '#6B6B42' },
  { id: 'col-pants-khaki',   product_id: 'prod-pants',    color_name: 'Khaki',   hex_code: '#C4A97D' },
  { id: 'col-pants-black',   product_id: 'prod-pants',    color_name: 'Black',   hex_code: '#1C1C1A' },
  // Shorts — Khaki, Maroon
  { id: 'col-shorts-khaki',  product_id: 'prod-shorts',   color_name: 'Khaki',   hex_code: '#C4A97D' },
  { id: 'col-shorts-maroon', product_id: 'prod-shorts',   color_name: 'Maroon',  hex_code: '#7A2535' },
  // Culottes — Khaki, Indigo
  { id: 'col-culottes-khaki',  product_id: 'prod-culottes', color_name: 'Khaki',  hex_code: '#C4A97D' },
  { id: 'col-culottes-indigo', product_id: 'prod-culottes', color_name: 'Indigo', hex_code: '#3D4B7A' },
  // Striped Dress
  { id: 'col-dress-stripe',  product_id: 'prod-dress',    color_name: 'Stripe',  hex_code: '#B5A898' },
  // Tops & Shirts
  { id: 'col-tops-white',    product_id: 'prod-tops',     color_name: 'White',   hex_code: '#FAFAF7' },
  { id: 'col-tops-beige',    product_id: 'prod-tops',     color_name: 'Beige',   hex_code: '#D4C9B5' },
  { id: 'col-tops-stripe',   product_id: 'prod-tops',     color_name: 'Stripe',  hex_code: '#9A9A88' },
]

export const CATEGORY_LABELS = {
  shorts:   'Shorts',
  pants:    'Pants',
  culottes: 'Culottes',
  dress:    'Dress',
  shirt:    'Shirt',
  top:      'Top / Shirt',
  other:    'Other',
}

export const SHOT_TYPE_LABELS = {
  product:  'Product',
  bts:      'BTS',
  extra:    'Extra',
  pinterest: 'Pinterest',
  meta_ad:  'Meta Ad',
}

export const MEDIA_TYPE_CONFIG = {
  photo: {
    label: 'Photo',
    icon: '📷',
    color: 'bg-camel-100 text-camel-500',
    description: 'Still image — product, pose, editorial',
  },
  video: {
    label: 'Video / Reel',
    icon: '🎬',
    color: 'bg-moss-100 text-moss-500',
    description: 'Movement, reel, BTS clip',
  },
}

export const LENS_FEEL_OPTIONS = [
  'Wide — 24mm feel',
  'Standard — 35mm feel',
  'Portrait — 50mm feel',
  'Telephoto — 85mm feel',
  'Compressed — 135mm feel',
]

export const MOVEMENT_OPTIONS = [
  'Static pose',
  'Slow walk toward camera',
  'Walk away',
  'Turn around',
  'Hair flip',
  'Natural movement',
  'Outfit spin',
  'Lean / slouch',
  'Hands in motion',
  'Look away + back',
]

export const BTS_TYPE_LABELS = {
  funny:         'Funny',
  reel:          'Reel Idea',
  camera_setup:  'Camera Setup',
  outfit_change: 'Outfit Change',
  candid:        'Candid',
  transition:    'Transition',
  how_made:      "How It's Made",
  other:         'Other',
  general:       'General',
}

export const PRIORITY_CONFIG = {
  high:     { label: 'High Priority', color: 'bg-earth-300 text-white' },
  normal:   { label: 'Normal',        color: 'bg-ivory-200 text-ink-600' },
  low:      { label: 'Low',           color: 'bg-ivory-200 text-ink-400' },
  optional: { label: 'Optional',      color: 'bg-ivory-200 text-ink-400' },
}

export const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-ivory-200 text-ink-600',
    dotColor: 'bg-ink-200',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-camel-100 text-camel-500',
    dotColor: 'bg-camel-300',
  },
  done: {
    label: 'Done',
    color: 'bg-moss-100 text-moss-500',
    dotColor: 'bg-moss-400',
  },
}

export const PAIRING_TYPE_CONFIG = {
  shirt:     { label: 'Shirt / Top',       icon: '👕', color: 'bg-camel-100 text-camel-500' },
  layer:     { label: 'Layering Idea',     icon: '🧥', color: 'bg-sand-100 text-earth-400'  },
  accessory: { label: 'Accessory',         icon: '✨', color: 'bg-ivory-200 text-ink-600'    },
  note:      { label: 'Styling Note',      icon: '📝', color: 'bg-ivory-200 text-ink-600'    },
  aesthetic: { label: 'Aesthetic Pairing', icon: '🎨', color: 'bg-moss-100 text-moss-500'    },
}

export const USERS = {
  maam:  { id: 'maam',  name: 'maam',  displayName: "Ma'am" },
  daksh: { id: 'daksh', name: 'daksh', displayName: 'Daksh' },
}

export const CREATOR_CONFIG = {
  maam:  { label: "Ma'am", color: 'bg-camel-100 text-camel-500'   },
  daksh: { label: 'Daksh', color: 'bg-earth-300/25 text-earth-500' },
}
