import type { ACPAgentType } from "./acp.types";

export type SkillScope = "global" | "project";
export type SkillVariableSource = "user_input" | "active_note" | "rag_result" | "static";

export interface SkillVariable {
  name: string;
  source: SkillVariableSource;
  default?: string;
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  version: string;
  scope: SkillScope;
  prompt: string;
  variables: SkillVariable[];
  targetAgentType?: ACPAgentType[];
  slashCommand?: string;
}