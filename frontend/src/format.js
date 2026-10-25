export function formatRand(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "R0";
  if (Number.isInteger(value)) return `R${value}`;
  return `R${value.toFixed(2)}`;
}

export function totalPay(offer) {
  const total =
    Number(offer.pay_per_hour) *
    Number(offer.hours_per_day) *
    Number(offer.num_days);
  return Number.isFinite(total) ? total : 0;
}

export function formatWhen(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

export function offerStateLabel(state) {
  if (state === "ongoing") return "In progress";
  if (state === "complete") return "Paid";
  return "Offer waiting";
}
