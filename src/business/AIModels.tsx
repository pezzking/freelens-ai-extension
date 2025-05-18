export type AIModel = {
  value: string;
  label: string;
};

export enum AIModels {
  GPT_3_5_TURBO = "gpt-3.5-turbo",
  O3_MINI = "o3-mini",
  GPT_4_1 = "gpt-4.1"
}

const AIModelDescriptions: Record<string, string> = {
  [AIModels.GPT_3_5_TURBO]: "gpt 3.5 turbo",
  [AIModels.O3_MINI]: "o3 mini",
  [AIModels.GPT_4_1]: "gpt 4.1",
}

export default AIModelDescriptions;
