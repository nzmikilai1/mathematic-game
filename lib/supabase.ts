import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function createPlayer(name: string, avatarColor: string) {
  const { data, error } = await supabase
    .from('players')
    .insert({ name, avatar_color: avatarColor })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayer(id: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updatePlayerStats(id: string, scoreToAdd: number) {
  const today = new Date().toISOString().split('T')[0];
  const player = await getPlayer(id);
  if (!player) return;

  const lastPlayed = player.last_played_date;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const newStreak = lastPlayed === yesterday ? player.current_streak + 1 : lastPlayed === today ? player.current_streak : 1;

  const { error } = await supabase
    .from('players')
    .update({
      total_score: player.total_score + scoreToAdd,
      games_played: player.games_played + 1,
      current_streak: newStreak,
      last_played_date: today,
    })
    .eq('id', id);
  if (error) throw error;
}

export async function saveGameSession(session: {
  player_id: string;
  operation: string;
  difficulty: string;
  score: number;
  correct_answers: number;
  total_questions: number;
  duration_seconds: number;
  stars: number;
}) {
  const { data, error } = await supabase
    .from('game_sessions')
    .insert(session)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getPlayerSessions(playerId: string, limit = 10) {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('player_id', playerId)
    .order('played_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function getLeaderboard(limit = 10) {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, avatar_color, total_score, games_played')
    .order('total_score', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
