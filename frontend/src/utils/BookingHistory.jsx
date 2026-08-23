const HISTORY_KEY = 'goairclass_booking_history';

const safeParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

export const getBookingHistory = () => {
  const main = safeParse(localStorage.getItem(HISTORY_KEY), []);

  // Also read older / alternative keys so existing data is not lost.
  const legacyKeys = [
    'bookingHistory',
    'flightBookingHistory',
    'hotelBookingHistory',
    'recentBookings',
  ];

  const legacy = legacyKeys.flatMap((key) => {
    const value = safeParse(localStorage.getItem(key), []);
    if (Array.isArray(value)) return value;
    return value ? [value] : [];
  });

  const all = [...main, ...legacy];

  // De-duplicate using a stable id when possible.
  const seen = new Set();
  const unique = [];

  all.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    const id =
      item.id ||
      item.bookingId ||
      item.tripId ||
      item.pnr ||
      item.confirmationNumber ||
      `${item.type || item.bookingType || 'booking'}-${item.createdAt || item.bookedAt || index}`;

    const key = String(id);
    if (seen.has(key)) return;
    seen.add(key);

    unique.push({ ...item, id: key });
  });

  return unique.sort((a, b) => {
    const da = new Date(a.createdAt || a.bookedAt || a.bookingDate || a.date || 0).getTime();
    const db = new Date(b.createdAt || b.bookedAt || b.bookingDate || b.date || 0).getTime();
    return db - da;
  });
};

export const saveBookingToHistory = (booking) => {
  if (!booking || typeof booking !== 'object') return;

  const history = safeParse(localStorage.getItem(HISTORY_KEY), []);
  const id =
    booking.id ||
    booking.bookingId ||
    booking.tripId ||
    booking.pnr ||
    booking.confirmationNumber ||
    `GAC-${Date.now()}`;

  const record = {
    ...booking,
    id: String(id),
    createdAt: booking.createdAt || new Date().toISOString(),
  };

  const next = [record, ...history.filter((item) => String(item?.id) !== String(record.id))];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 200)));
  window.dispatchEvent(new Event('goairclass-booking-history-updated'));
};

export const clearBookingHistory = () => {
  localStorage.removeItem(HISTORY_KEY);
  window.dispatchEvent(new Event('goairclass-booking-history-updated'));
};