import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

// ✅ Use your real values from Supabase dashboard
const supabaseUrl = "https://fzqjbmucaqaftxnuxfbm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6cWpibXVjYXFhZnR4bnV4ZmJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTg1MDYsImV4cCI6MjA5MjEzNDUwNn0.FRYk_bzQw-5Hyq6BIv7OjhUgq2Wk7GMoULagW7PL6Fk";


// ✅ Create client (Expo-safe)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    enabled: false, // 🚨 CRITICAL for Expo APK
  },
})

/* =========================
   PLAYER FUNCTIONS
========================= */

export async function createPlayer(name: string, avatarColor: string) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      name,
      avatar_color: avatarColor,
      total_score: 0,
      games_played: 0,
      current_streak: 0,
      last_played_date: null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPlayer(id: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updatePlayerStats(id: string, scoreToAdd: number) {
  const today = new Date().toISOString().split('T')[0]
  const player = await getPlayer(id)

  if (!player) return

  const yesterday = new Date(Date.now() - 86400000)
    .toISOString()
    .split('T')[0]

  let newStreak = 1

  if (player.last_played_date === today) {
    newStreak = player.current_streak
  } else if (player.last_played_date === yesterday) {
    newStreak = player.current_streak + 1
  }

  const { error } = await supabase
    .from('players')
    .update({
      total_score: player.total_score + scoreToAdd,
      games_played: player.games_played + 1,
      current_streak: newStreak,
      last_played_date: today,
    })
    .eq('id', id)

  if (error) throw error
}

/* =========================
   GAME SESSIONS
========================= */

export async function saveGameSession(session: {
  player_id: string
  operation: string
  difficulty: string
  score: number
  correct_answers: number
  total_questions: number
  duration_seconds: number
  stars: number
}) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert(session)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getPlayerSessions(playerId: string, limit = 10) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('player_id', playerId)
    .order('played_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}

/* =========================
   LEADERBOARD
========================= */

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, avatar_color, total_score, games_played')
    .order('total_score', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data ?? []
}