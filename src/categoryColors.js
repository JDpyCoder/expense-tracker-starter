export const CATEGORY_COLORS = {
  food: "#e8743b",
  housing: "#3b7dd8",
  utilities: "#19a979",
  transport: "#945ecf",
  entertainment: "#e24d7a",
  salary: "#13a4b4",
  other: "#8a8f98",
};

export const categoryColor = (category) => CATEGORY_COLORS[category] ?? CATEGORY_COLORS.other;
