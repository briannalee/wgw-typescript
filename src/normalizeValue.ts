export function normalizeValue(value: number, minValue: number, maxValue: number): number {
  return (value - minValue) / (maxValue - minValue);
}