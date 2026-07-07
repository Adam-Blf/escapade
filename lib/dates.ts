/**
 * Prochaine occurrence du mois demandé (jour 15, représentatif d'un séjour),
 * ou J+30 si aucun mois. Toujours dans le futur : un mois déjà passé cette
 * année bascule sur l'année suivante.
 */
export function checkinDate(month: number | null, now = new Date()): Date {
  if (month === null) {
    const d = new Date(now);
    d.setDate(d.getDate() + 30);
    return d;
  }
  const year =
    month > now.getMonth() + 1 ||
    (month === now.getMonth() + 1 && now.getDate() < 15)
      ? now.getFullYear()
      : now.getFullYear() + 1;
  return new Date(Date.UTC(year, month - 1, 15));
}

export function addNights(checkin: Date, nights: number): Date {
  const d = new Date(checkin);
  d.setDate(d.getDate() + nights);
  return d;
}

/** AAAA-MM-JJ pour les APIs. */
export function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
