export const formatBudget = (amount: number): string => {
  return `${amount.toLocaleString()} ₽`;
};

export const formatDateRange = (
  start: string | null | undefined,
  end: string | null | undefined,
): string => {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });

  if (start && end) return `${formatDate(start)} - ${formatDate(end)}`;
  if (start) return formatDate(start);
  if (end) return formatDate(end);
  return '';
};
