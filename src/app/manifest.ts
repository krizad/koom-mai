import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koom Mai',
    short_name: 'Koom Mai',
    description: 'Koom Mai Application',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/logo.png`,
        sizes: 'any',
        type: 'image/png',
      },
    ],
  };
}
