export type ModelConfig = {
  id: string;
  name: string;
  chef: string;
  chefSlug: string;
  providers: string[];
};

export const models: ModelConfig[] = [
  {
    id: "openai/gpt-oss-120b",
    name: "GPT-OSS 120B",
    chef: "Groq",
    chefSlug: "groq",
    providers: ["groq"],
  },
];