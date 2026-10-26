export type StageN = 1 | 2 | 3 | 4 | 5 | 6;
export type ProductId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6';
export type Horizon = 5 | 10 | 15;
export type ScoreTriple = { mc: number; kp: number; od: number };

export type Profile = { discipline: string; university: string; experienceYears: number; horizon: Horizon | null };
export type AttitudeKey = 'retro' | 'adaptive' | 'prospective' | 'mixed';
export type AttitudeResult = { retro: number; adaptive: number; prospective: number; dominant: AttitudeKey };
export type Measure = { attitude: AttitudeResult | null; selfScore: ScoreTriple | null };

export type Product = { title: string; stage: StageN; markdown: string; updatedAt: string };
export type ReflectionPause = { content: string; process: string; done: boolean };

export type RoadmapHorizon = '1' | '3' | '5' | '10-15';
export type RoadmapPoint = { id: string; horizon: RoadmapHorizon; title: string; todo: string; resources: string; indicator: string };
export type Roadmap = { version: number; label: string; savedAt: string; scenario: string; goal: string; points: RoadmapPoint[] };

export type AiLogEntry = { promptId: number; taskId: string; at: string };

export type Run = {
  id: string;
  number: number;
  startedAt: string;
  finishedAt?: string;
  profile: Profile;
  entry: Measure;
  exit?: Measure;
  answers: Record<string, unknown>;
  products: Record<ProductId, Product>;
  roadmapVersions: Roadmap[];
  reflections: Record<StageN, ReflectionPause>;
  /** Этапы, открытые пользователем (в т.ч. досрочно) */
  opened: number[];
  /** Ручные отметки «выполнено»: false — пользователь снял автоматическую отметку */
  taskMarks: Record<string, boolean>;
  /** Журнал нажатий «Использовать с ИИ» */
  aiLog: AiLogEntry[];
  /** Вставленные ответы модели по заданиям */
  aiResponses: Record<string, string>;
  /** Учебная копия демонстрационного примера */
  isDemoCopy?: boolean;
};

export type ExportFile = {
  app: 'forsight-navigator';
  format: 1;
  exportedAt: string;
  runs: Run[];
  libraryTemplates: Record<string, Record<string, string>>;
};
