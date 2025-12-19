const SUITS = ["H", "D", "C", "S"] as const;
const RANKS = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"] as const;

export const createDeck = (): string[] => {
  const deck: string[] = [];
  for (const r of RANKS) for (const s of SUITS) deck.push(`${r}${s}`);
  return deck;
};

export const shuffle = (deck: string[]): string[] => {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const dealAll = (deck: string[], playerIds: number[]): Map<number, string[]> => {
  const hands = new Map<number, string[]>();
  for (const id of playerIds) hands.set(id, []);

  let i = 0;
  while (deck.length) {
    const pid = playerIds[i % playerIds.length];
    hands.get(pid)!.push(deck.pop()!);
    i++;
  }
  return hands;
};
