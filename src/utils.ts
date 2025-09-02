// Date-only comparisons in host TZ.
function todayStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,"0");
  const d = String(now.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}

export function dateFlags(isoDate?: string) {
  if (!isoDate) return { date: undefined, is_overdue: false, is_today: false, is_tomorrow: false };
  const today = todayStr();
  const is_today = isoDate === today;

  const t0 = new Date(`${today}T00:00:00`);
  const t1 = new Date(t0.getTime() + 24*60*60*1000);
  const tomorrow = `${t1.getFullYear()}-${String(t1.getMonth()+1).padStart(2,"0")}-${String(t1.getDate()).padStart(2,"0")}`;
  const is_tomorrow = isoDate === tomorrow;

  const is_overdue = isoDate < today;
  return { date: isoDate, is_overdue, is_today, is_tomorrow };
}
