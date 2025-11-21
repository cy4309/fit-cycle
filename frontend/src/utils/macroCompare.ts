export function checkNumberWithTolerance(
  value: number,
  target: number,
  toleranceRatio = 0.1
) {
  const min = target * (1 - toleranceRatio);
  const max = target * (1 + toleranceRatio);

  if (value < min) return "low";
  if (value > max) return "high";
  return "ok";
}

export function checkRangeWithTolerance(
  value: number,
  minTarget: number,
  maxTarget: number,
  toleranceRatio = 0.1
) {
  const min = minTarget * (1 - toleranceRatio);
  const max = maxTarget * (1 + toleranceRatio);

  if (value < min) return "low";
  if (value > max) return "high";
  return "ok";
}
