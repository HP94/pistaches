import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Pistâches - Pister les tâches ménagères',
    short_name: 'Pistâches',
    description: 'Suivez et visualisez la répartition des tâches ménagères et de la charge mentale',
    start_url: '/',
    display: 'standalone',
    background_color: '#FAFAF8',
    theme_color: '#93C572',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
