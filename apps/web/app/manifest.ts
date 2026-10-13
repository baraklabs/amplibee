import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amplibee: free visibility check for your product',
    short_name: 'Amplibee',
    description: 'Check how visible your product is online, compare it with competitors and get a fix list.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f5f3',
    theme_color: '#f6f5f3',
    icons: [{ src: '/logo.png', sizes: '128x128', type: 'image/png' }],
  }
}
