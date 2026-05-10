import * as LucideIcons from 'lucide-react'

// Lucide components are forwardRef objects (typeof === 'object'), not plain functions.
// Exclude Icon-suffixed and Lucide-prefixed aliases to keep one canonical name per icon.
export const LUCIDE_ICONS = Object.entries(LucideIcons)
  .filter(
    ([name, val]) =>
      /^[A-Z]/.test(name) &&
      val !== null &&
      typeof val === 'object' &&
      !name.endsWith('Icon') &&
      !name.startsWith('Lucide')
  )
  .map(([name, Icon]) => ({ name, Icon }))

export const DEFAULT_ICON_NAMES = [
  'Home', 'Star', 'Heart', 'Smile', 'Briefcase', 'Wallet', 'ShoppingCart',
  'Car', 'Plane', 'Book', 'Music', 'Coffee', 'Pizza', 'Dog', 'Cat',
  'Dumbbell', 'Laptop', 'Smartphone', 'Camera', 'Globe', 'Map', 'Gift',
  'Cake', 'Sun', 'Moon', 'Cloud', 'Umbrella', 'Leaf', 'Flower2', 'Baby',
  'Users', 'Building', 'School', 'Hospital', 'Train', 'Bike', 'Scissors',
  'Palette', 'Gamepad2', 'Flame',
]

export const DEFAULT_ICONS = LUCIDE_ICONS.filter((i) =>
  DEFAULT_ICON_NAMES.includes(i.name)
)
