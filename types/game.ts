export type Operation = 'addition' | 'subtraction' | 'multiplication' | 'division' | 'mixed';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  num1: number;
  num2: number;
  operation: Exclude<Operation, 'mixed'>;
  answer: number;
  display: string;
}

export interface GameSession {
  id?: string;
  playerId: string;
  operation: Operation;
  difficulty: Difficulty;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  durationSeconds: number;
  stars: number;
  playedAt?: string;
}

export interface Player {
  id: string;
  name: string;
  avatarColor: string;
  totalScore: number;
  gamesPlayed: number;
  currentStreak: number;
  lastPlayedDate?: string;
  createdAt?: string;
}

export interface GameMode {
  id: Operation;
  label: string;
  emoji: string;
  color: string;
  lightColor: string;
  description: string;
}

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  range: [number, number];
  timePerQuestion: number;
  pointsPerCorrect: number;
}

export interface GameState {
  questions: Question[];
  currentIndex: number;
  score: number;
  correctAnswers: number;
  startTime: number;
  isComplete: boolean;
  userAnswer: string;
  feedback: 'none' | 'correct' | 'incorrect';
}
