import type { StageN } from '../content/types';

export type Attitude = 'retro' | 'adaptive' | 'prospective' | 'mixed';
export type AttitudeResult = { retro: number; adaptive: number; prospective: number; dominant: Attitude };
export type SelfScore = { mc: number; kp: number; od: number };
export type Profile = { discipline: string; university: string; experienceYears: number; horizon: 5 | 10 | 15 };
export type Checkpoint = { attitude?: AttitudeResult; selfScore?: SelfScore };
export type Product = { title: string; stage: StageN; markdown: string; updatedAt: string };
export type ReflectionPause = { content: string; process: string; done: boolean };

export type RoadmapHorizon = '1' | '3' | '5' | '10-15';
export type RoadmapRow = { id: string; horizon: RoadmapHorizon; point: string; todo: string; resources: string; indicator: string };
export type Roadmap = { version: number; label: string; rows: RoadmapRow[]; savedAt: string };

export type ProductKey = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6';
export type TaskId = string;
export type PromptLogEntry = { promptId: number; taskId: TaskId; at: string };

export type Run = {
  id: string;
  number: number;
  startedAt: string;
  finishedAt?: string;
  profile: Profile;
  entry?: Checkpoint;
  exit?: Checkpoint;
  /** Ответы по заданиям: ключ — номер задания ('1.2'), значение — объект задания (схемы в lib/answers.ts). */
  answers: Record<TaskId, any>;
  products: Partial<Record<ProductKey, Product>>;
  roadmapVersions: Roadmap[];
  reflections: Partial<Record<StageN, ReflectionPause>>;
  /** Ответы модели, вставленные рядом с заданием. */
  aiNotes: Record<TaskId, string>;
  promptLog: PromptLogEntry[];
  /** Задания, с которых пользователь снял автоматическую отметку «выполнено». */
  undone: TaskId[];
  /** Этапы, открытые досрочно: предыдущий этап помечается «пройден не полностью». */
  earlyOpened: StageN[];
  /** Учебный демонстрационный пример — не данные апробации. */
  example?: boolean;
};
