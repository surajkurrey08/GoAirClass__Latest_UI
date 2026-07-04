// src/services/heroImageService.js
const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

const getAuthHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
})

const FALLBACKS = {
  home:   [
    { id: 1, url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=90' },
    { id: 2, url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90' },
    { id: 3, url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&q=90' },
  ],
  flight: [{ id: 1, url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=90' }],
  hotel:  [{ id: 1, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=90' }],
  train:  [{ id: 1, url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=1920&q=90' }],
  bus:    [{ id: 1, url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920&q=90' }],
}

export const getHeroImages = async (type = 'home') => {
  try {
    const res = await fetch(`${BASE_URL}/hero-images?type=${type}`)
    if (!res.ok) throw new Error('Failed')
    const data = await res.json()
    return data.length > 0 ? data : FALLBACKS[type] || FALLBACKS.home
  } catch (err) {
    return FALLBACKS[type] || FALLBACKS.home
  }
}

export const uploadHeroImage = async (file, title = '', type = 'home') => {
  const formData = new FormData()
  formData.append('image', file)
  formData.append('title', title)
  formData.append('type', type)
  const res = await fetch(`${BASE_URL}/hero-images`, {
    method: 'POST',
    headers: getAuthHeader(),
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export const deleteHeroImage = async (id) => {
  const res = await fetch(`${BASE_URL}/hero-images/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader(),
  })
  if (!res.ok) throw new Error('Delete failed')
  return res.json()
}