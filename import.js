import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const strapi = axios.create({
  baseURL: process.env.STRAPI_URL,
  headers: {
    Authorization: `Bearer ${process.env.STRAPI_TOKEN}`,
  },
});

async function importCities() {
  const { data: cities } = await supabase.from('cities').select('*');

  for (const city of cities) {
    await strapi.post('/api/cities', {
      data: {
        name: city.name,
        slug: city.slug,
        description: city.description,
        image_url: city.image_url,
        is_published: city.is_published,
        created_at: city.created_at,
      },
    });

    console.log(`Imported city: ${city.name}`);
  }
}

async function importArtists() {
  const { data: artists } = await supabase.from('artists').select('*');

  for (const artist of artists) {
    await strapi.post('/api/artists', {
      data: {
        name: artist.name,
        slug: artist.slug,
        bio: artist.bio,
        medium: artist.medium,
        rating: artist.rating,
        total_reviews: artist.total_reviews,
        profile_image: artist.profile_image,
        cover_image: artist.cover_image,
        is_published: artist.is_published,
        city: artist.city_id, // relation
      },
    });

    console.log(`Imported artist: ${artist.name}`);
  }
}

async function importArtworks() {
  const { data: artworks } = await supabase.from('artworks').select('*');

  for (const artwork of artworks) {
    await strapi.post('/api/artworks', {
      data: {
        title: artwork.title,
        image_url: artwork.image_url,
        year: artwork.year,
        medium: artwork.medium,
        dimensions: artwork.dimensions,
        price: artwork.price,
        artist: artwork.artist_id, // relation
      },
    });

    console.log(`Imported artwork: ${artwork.title}`);
  }
}

async function main() {
  await importCities();
  await importArtists();
  await importArtworks();
}

main();
