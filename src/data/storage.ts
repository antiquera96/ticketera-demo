import type { StoreState } from '../types'
import { getSeedState } from './seed'

const KEY = 'ticketera_demo_v1'

export function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) {
      const seed = getSeedState()
      saveState(seed)
      return seed
    }
    return JSON.parse(raw) as StoreState
  } catch {
    const seed = getSeedState()
    saveState(seed)
    return seed
  }
}

export function saveState(state: StoreState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* noop */
  }
}

export function resetState(): StoreState {
  const seed = getSeedState()
  saveState(seed)
  return seed
}
