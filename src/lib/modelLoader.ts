import type { ModelData } from '../types/model';

let cachedModel: ModelData | null = null;

export async function loadModel(): Promise<ModelData> {
  if (cachedModel) return cachedModel;
  const res = await fetch('/model/model.json');
  if (!res.ok) throw new Error('Failed to load validated prediction model');
  cachedModel = (await res.json()) as ModelData;
  return cachedModel;
}

export function getModelSync(): ModelData | null {
  return cachedModel;
}
