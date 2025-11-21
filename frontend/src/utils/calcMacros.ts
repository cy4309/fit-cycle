export function calculateAge(birth: string): number {
  const birthday = new Date(birth);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDiff = today.getMonth() - birthday.getMonth();
  const dayDiff = today.getDate() - birthday.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  activity = 1.55
) {
  const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  return Math.round(bmr * activity);
}

export function calculateMacroRules(
  weight: number,
  height: number,
  birth: string
) {
  const age = calculateAge(birth);

  const TDEE = calculateTDEE(weight, height, age);

  const lowMin = TDEE * 0.68;
  const lowMax = TDEE * 0.72;

  const midMin = TDEE * 0.8;
  const midMax = TDEE * 0.9;

  const highMin = TDEE * 0.95;
  const highMax = TDEE * 1.05;

  return {
    低碳日: {
      carbs: (0.15 * TDEE) / 4,
      fat: (0.35 * TDEE) / 9,
      protein: { min: 100, max: 150 },
      calories: { min: lowMin, max: lowMax },
    },
    中碳日: {
      carbs: (0.3 * TDEE) / 4,
      fat: (0.25 * TDEE) / 9,
      protein: { min: 100, max: 150 },
      calories: { min: midMin, max: midMax },
    },
    高碳日: {
      carbs: (0.45 * TDEE) / 4,
      fat: (0.2 * TDEE) / 9,
      protein: { min: 100, max: 150 },
      calories: { min: highMin, max: highMax },
    },
  };
}
