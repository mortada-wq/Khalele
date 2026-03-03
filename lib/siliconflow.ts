import OpenAI from "openai";

export const siliconFlowClient = new OpenAI({
  apiKey: process.env.SILICONFLOW_API_KEY || "",
  baseURL: process.env.SILICONFLOW_BASE_URL || "https://api.siliconflow.cn/v1",
});

export const SILICONFLOW_MODEL =
  process.env.SILICONFLOW_MODEL || "deepseek-ai/DeepSeek-V3.2";
