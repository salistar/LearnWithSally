import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { LessonStatus } from "@/types/learning";

// All progress is LOCAL to the device and starts at zero — nothing here is
// demo data pretending to be real progress.

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

interface LearningState {
  dailyGoal: number;
  xpToday: number;
  xpDate: string; // day `xpToday` belongs to
  streak: number;
  lastActiveDate: string | null;
  completedLessonIds: string[];
  startedLessonIds: string[];

  markLessonStarted: (lessonId: string) => void;
  completeLesson: (lessonId: string, xp: number) => void;
  getLessonStatus: (lessonId: string) => LessonStatus;
  getXpToday: () => number;
  getStreak: () => number;
  resetProgress: () => void;
}

const initialState = {
  dailyGoal: 20,
  xpToday: 0,
  xpDate: today(),
  streak: 0,
  lastActiveDate: null,
  completedLessonIds: [],
  startedLessonIds: [],
};

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      ...initialState,

      markLessonStarted: (lessonId) =>
        set((s) =>
          s.startedLessonIds.includes(lessonId)
            ? s
            : { startedLessonIds: [...s.startedLessonIds, lessonId] },
        ),

      completeLesson: (lessonId, xp) =>
        set((s) => {
          const day = today();
          const alreadyDone = s.completedLessonIds.includes(lessonId);
          const xpToday = (s.xpDate === day ? s.xpToday : 0) + (alreadyDone ? 0 : xp);
          let streak = s.streak;
          if (s.lastActiveDate !== day) {
            streak = s.lastActiveDate === yesterday() ? s.streak + 1 : 1;
          }
          return {
            xpToday,
            xpDate: day,
            streak,
            lastActiveDate: day,
            completedLessonIds: alreadyDone
              ? s.completedLessonIds
              : [...s.completedLessonIds, lessonId],
          };
        }),

      getLessonStatus: (lessonId) => {
        const s = get();
        if (s.completedLessonIds.includes(lessonId)) return "completed";
        if (s.startedLessonIds.includes(lessonId)) return "in-progress";
        return "not-started";
      },

      getXpToday: () => {
        const s = get();
        return s.xpDate === today() ? s.xpToday : 0;
      },

      // A streak only counts if the learner was active today or yesterday.
      getStreak: () => {
        const s = get();
        return s.lastActiveDate === today() || s.lastActiveDate === yesterday() ? s.streak : 0;
      },

      resetProgress: () => set({ ...initialState, xpDate: today() }),
    }),
    {
      name: "lws-learning",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
