let vnAdvanceLabel = 'Continue';

export const setVnAdvanceAccessibilityLabel = (label: string): void => {
  const normalized = label.trim();
  if (normalized) vnAdvanceLabel = normalized;
};

export const vnAdvanceAccessibilityLabel = (): string => vnAdvanceLabel;
