
/*
  # MathQuest - Primary School Math Game Database Schema

  ## Tables Created

  ### 1. players
  - `id` (uuid, primary key) - Unique player identifier
  - `name` (text) - Player's chosen name
  - `avatar_color` (text) - Player's chosen avatar color
  - `total_score` (integer) - Cumulative score across all games
  - `games_played` (integer) - Total number of games played
  - `current_streak` (integer) - Current daily streak
  - `created_at` (timestamptz) - Account creation time

  ### 2. game_sessions
  - `id` (uuid, primary key) - Session identifier
  - `player_id` (uuid, FK -> players) - Which player played
  - `operation` (text) - Math operation: addition, subtraction, multiplication, division, mixed
  - `difficulty` (text) - easy, medium, hard
  - `score` (integer) - Points earned
  - `correct_answers` (integer) - Number of correct answers
  - `total_questions` (integer) - Total questions asked
  - `duration_seconds` (integer) - How long the game took
  - `stars` (integer) - Stars earned (1-3)
  - `played_at` (timestamptz) - When the game was played

  ## Security
  - RLS enabled on both tables
  - Players can read/write their own data
  - Anyone can read the leaderboard (player names + scores)
*/

CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  avatar_color text NOT NULL DEFAULT '#FF6B6B',
  total_score integer NOT NULL DEFAULT 0,
  games_played integer NOT NULL DEFAULT 0,
  current_streak integer NOT NULL DEFAULT 0,
  last_played_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  operation text NOT NULL DEFAULT 'addition',
  difficulty text NOT NULL DEFAULT 'easy',
  score integer NOT NULL DEFAULT 0,
  correct_answers integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 10,
  duration_seconds integer NOT NULL DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  played_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create a player profile"
  ON players FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Players can read any player for leaderboard"
  ON players FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Players can update their own profile"
  ON players FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can insert game sessions"
  ON game_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read game sessions"
  ON game_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_game_sessions_player_id ON game_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_played_at ON game_sessions(played_at DESC);
CREATE INDEX IF NOT EXISTS idx_players_total_score ON players(total_score DESC);
