export type ZoneId = 'z1' | 'z2' | 'z3';
export type Zone = { id: ZoneId; name: string; short: string; stages: number[]; text: string };
export type Stage = {
  n: number; roman: string; name: string; zone: ZoneId; position: string;
  aim: string; content: string[]; requirement: string; basis: string;
  resources: string; rgroup: number; modules: string[]; steps: [string, string][];
  product: string; assessment: string; applied: string; tpl: string; prompts: number[];
};
/** [требование, содержание, где реализуется] */
export type Requirement = [string, string, string];
export type RGroup = { n: number; name: string; stage: number; requirement: string; fn: string; items: [string, string, string][] };
export type Condition = { g: string; basis: string; items: [string, string][] };
export type Levels = { mc: [string, string, string]; kp: [string, string, string]; od: [string, string, string] };
export type DiagQuestion = { q: string; o: [string, string, string] };
export type ResultRow = { k: string; name: string; kg: number; eg: number };
export type PromptDef = { id: number; stage: number; title: string; text: string };
/** [id, подпись, подсказка, 'in' | 'ta'] */
export type TemplateField = [string, string, string, 'in' | 'ta'];
export type TemplateDef = { id: string; stage: number; title: string; intro: string; matrix?: boolean; fields: TemplateField[] };
export type Lecture = { id: string; stage: number; title: string; lead: string; sections: [string, string][] };
