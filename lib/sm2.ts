export interface SM2State {
  ease: number;
  interval: number;
  reps: number;
  lapses: number;
}

// quality: 0=Again, 1=Hard, 2=Good, 3=Easy
export function sm2(state: SM2State, quality: 0 | 1 | 2 | 3): SM2State & { due: Date } {
  const qMap = [0, 3, 4, 5] as const;
  const q = qMap[quality];
  let { ease, interval, reps, lapses } = state;

  if (q < 3) {
    reps = 0;
    lapses += 1;
    interval = 1;
  } else {
    if (reps === 0) interval = 1;
    else if (reps === 1) interval = 6;
    else interval = Math.round(interval * ease);
    reps += 1;
  }

  ease = Math.max(1.3, ease + 0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  const due = new Date();
  due.setDate(due.getDate() + interval);

  return { ease, interval, reps, lapses, due };
}

export function projectedIntervals(state: SM2State): string[] {
  return ([0, 1, 2, 3] as const).map((q) => {
    const next = sm2(state, q);
    if (next.interval <= 0) return "< 1 min";
    if (next.interval === 1) return "1 day";
    return `${next.interval} days`;
  });
}
