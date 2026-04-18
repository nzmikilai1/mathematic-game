import type { Question, Operation, Difficulty, DifficultyConfig, GameMode } from '@/types/game';

export const GAME_MODES: GameMode[] = [
  {
    id: 'addition',
    label: 'Addition',
    emoji: '➕',
    color: '#FF9A3C',
    lightColor: '#FFF0E0',
    description: 'Add numbers together',
  },
  {
    id: 'subtraction',
    label: 'Subtraction',
    emoji: '➖',
    color: '#74B9FF',
    lightColor: '#E8F4FF',
    description: 'Find the difference',
  },
  {
    id: 'multiplication',
    label: 'Multiply',
    emoji: '✖️',
    color: '#6BCB77',
    lightColor: '#E8F7EA',
    description: 'Multiply numbers',
  },
  {
    id: 'division',
    label: 'Division',
    emoji: '➗',
    color: '#FF85A1',
    lightColor: '#FFE8EE',
    description: 'Divide numbers',
  },
  {
    id: 'mixed',
    label: 'Mixed',
    emoji: '🌟',
    color: '#4ECDC4',
    lightColor: '#E0F7F6',
    description: 'All operations!',
  },
];

export const DIFFICULTY_CONFIGS: DifficultyConfig[] = [
  { id: 'easy', label: 'Easy', range: [1, 10], timePerQuestion: 15, pointsPerCorrect: 10 },
  { id: 'medium', label: 'Medium', range: [1, 20], timePerQuestion: 12, pointsPerCorrect: 20 },
  { id: 'hard', label: 'Hard', range: [1, 50], timePerQuestion: 10, pointsPerCorrect: 30 },
];

const TOTAL_QUESTIONS = 10;

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion(
  op: Exclude<Operation, 'mixed'>,
  range: [number, number]
): Question {
  const [min, max] = range;
  let num1: number, num2: number, answer: number, display: string;

  switch (op) {
    case 'addition':
      num1 = randomInt(min, max);
      num2 = randomInt(min, max);
      answer = num1 + num2;
      display = `${num1} + ${num2}`;
      break;
    case 'subtraction':
      num1 = randomInt(min, max);
      num2 = randomInt(min, num1);
      answer = num1 - num2;
      display = `${num1} - ${num2}`;
      break;
    case 'multiplication': {
      const multMax = Math.min(max, 12);
      num1 = randomInt(1, multMax);
      num2 = randomInt(1, multMax);
      answer = num1 * num2;
      display = `${num1} × ${num2}`;
      break;
    }
    case 'division': {
      const divMax = Math.min(max, 12);
      num2 = randomInt(1, divMax);
      answer = randomInt(1, divMax);
      num1 = num2 * answer;
      display = `${num1} ÷ ${num2}`;
      break;
    }
  }

  return { num1: num1!, num2: num2!, operation: op, answer: answer!, display: display! };
}

export function generateQuestions(operation: Operation, difficulty: Difficulty): Question[] {
  const config = DIFFICULTY_CONFIGS.find((d) => d.id === difficulty)!;
  const ops: Exclude<Operation, 'mixed'>[] = ['addition', 'subtraction', 'multiplication', 'division'];

  return Array.from({ length: TOTAL_QUESTIONS }, (_, i) => {
    const op =
      operation === 'mixed' ? ops[i % ops.length] : (operation as Exclude<Operation, 'mixed'>);
    return generateQuestion(op, config.range);
  });
}

export function calculateStars(correct: number, total: number): number {
  const pct = correct / total;
  if (pct >= 0.9) return 3;
  if (pct >= 0.6) return 2;
  if (pct >= 0.3) return 1;
  return 0;
}

export function calculateScore(
  correct: number,
  total: number,
  durationSeconds: number,
  difficulty: Difficulty
): number {
  const config = DIFFICULTY_CONFIGS.find((d) => d.id === difficulty)!;
  const base = correct * config.pointsPerCorrect;
  const timeBonus = Math.max(0, Math.floor((total * config.timePerQuestion - durationSeconds) * 0.5));
  return base + timeBonus;
}

export function getOperationColor(op: Operation): string {
  return GAME_MODES.find((m) => m.id === op)?.color ?? '#FF6B6B';
}

export function getModeById(id: Operation): GameMode {
  return GAME_MODES.find((m) => m.id === id) ?? GAME_MODES[0];
}

export const AVATAR_COLORS = [
  '#FF6B6B', '#FF9A3C', '#FFD93D', '#6BCB77',
  '#4ECDC4', '#74B9FF', '#FF85A1', '#A29BFE',
];

export const TOTAL_Q = TOTAL_QUESTIONS;
