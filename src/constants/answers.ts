import { MagicAnswer } from '../types';

export const CLASSIC_MAGIC_ANSWERS: MagicAnswer[] = [
  // Affirmative (10)
  { id: 1, text: 'It is certain', sentiment: 'positive' },
  { id: 2, text: 'It is decidedly so', sentiment: 'positive' },
  { id: 3, text: 'Without a doubt', sentiment: 'positive' },
  { id: 4, text: 'Yes definitely', sentiment: 'positive' },
  { id: 5, text: 'You may rely on it', sentiment: 'positive' },
  { id: 6, text: 'As I see it, yes', sentiment: 'positive' },
  { id: 7, text: 'Most likely', sentiment: 'positive' },
  { id: 8, text: 'Outlook good', sentiment: 'positive' },
  { id: 9, text: 'Yes', sentiment: 'positive' },
  { id: 10, text: 'Signs point to yes', sentiment: 'positive' },

  // Non-committal / Neutral (5)
  { id: 11, text: 'Reply hazy, try again', sentiment: 'neutral' },
  { id: 12, text: 'Ask again later', sentiment: 'neutral' },
  { id: 13, text: 'Better not tell you now', sentiment: 'neutral' },
  { id: 14, text: 'Cannot predict now', sentiment: 'neutral' },
  { id: 15, text: 'Concentrate and ask again', sentiment: 'neutral' },

  // Negative (5)
  { id: 16, text: "Don't count on it", sentiment: 'negative' },
  { id: 17, text: 'My reply is no', sentiment: 'negative' },
  { id: 18, text: 'My sources say no', sentiment: 'negative' },
  { id: 19, text: 'Outlook not so good', sentiment: 'negative' },
  { id: 20, text: 'Very doubtful', sentiment: 'negative' },
];

export const INITIAL_DEFAULT_TEXT = 'Shake it baby';

export function getRandomAnswer(excludeId?: number): MagicAnswer {
  const pool = excludeId
    ? CLASSIC_MAGIC_ANSWERS.filter((a) => a.id !== excludeId)
    : CLASSIC_MAGIC_ANSWERS;
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
}
