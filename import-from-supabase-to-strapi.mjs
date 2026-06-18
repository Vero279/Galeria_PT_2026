import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const strapi = axios.create({
  baseURL: process.env.STRAPI_URL,
  headers: { Authorization: `Bearer ${process.env.STRAPI_TOKEN}` },
});

// ID maps
const idMaps = {
  city: new Map(),
  artist: new Map(),
  artwork: new Map(),
  artistQuiz: new Map(),
};

async function fetchAll(table) {
  const { data, error } = await supabase.from(table).select('*');
  if (error) throw error;
  return data || [];
}

async function createStrapi(path, payload) {
  try {
    const res = await strapi.post(path, { data: payload });
    return res.data.data;
  } catch (err) {
    console.error(`❌ Error creating ${path}`, err.response?.data?.error || err.message);
    return null;
  }
}

/* -------------------- CITY -------------------- */

async function importCities() {
  const cities = await fetchAll('cities');

  for (const c of cities) {
    const created = await createStrapi('/api/cities', {
      name: c.name,
      slug: c.slug,
      image_url: c.image_url || 'https://placehold.co/600x400',
      description: c.description || '',
      is_published: c.is_published ?? true,
    });

    if (created) {
      idMaps.city.set(String(c.id), created.id);
      console.log(`✅ City: ${c.name}`);
    }
  }
}

/* -------------------- ARTIST -------------------- */

async function importArtists() {
  const artists = await fetchAll('artists');

  for (const a of artists) {
    const created = await createStrapi('/api/artists', {
      name: a.name,
      slug: a.slug,
      bio: a.bio || '',
      profile_image: a.profile_image || '',
      cover_image: a.cover_image || '',
      medium: a.medium || '',
      is_published: a.is_published ?? true,
      rating: a.rating ?? 0,
      total_reviews: a.total_reviews ?? 0,
      city: idMaps.city.get(String(a.city_id)) || null,
    });

    if (created) {
      idMaps.artist.set(String(a.id), created.id);
      console.log(`✅ Artist: ${a.name}`);
    }
  }
}

/* -------------------- ARTWORK -------------------- */

async function importArtworks() {
  const artworks = await fetchAll('artworks');

  for (const aw of artworks) {
    const created = await createStrapi('/api/artworks', {
      title: aw.title,
      image_url: aw.image_url || 'https://placehold.co/600x400',
      year: aw.year || 2024,
      medium: aw.medium || '',
      dimensions: aw.dimensions || '',
      price: aw.price ?? 0,
      description: [], // blocks field must be an array
      artist: idMaps.artist.get(String(aw.artist_id)) || null,
      isPublished: true,
    });

    if (created) {
      idMaps.artwork.set(String(aw.id), created.id);
      console.log(`✅ Artwork: ${aw.title}`);
    }
  }
}

/* -------------------- ARTIST EVENTS -------------------- */

async function importArtistEvents() {
  const events = await fetchAll('artist_events');

  for (const e of events) {
    const created = await createStrapi('/api/artist-events', {
      title: e.title,
      description: e.description || '',
      event_date: e.event_date,
      location: e.location || 'Unknown',
      image_url: e.image_url || '',
      isPublished: true,
      city: idMaps.city.get(String(e.city_id)) || null,
      artist: idMaps.artist.get(String(e.artist_id)) || null,
    });

    if (created) console.log(`✅ Event: ${e.title}`);
  }
}

/* -------------------- ARTIST QUIZZES -------------------- */

async function importArtistQuizzes() {
  const quizzes = await fetchAll('artist_quizzes');

  for (const q of quizzes) {
    const created = await createStrapi('/api/artist-quizzes', {
      title: q.title,
      description: q.description || '',
      isPublished: true,
      artist: idMaps.artist.get(String(q.artist_id)) || null,
    });

    if (created) {
      idMaps.artistQuiz.set(String(q.id), created.id);
      console.log(`✅ Quiz: ${q.title}`);
    }
  }
}

/* -------------------- QUIZ QUESTIONS -------------------- */

async function importQuizQuestions() {
  const questions = await fetchAll('quiz_questions');

  for (const q of questions) {
    const created = await createStrapi('/api/quiz-questions', {
      question: q.question,
      correct_answer: q.correct_answer,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      artist_quiz: idMaps.artistQuiz.get(String(q.quiz_id)) || null,
    });

    if (created) console.log(`✅ Question: ${q.question}`);
  }
}

/* -------------------- MAIN -------------------- */

async function main() {
  console.log('🚀 Import started');

  await importCities();
  await importArtists();
  await importArtworks();
  await importArtistEvents();
  await importArtistQuizzes();
  await importQuizQuestions();

  console.log('🎉 Import complete');
}

main();
