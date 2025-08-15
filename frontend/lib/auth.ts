export function getUserId(): string | null {
  try {
    if (typeof window === 'undefined') return null
    const id = localStorage.getItem('userId')
    if (id) return id
    const newId = `u_${Math.random().toString(36).slice(2)}${Date.now()}`
    localStorage.setItem('userId', newId)
    return newId
  } catch {
    return null
  }
}
