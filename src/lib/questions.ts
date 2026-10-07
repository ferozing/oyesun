import "server-only";

/**
 * Read the Room question bank. English only for now.
 *
 * Each question has one right answer, one near miss and one that is plainly
 * wrong. The near miss is the same family of feeling as the right one (low vs
 * lonely, nervous vs restless), so getting it is close but not quite reading
 * the room. Scoring lives in the answer route; the indexes never leave the server.
 */
export type Question = {
  id: number;
  msg: string;
  opts: [string, string, string];
  /** The right answer. */
  a: 0 | 1 | 2;
  /** The near miss, worth fewer points. */
  c: 0 | 1 | 2;
};

export const QUESTIONS: Question[] = [
  { id: 1, msg: "starting the gym tomorrow. this time i mean it", opts: ["Hopeful", "Guilty", "Angry"], a: 0, c: 1 },
  { id: 2, msg: "everyone's busy. nobody even calls anymore", opts: ["Excited", "Lonely", "Sleepy"], a: 1, c: 2 },
  { id: 3, msg: "RESULTS ARE OUT. 92 PERCENT!!!", opts: ["Anxious", "Bored", "Proud"], a: 2, c: 0 },
  { id: 4, msg: "interview tomorrow and i cannot fall asleep", opts: ["Nervous", "Proud", "Bored"], a: 0, c: 2 },
  { id: 5, msg: "she left my message on read. again", opts: ["Grateful", "Hurt", "Sleepy"], a: 1, c: 2 },
  { id: 6, msg: "finally the weekend. doing absolutely nothing today", opts: ["Guilty", "Anxious", "Relaxed"], a: 2, c: 0 },
  { id: 7, msg: "mum made my favourite today without me asking", opts: ["Happy", "Angry", "Nervous"], a: 0, c: 2 },
  { id: 8, msg: "nothing feels good today. i don't know why", opts: ["Excited", "Low", "Proud"], a: 1, c: 0 },
  { id: 9, msg: "my boss told me off in front of everyone. it wasn't even my fault", opts: ["Calm", "Hurt", "Angry"], a: 2, c: 1 },
  { id: 10, msg: "missing home a lot today", opts: ["Homesick", "Low", "Bored"], a: 0, c: 1 },
  { id: 11, msg: "i keep saying i'm fine. i'm not", opts: ["Excited", "Low", "Angry"], a: 1, c: 2 },
  { id: 12, msg: "I GOT THE OFFER!! still shaking", opts: ["Sad", "Nervous", "Thrilled"], a: 2, c: 1 },
  { id: 13, msg: "exam in the morning and my mind has gone blank", opts: ["Anxious", "Relaxed", "Proud"], a: 0, c: 2 },
  { id: 14, msg: "haven't seen my parents in eight months", opts: ["Angry", "Homesick", "Excited"], a: 1, c: 0 },
  { id: 15, msg: "he showed up late again. third time this week", opts: ["Grateful", "Calm", "Irritated"], a: 2, c: 1 },
  { id: 16, msg: "don't feel like talking to anyone right now", opts: ["Low", "Proud", "Excited"], a: 0, c: 2 },
  { id: 17, msg: "so tired i can't even think straight", opts: ["Excited", "Exhausted", "Angry"], a: 1, c: 0 },
  { id: 18, msg: "I PASSED!! i genuinely cannot believe it", opts: ["Nervous", "Sad", "Overjoyed"], a: 2, c: 0 },
  { id: 19, msg: "it's 3am and my brain won't shut up", opts: ["Restless", "Proud", "Bored"], a: 0, c: 2 },
  { id: 20, msg: "nobody spoke to me all day today", opts: ["Thrilled", "Lonely", "Angry"], a: 1, c: 2 },
  { id: 21, msg: "home food after four months. nothing beats this", opts: ["Anxious", "Guilty", "Content"], a: 2, c: 1 },
  { id: 22, msg: "he talked over me the entire meeting", opts: ["Angry", "Hurt", "Hopeful"], a: 0, c: 1 },
  { id: 23, msg: "honestly i don't even know what i'm feeling right now", opts: ["Proud", "Confused", "Thrilled"], a: 1, c: 0 },
  { id: 24, msg: "first salary credited. i want to tell everyone", opts: ["Nervous", "Lonely", "Excited"], a: 2, c: 0 },
  { id: 25, msg: "presentation in an hour and my hands are shaking", opts: ["Nervous", "Bored", "Proud"], a: 0, c: 2 },
  { id: 26, msg: "they all went out again and didn't ask me", opts: ["Grateful", "Left out", "Sleepy"], a: 1, c: 2 },
  { id: 27, msg: "just finished my first 10k run", opts: ["Anxious", "Tired", "Proud"], a: 2, c: 1 },
  { id: 28, msg: "i can't stop thinking about what i said to her", opts: ["Guilty", "Restless", "Relaxed"], a: 0, c: 1 },
  { id: 29, msg: "3am again. sleep is just not happening", opts: ["Excited", "Restless", "Proud"], a: 1, c: 0 },
  { id: 30, msg: "so much to revise and nothing is staying in my head", opts: ["Relaxed", "Grateful", "Stressed"], a: 2, c: 0 },
  { id: 31, msg: "cooked for myself for the first time and everyone liked it", opts: ["Proud", "Happy", "Angry"], a: 0, c: 1 },
  { id: 32, msg: "same routine every single day. nothing changes", opts: ["Angry", "Bored", "Proud"], a: 1, c: 0 },
  { id: 33, msg: "told them how i actually felt and they listened", opts: ["Relieved", "Nervous", "Bored"], a: 0, c: 1 },
  { id: 34, msg: "everyone my age seems to have it figured out except me", opts: ["Thrilled", "Behind", "Sleepy"], a: 1, c: 2 },
  { id: 35, msg: "she said yes. we're actually doing this", opts: ["Worried", "Calm", "Overjoyed"], a: 2, c: 0 },
  { id: 36, msg: "i keep checking my phone hoping they replied", opts: ["Anxious", "Hopeful", "Bored"], a: 0, c: 1 },
];

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
export const getQuestion = (id: number) => byId.get(id);

/** How many spots an answer is worth. Wrong answers cost you. */
export function gainFor(q: Question, choice: number): { gain: number; verdict: "right" | "close" | "wrong" } {
  if (choice === q.a) return { gain: 5, verdict: "right" };
  if (choice === q.c) return { gain: 2, verdict: "close" };
  return { gain: -2, verdict: "wrong" };
}

// Three distinct random questions.
export function pickQuestionIds(n = 3): number[] {
  const ids = QUESTIONS.map((q) => q.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids.slice(0, n);
}

// What the browser is allowed to see.
export const publicQuestion = (q: Question) => ({ id: q.id, msg: q.msg, opts: q.opts });
