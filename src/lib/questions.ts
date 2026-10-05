import "server-only";

// Read the Room question bank. Answers (a) live only on the server.
export type Question = { id: number; msg: string; opts: [string, string, string]; a: 0 | 1 | 2 };

export const QUESTIONS: Question[] = [
  { id: 1, msg: "kal se gym pakka. is baar serious hoon", opts: ["Hopeful", "Sad", "Angry"], a: 0 },
  { id: 2, msg: "sab busy hain, koi call bhi nahi karta", opts: ["Excited", "Lonely", "Sleepy"], a: 1 },
  { id: 3, msg: "RESULT AAGAYA. 92 PERCENT!!!", opts: ["Anxious", "Bored", "Proud"], a: 2 },
  { id: 4, msg: "kal interview hai aur neend hi nahi aa rahi", opts: ["Nervous", "Proud", "Bored"], a: 0 },
  { id: 5, msg: "usne phir se mera message seen karke chhod diya", opts: ["Grateful", "Hurt", "Sleepy"], a: 1 },
  { id: 6, msg: "finally weekend!! poora din kuch nahi karna", opts: ["Guilty", "Anxious", "Relaxed"], a: 2 },
  { id: 7, msg: "mummy ne aaj mera favourite rajma banaya", opts: ["Happy", "Angry", "Nervous"], a: 0 },
  { id: 8, msg: "bas yaar, kuch acha nahi lag raha aaj", opts: ["Excited", "Low", "Proud"], a: 1 },
  { id: 9, msg: "boss ne sabke saamne daant diya. bilkul galat tha", opts: ["Calm", "Grateful", "Angry"], a: 2 },
  { id: 10, msg: "ghar ki bahut yaad aa rahi hai aaj", opts: ["Homesick", "Proud", "Bored"], a: 0 },
  { id: 11, msg: "nenu okay ne, kani kaadu", opts: ["Excited", "Low", "Angry"], a: 1 },
  { id: 12, msg: "job vachindi ra!! nammalekapotunna", opts: ["Sad", "Bored", "Thrilled"], a: 2 },
  { id: 13, msg: "repu exam undi, chala bhayam ga undi", opts: ["Anxious", "Relaxed", "Proud"], a: 0 },
  { id: 14, msg: "amma ni chala miss avutunna", opts: ["Angry", "Homesick", "Excited"], a: 1 },
  { id: 15, msg: "vaadu malli late ga vachadu. visugu vastundi", opts: ["Grateful", "Calm", "Irritated"], a: 2 },
  { id: 16, msg: "manasu baagaledu ra, evaritho matladalani ledu", opts: ["Low", "Proud", "Excited"], a: 0 },
  { id: 17, msg: "romba tired ah irukku, onnume panna mudiyala", opts: ["Excited", "Exhausted", "Angry"], a: 1 },
  { id: 18, msg: "naan pass aayitten!! nambave mudiyala", opts: ["Nervous", "Sad", "Overjoyed"], a: 2 },
  { id: 19, msg: "enakku thookam varala, mind full ah yosanai", opts: ["Restless", "Proud", "Bored"], a: 0 },
  { id: 20, msg: "yaarum ennoda pesala inniki", opts: ["Thrilled", "Lonely", "Angry"], a: 1 },
  { id: 21, msg: "amma kaila saapadu, vera level feeling", opts: ["Anxious", "Guilty", "Content"], a: 2 },
  { id: 22, msg: "avan ennai mathichave illa. romba kovam", opts: ["Angry", "Sleepy", "Hopeful"], a: 0 },
  { id: 23, msg: "honestly idk what im feeling rn", opts: ["Proud", "Confused", "Thrilled"], a: 1 },
  { id: 24, msg: "I GOT THE JOB!!! cant believe it", opts: ["Nervous", "Lonely", "Excited"], a: 2 },
  { id: 25, msg: "presentation in an hour and my hands are shaking", opts: ["Nervous", "Bored", "Proud"], a: 0 },
  { id: 26, msg: "everyone went out without me again", opts: ["Grateful", "Left out", "Sleepy"], a: 1 },
  { id: 27, msg: "just finished my first 10k run", opts: ["Anxious", "Bored", "Proud"], a: 2 },
  { id: 28, msg: "cant stop thinking about what i said to her", opts: ["Guilty", "Thrilled", "Relaxed"], a: 0 },
  { id: 29, msg: "3 baj gaye, neend nahi aa rahi", opts: ["Excited", "Restless", "Proud"], a: 1 },
  { id: 30, msg: "exam ka tension hai bro, kuch yaad nahi ho raha", opts: ["Relaxed", "Grateful", "Stressed"], a: 2 },
  { id: 31, msg: "aaj pehli baar khud khana banaya aur sabne tareef ki", opts: ["Proud", "Lonely", "Angry"], a: 0 },
  { id: 32, msg: "ninna maathaadona? tumba bore aagthide", opts: ["Angry", "Bored", "Proud"], a: 1 },
];

const byId = new Map(QUESTIONS.map((q) => [q.id, q]));
export const getQuestion = (id: number) => byId.get(id);

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
