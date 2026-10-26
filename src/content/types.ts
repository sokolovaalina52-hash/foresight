export type ZoneId = 'z1' | 'z2' | 'z3';
export type StageN = 1 | 2 | 3 | 4 | 5 | 6;

export type Zone = { id: ZoneId; name: string; short: string; stages: number[]; text: string };
export type Stage = {
  n: StageN; roman: string; name: string; zone: ZoneId; position: string;
  aim: string; content: string[]; requirement: string; basis: string;
  resources: string; rgroup: number; modules: string[]; steps: [string, string][];
  product: string; assessment: string; applied: string; tpl: string; prompts: number[];
};
export type RGroup = { n: number; name: string; stage: number; requirement: string; fn: string; items: [string, string, string][] };
export type Condition = { g: string; basis: string; items: [string, string][] };
export type Levels = { mc: string[]; kp: string[]; od: string[] };
export type ResultRow = { k: string; name: string; kg: number; eg: number };
export type DiagQ = { q: string; o: string[] };
export type Prompt = { id: number; stage: number; title: string; text: string };
export type TemplateField = [id: string, label: string, hint: string, kind: 'in' | 'ta'];
export type Template = { id: string; stage: number; title: string; intro: string; matrix?: boolean; fields: TemplateField[] };
export type Lecture = { id: string; stage: number; title: string; lead: string; sections: [string, string][] };
