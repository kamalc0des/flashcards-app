import { describe, it, expect, beforeEach } from "vitest";
import { sm2, projectedIntervals } from "@/lib/sm2";
import type { SM2State } from "@/lib/sm2";

const initialState: SM2State = { ease: 2.5, interval: 1, reps: 0, lapses: 0 };

describe("sm2", () => {
  describe("Again (quality=0)", () => {
    it("resets reps to 0", () => {
      const state = { ease: 2.5, interval: 10, reps: 5, lapses: 0 };
      expect(sm2(state, 0).reps).toBe(0);
    });

    it("increments lapses", () => {
      const state = { ...initialState, lapses: 2 };
      expect(sm2(state, 0).lapses).toBe(3);
    });

    it("resets interval to 1", () => {
      const state = { ease: 2.5, interval: 20, reps: 5, lapses: 0 };
      expect(sm2(state, 0).interval).toBe(1);
    });

    it("decreases ease factor", () => {
      const result = sm2(initialState, 0);
      expect(result.ease).toBeLessThan(initialState.ease);
    });

    it("clamps ease to minimum 1.3", () => {
      const lowEase = { ease: 1.3, interval: 1, reps: 0, lapses: 10 };
      expect(sm2(lowEase, 0).ease).toBeGreaterThanOrEqual(1.3);
    });

    it("due date is tomorrow", () => {
      const result = sm2(initialState, 0);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(result.due.toDateString()).toBe(tomorrow.toDateString());
    });
  });

  describe("Hard (quality=1)", () => {
    it("increments reps on first review", () => {
      expect(sm2(initialState, 1).reps).toBe(1);
    });

    it("interval is 1 on first review (reps=0)", () => {
      expect(sm2(initialState, 1).interval).toBe(1);
    });

    it("interval is 6 on second review (reps=1)", () => {
      const state = { ease: 2.5, interval: 1, reps: 1, lapses: 0 };
      expect(sm2(state, 1).interval).toBe(6);
    });

    it("interval multiplied by ease on subsequent reviews", () => {
      const state = { ease: 2.5, interval: 6, reps: 2, lapses: 0 };
      expect(sm2(state, 1).interval).toBe(Math.round(6 * 2.5));
    });

    it("does not increment lapses", () => {
      expect(sm2(initialState, 1).lapses).toBe(0);
    });

    it("slightly decreases ease", () => {
      const result = sm2(initialState, 1);
      expect(result.ease).toBeLessThan(initialState.ease);
    });
  });

  describe("Good (quality=2)", () => {
    it("increments reps", () => {
      expect(sm2(initialState, 2).reps).toBe(1);
    });

    it("interval is 1 on first review", () => {
      expect(sm2(initialState, 2).interval).toBe(1);
    });

    it("interval is 6 on second review", () => {
      const state = { ease: 2.5, interval: 1, reps: 1, lapses: 0 };
      expect(sm2(state, 2).interval).toBe(6);
    });

    it("keeps ease roughly stable (Good is neutral)", () => {
      const result = sm2(initialState, 2);
      // Good maps to q=4, so ease change should be small
      expect(Math.abs(result.ease - initialState.ease)).toBeLessThan(0.15);
    });
  });

  describe("Easy (quality=3)", () => {
    it("increments reps", () => {
      expect(sm2(initialState, 3).reps).toBe(1);
    });

    it("increases ease factor", () => {
      const result = sm2(initialState, 3);
      expect(result.ease).toBeGreaterThan(initialState.ease);
    });

    it("due date advances by interval days", () => {
      const state = { ease: 2.5, interval: 6, reps: 2, lapses: 0 };
      const result = sm2(state, 3);
      const expected = new Date();
      expected.setDate(expected.getDate() + result.interval);
      expect(result.due.toDateString()).toBe(expected.toDateString());
    });
  });

  describe("Long review chain", () => {
    it("interval grows over successive Good reviews", () => {
      let state = initialState;
      const intervals: number[] = [];
      for (let i = 0; i < 6; i++) {
        state = sm2(state, 2);
        intervals.push(state.interval);
      }
      // Should grow: 1, 6, then progressively larger
      expect(intervals[0]).toBe(1);
      expect(intervals[1]).toBe(6);
      expect(intervals[2]).toBeGreaterThan(intervals[1]);
      expect(intervals[3]).toBeGreaterThan(intervals[2]);
    });

    it("ease stays >= 1.3 even after many Again answers", () => {
      let state = initialState;
      for (let i = 0; i < 20; i++) {
        state = sm2(state, 0);
      }
      expect(state.ease).toBeGreaterThanOrEqual(1.3);
    });
  });
});

describe("projectedIntervals", () => {
  it('returns "revoir" for Again (index 0)', () => {
    expect(projectedIntervals(initialState)[0]).toBe("revoir");
  });

  it("returns 4 entries", () => {
    expect(projectedIntervals(initialState)).toHaveLength(4);
  });

  it('returns "1 jour" for single-day intervals', () => {
    const intervals = projectedIntervals(initialState);
    // First review (reps=0) always gives interval=1
    expect(intervals[1]).toBe("1 jour");
    expect(intervals[2]).toBe("1 jour");
  });

  it("returns plural days for intervals > 1", () => {
    const state = { ease: 2.5, interval: 6, reps: 2, lapses: 0 };
    const intervals = projectedIntervals(state);
    intervals.slice(1).forEach((interval) => {
      if (interval !== "1 jour") {
        expect(interval).toMatch(/^\d+ jours$/);
      }
    });
  });
});
