import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Armchair,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Download,
  FileText,
  Globe2,
  Headphones,
  Home,
  Mail,
  Phone,
  Plane,
  ShieldCheck,
  Utensils,
  UserRound,
} from "lucide-react";

import { fetchTripDetailsApi } from "../services/flightApi";

/* =========================================================
   HELPERS
   ========================================================= */

const normalizeEpoch = (value) => {
  if (!value) return null;

  const num = Number(value);

  if (!Number.isFinite(num)) return null;

  return num < 1000000000000 ? num * 1000 : num;
};

const formatEpochTime = (
  value,
  timeZone = "Asia/Kolkata",
  fallback = ""
) => {
  const epoch = normalizeEpoch(value);

  if (!epoch) return fallback;

  try {
    return new Date(epoch).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone,
    });
  } catch {
    return fallback;
  }
};

const formatEpochDate = (
  value,
  timeZone = "Asia/Kolkata",
  fallback = ""
) => {
  const epoch = normalizeEpoch(value);

  if (!epoch) return fallback;

  try {
    return new Date(epoch).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone,
    });
  } catch {
    return fallback;
  }
};

const formatNormalDate = (value, fallback = "") => {
  if (!value) return fallback;

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return fallback;
  }
};

const formatNormalTime = (value, fallback = "") => {
  if (!value) return fallback;

  try {
    if (typeof value === "string" && value.includes("T")) {
      const timePart = value.split("T")[1];

      const match = timePart.match(/^(\d{2}):(\d{2})/);

      if (match) {
        const h = Number(match[1]);
        const m = Number(match[2]);

        const period = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;

        return `${String(h12).padStart(2, "0")}:${String(m).padStart(
          2,
          "0"
        )} ${period}`;
      }
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return fallback;

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return fallback;
  }
};

const calculateDuration = (departure, arrival) => {
  if (!departure || !arrival) return "";

  let dep;
  let arr;

  if (typeof departure === "number") {
    dep = normalizeEpoch(departure);
  } else {
    dep = new Date(departure).getTime();
  }

  if (typeof arrival === "number") {
    arr = normalizeEpoch(arrival);
  } else {
    arr = new Date(arrival).getTime();
  }

  if (!dep || !arr || arr <= dep) return "";

  const totalMinutes = Math.round((arr - dep) / 60000);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (!hours) return `${minutes}m`;

  if (!minutes) return `${hours}h`;

  return `${hours}h ${minutes}m`;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
};

const getIssueDate = () => {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
};

/* =========================================================
   AIRLINE LOGO
   ========================================================= */

function AirlineLogo({ code }) {
  return (
    <div className="flex h-[58px] w-[58px] shrink-0 items-center justify-center rounded-[8px] border border-[#d3cec4] bg-gradient-to-br from-white to-[#e5e5e3] shadow-sm">
      <div className="relative flex h-full w-full items-center justify-center">
        <Plane
          size={30}
          strokeWidth={1.8}
          className="-rotate-45 text-[#152e68]"
        />

        <span className="absolute bottom-[3px] right-[4px] text-[7px] font-black text-[#152e68]">
          {code || "FL"}
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   COMPASS
   ========================================================= */

function CompassDecoration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="pointer-events-none absolute left-[21%] top-1/2 h-[150px] w-[150px] -translate-y-1/2 opacity-[0.14]"
    >
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="none"
        stroke="#8f784e"
      />

      <circle
        cx="100"
        cy="100"
        r="54"
        fill="none"
        stroke="#8f784e"
      />

      <line
        x1="100"
        y1="18"
        x2="100"
        y2="182"
        stroke="#8f784e"
      />

      <line
        x1="18"
        y1="100"
        x2="182"
        y2="100"
        stroke="#8f784e"
      />

      <path
        d="M100 20 L113 88 L100 100 L87 88 Z"
        fill="#8f784e"
      />

      <path
        d="M100 180 L87 112 L100 100 L113 112 Z"
        fill="#8f784e"
      />

      <path
        d="M20 100 L88 87 L100 100 L88 113 Z"
        fill="#8f784e"
      />

      <path
        d="M180 100 L112 113 L100 100 L112 87 Z"
        fill="#8f784e"
      />
    </svg>
  );
}

/* =========================================================
   BARCODE
   ========================================================= */

function TicketBarcode({ value }) {
  return (
    <div className="mt-6 flex items-center justify-center gap-3">
      <div
        className="h-[125px] w-[48px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,#17233a 0px,#17233a 2px,transparent 2px,transparent 4px,#17233a 4px,#17233a 7px,transparent 7px,transparent 9px,#17233a 9px,#17233a 10px,transparent 10px,transparent 13px)",
        }}
      />

      <span
        className="text-[8px] font-bold tracking-[0.15em]"
        style={{
          writingMode: "vertical-rl",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* =========================================================
   ROUTE LINE
   ========================================================= */

function RouteLine({ duration, stopText }) {
  return (
    <div className="flex min-w-[160px] flex-col items-center px-2">
      <span className="mb-2 text-[10px] font-medium">
        {duration || "—"}
      </span>

      <div className="flex w-full items-center">
        <span className="h-[6px] w-[6px] rounded-full bg-[#b8ae9d]" />

        <span className="h-px flex-1 bg-[#b8ae9d]" />

        <Plane
          size={30}
          className="mx-1 rotate-90 fill-[#aaa7a1] text-[#aaa7a1]"
        />

        <span className="h-px flex-1 bg-[#b8ae9d]" />

        <span className="h-[6px] w-[6px] rounded-full bg-[#b8ae9d]" />
      </div>

      <strong className="mt-2 text-[9px] uppercase">
        {stopText}
      </strong>
    </div>
  );
}

/* =========================================================
   PREMIUM TICKET
   ========================================================= */

function PremiumFlightTicket({
  bookingId,
  pnr,
  status,
  flights,
  passengers,
  totalAmount,
  bookingEmail,
  onPrint,
  navigate,
  cabinClass,
}) {
  const firstFlight = flights?.[0] || {};

  const lastFlight =
    flights?.[flights.length - 1] || firstFlight;

  const firstPassenger = passengers?.[0] || {};

  const passengerName = [
    firstPassenger.title || "MR",
    firstPassenger.firstName || "Traveller",
    firstPassenger.lastName || "",
  ]
    .filter(Boolean)
    .join(" ");

  const airlineCode =
    firstFlight.airlineCode || "FL";

  const airlineName =
    firstFlight.airlineName || "Partner Airline";

  const total = Number(totalAmount || 0);

  const baseFare = Math.round(total * 0.82);

  const taxes = Math.max(total - baseFare, 0);

  const stops = Math.max((flights?.length || 1) - 1, 0);

  const stopText =
    stops === 0
      ? "DIRECT"
      : stops === 1
      ? "1 STOP"
      : `${stops} STOPS`;

  const cabinBaggage =
    firstPassenger.includedCabinBag ||
    firstPassenger.cabinBag ||
    "7 kg";

  const checkinBaggage =
    firstPassenger.includedCheckinBag ||
    firstPassenger.checkinBag ||
    "15 kg";

  const seat =
    firstPassenger.seatNumber ||
    firstPassenger.selectedSeat ||
    "Not Selected";

  const meal =
    firstPassenger.confirmedMealTitle ||
    firstPassenger.selectedMeal ||
    "Not Selected";

  const qrValue = [
    `Booking:${bookingId}`,
    `PNR:${pnr}`,
    `Passenger:${passengerName}`,
    `Route:${firstFlight.origin}-${lastFlight.destination}`,
  ].join("|");

  return (
    <>
      {/* =====================================================
          PRINT CSS
          ===================================================== */}

      <style>{`
        @media print {

          @page {
            size: A4 landscape;
            margin: 4mm;
          }

          html,
          body,
          #root {
            margin: 0 !important;
            padding: 0 !important;

            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;

            background: #ffffff !important;

            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            overflow: visible !important;
          }

          .ticket-page-background {
            margin: 0 !important;
            padding: 0 !important;

            width: 100% !important;

            height: auto !important;
            min-height: 0 !important;

            background: white !important;
          }

          .ticket-print-area {
            width: 1480px !important;
            max-width: 1480px !important;

            margin: 0 auto !important;

            /*
             * Chrome / Edge:
             * whole desktop ticket shrinks
             * into a single A4 Landscape page
             */
            zoom: 0.67 !important;

            border-radius: 0 !important;

            box-shadow: none !important;

            overflow: hidden !important;

            break-inside: avoid !important;
            page-break-inside: avoid !important;

            break-before: avoid !important;
            break-after: avoid !important;

            page-break-before: avoid !important;
            page-break-after: avoid !important;
          }

          .ticket-layout {
            display: grid !important;
            grid-template-columns: 250px minmax(0, 1fr) !important;
          }

          .route-layout {
            display: grid !important;
            grid-template-columns: minmax(0, 1fr) 245px !important;
          }

          .route-main-layout {
            display: grid !important;
            grid-template-columns: 1fr auto 1fr !important;
          }

          .ticket-information-layout {
            display: grid !important;
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }

          .ticket-payment-layout {
            display: grid !important;
            grid-template-columns: 1.2fr 1fr 1fr !important;
          }

          .airline-header-layout {
            display: grid !important;
            grid-template-columns: 1.5fr 1fr 1fr 1fr !important;
          }

          .no-print {
            display: none !important;
          }

          * {
            box-sizing: border-box !important;
          }
        }
      `}</style>

      <div className="ticket-page-background min-h-screen bg-[#eee9df] px-1 py-2 text-[#17233a] sm:px-3 sm:py-3">
        {/* =====================================================
            TICKET
            ===================================================== */}

        <div className="ticket-print-area mx-auto w-full max-w-[960px] overflow-hidden rounded-[14px] border border-[#d1c4aa] bg-[#fffdf7] shadow-[0_15px_45px_rgba(26,38,58,0.16)]">
          {/* ===================================================
              HEADER
              =================================================== */}

          <header className="relative overflow-hidden bg-gradient-to-r from-[#071a36] via-[#15335d] to-[#10284d] px-4 py-2.5 text-white">
            <div className="absolute bottom-0 left-[20%] top-0 hidden w-[2px] bg-[#c49b51] lg:block" />

            <div className="grid min-w-0 items-center gap-3 lg:grid-cols-[165px_1fr_285px]">
              {/* Brand */}

              <div>
                <div className="font-serif text-[28px] leading-none">
                  GoAirClass
                </div>

                <div className="mt-2 flex items-center">
                  <div className="h-px flex-1 bg-[#c49b51]" />

                  <span className="ml-2 font-serif text-[11px] text-[#d9b67b]">
                    Tourism
                  </span>
                </div>
              </div>

              {/* Confirmation */}

              <div className="flex items-center gap-4 lg:px-4">
                <div className="flex h-[43px] w-[43px] shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f0d078] to-[#a37227]">
                  <Check
                    size={27}
                    strokeWidth={3}
                    className="text-[#172340]"
                  />
                </div>

                <div>
                  <h1 className="font-serif text-[18px] font-bold uppercase text-[#ddb973]">
                    Flight Booking Confirmed
                  </h1>

                  <p className="mt-1 text-[10px]">
                    Your e-ticket has been sent to
                  </p>

                  <p className="text-[11px] font-semibold">
                    {bookingEmail || "your registered email"}
                  </p>
                </div>
              </div>

              {/* QR */}

              <div className="flex min-w-0 items-center justify-start gap-3 lg:justify-end">
                <div className="rounded-[7px] bg-white p-[6px]">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&data=${encodeURIComponent(
                      qrValue
                    )}`}
                    alt="Booking QR"
                    className="h-[68px] w-[68px]"
                  />
                </div>

                <div className="h-[70px] w-px bg-white/25" />

                <div className="min-w-0">
                  <span className="block text-[8px] text-[#dabb87]">
                    Booking ID:
                  </span>

                  <strong className="block max-w-[170px] break-all text-[12px]">
                    {bookingId}
                  </strong>

                  <span className="mt-2 block text-[8px] text-[#dabb87]">
                    PNR (Booking Reference)
                  </span>

                  <strong className="block text-[12px]">
                    {pnr}
                  </strong>
                </div>
              </div>
            </div>
          </header>

          {/* ===================================================
              BODY
              =================================================== */}

          <div className="ticket-layout grid min-w-0 grid-cols-1 lg:grid-cols-[165px_minmax(0,1fr)]">
            {/* =================================================
                LEFT SIDE
                ================================================= */}

            <aside className="border-b border-dashed border-[#d0c4ae] bg-[#fffdf7] px-4 pb-4 lg:border-b-0 lg:border-r">
              <div className="-mt-[9px] inline-flex h-[35px] items-center rounded-b-[5px] bg-[#12294e] px-6 text-[9px] font-black text-white">
                E-TICKET
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <Plane
                    size={20}
                    strokeWidth={1.4}
                    className="shrink-0 -rotate-12"
                  />

                  <div>
                    <span className="block text-[8px] uppercase">
                      Passenger
                    </span>

                    <strong className="mt-1 block text-[11px]">
                      {passengerName}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-3">
                  <UserRound
                    size={20}
                    strokeWidth={1.4}
                    className="shrink-0"
                  />

                  <div>
                    <span className="block text-[8px] uppercase">
                      Ticket Type
                    </span>

                    <strong className="mt-1 block text-[11px]">
                      {firstPassenger.type === "CHD"
                        ? "Child"
                        : firstPassenger.type === "INF"
                        ? "Infant"
                        : "Adult"}
                    </strong>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CalendarDays
                    size={20}
                    strokeWidth={1.4}
                    className="shrink-0"
                  />

                  <div>
                    <span className="block text-[8px] uppercase">
                      Issue Date
                    </span>

                    <strong className="mt-1 block text-[11px]">
                      {getIssueDate()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="my-3 border-t border-dashed border-[#d0c4ae]" />

              <TicketBarcode value={bookingId} />
            </aside>

            {/* =================================================
                MAIN CONTENT
                ================================================= */}

            <main className="relative min-w-0 px-3 pb-3 pt-2 sm:px-4 lg:px-5">
              {/* ===============================================
                  AIRLINE HEADER
                  =============================================== */}

              <div className="airline-header-layout grid min-w-0 grid-cols-1 items-center gap-3 border-b border-[#ded4c1] pb-3 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr_1fr]">
                {/* Airline */}

                <div className="flex items-center gap-3">
                  <AirlineLogo code={airlineCode} />

                  <div>
                    <h2 className="text-[16px] font-black text-[#16275b]">
                      {airlineName}
                    </h2>

                    <p className="text-[10px]">
                      {firstFlight.flightNumber || airlineCode}
                    </p>
                  </div>
                </div>

                {/* Booking Date */}

                <div className="flex items-center gap-3 border-[#ded4c1] xl:border-l xl:pl-5">
                  <CalendarDays
                    size={20}
                    strokeWidth={1.4}
                  />

                  <div>
                    <span className="block text-[8px] uppercase">
                      Booking Date
                    </span>

                    <strong className="mt-1 block text-[10px]">
                      {getIssueDate()}
                    </strong>
                  </div>
                </div>

                {/* Status */}

                <div className="flex items-center gap-3 border-[#ded4c1] xl:border-l xl:pl-5">
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-full bg-[#a7aaad]">
                    <Check
                      size={17}
                      strokeWidth={2.5}
                      className="text-white"
                    />
                  </div>

                  <div>
                    <span className="block text-[8px] uppercase">
                      Status
                    </span>

                    <strong
                      className={`mt-1 block text-[10px] uppercase ${
                        String(status).toLowerCase() === "confirmed"
                          ? "text-green-700"
                          : String(status).toLowerCase() === "cancelled"
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {status}
                    </strong>
                  </div>
                </div>

                {/* Class */}

                <div className="flex justify-start xl:justify-end">
                  <div className="min-w-[120px] rounded-[4px] border border-[#94703a] bg-gradient-to-r from-[#b98a48] via-[#eed497] to-[#ae7d3c] px-3 py-2 text-center shadow-sm">
                    <span className="block text-[8px]">
                      Class
                    </span>

                    <strong className="block text-[10px]">
                      {cabinClass || "ECONOMY"} Class
                    </strong>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  ROUTE
                  =============================================== */}

              <div className="relative mt-2 min-w-0 overflow-hidden rounded-[9px] border border-[#d8cdb8]">
                <CompassDecoration />

                <div className="route-layout grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px]">
                  {/* Main Route */}

                  <div className="route-main-layout relative z-10 grid min-h-[140px] grid-cols-1 items-center gap-2 px-3 py-3 sm:px-5 md:grid-cols-[1fr_auto_1fr]">
                    {/* FROM */}

                    <div className="min-w-0">
                      <span className="text-[8px] uppercase">
                        From
                      </span>

                      <h3 className="mt-1 font-serif text-[25px] font-black leading-none">
                        {firstFlight.origin || "BLR"}
                      </h3>

                      <p className="mt-1 text-[11px] font-medium">
                        {firstFlight.originCity || "Departure"}
                      </p>

                      <p className="mt-1 max-w-[180px] break-words text-[8px] leading-4">
                        {firstFlight.originAirportName ||
                          firstFlight.originAirport ||
                          ""}
                      </p>

                      <strong className="mt-2 block text-[13px]">
                        {firstFlight.depTime || "—"}
                      </strong>

                      <span className="text-[8px]">
                        {firstFlight.depDate || "—"}
                      </span>
                    </div>

                    {/* ROUTE LINE */}

                    <RouteLine
                      duration={
                        firstFlight.duration ||
                        calculateDuration(
                          firstFlight.departureDateTime,
                          lastFlight.arrivalDateTime
                        )
                      }
                      stopText={stopText}
                    />

                    {/* TO */}

                    <div className="min-w-0 md:text-right">
                      <span className="text-[8px] uppercase">
                        To
                      </span>

                      <h3 className="mt-1 font-serif text-[25px] font-black leading-none">
                        {lastFlight.destination || "DEL"}
                      </h3>

                      <p className="mt-1 text-[11px] font-medium">
                        {lastFlight.destinationCity || "Arrival"}
                      </p>

                      <p className="ml-auto mt-1 max-w-[180px] break-words text-[8px] leading-4">
                        {lastFlight.destinationAirportName ||
                          lastFlight.destinationAirport ||
                          ""}
                      </p>

                      <strong className="mt-2 block text-[13px]">
                        {lastFlight.arrTime || "—"}
                      </strong>

                      <span className="text-[8px]">
                        {lastFlight.arrDate || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Baggage / Meal / Seat */}

                  <div className="border-t border-[#ddd3c1] bg-[#fcf8ef] px-4 py-2 xl:border-l xl:border-t-0">
                    <div className="flex gap-3 pb-3">
                      <BriefcaseBusiness
                        size={21}
                        strokeWidth={1.4}
                      />

                      <div>
                        <strong className="block text-[8px] uppercase">
                          Baggage
                        </strong>

                        <span className="block text-[8px]">
                          {cabinBaggage} Cabin Baggage
                        </span>

                        <span className="block text-[8px]">
                          {checkinBaggage} Check-in Baggage
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-[#d6cab5]" />

                    <div className="flex gap-3 py-2">
                      <Utensils
                        size={21}
                        strokeWidth={1.4}
                      />

                      <div>
                        <strong className="block text-[8px] uppercase">
                          Meal
                        </strong>

                        <span className="text-[8px]">
                          {meal}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-[#d6cab5]" />

                    <div className="flex gap-3 pt-3">
                      <Armchair
                        size={21}
                        strokeWidth={1.4}
                      />

                      <div>
                        <strong className="block text-[8px] uppercase">
                          Seat
                        </strong>

                        <span className="text-[8px]">
                          {seat}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  PASSENGERS
                  =============================================== */}

              <div className="mt-2 overflow-hidden rounded-[8px] border border-[#d8cdb8]">
                {passengers.map((p, index) => {
                  const passengerSeat =
                    p.seatNumber ||
                    p.selectedSeat ||
                    "Not Selected";

                  const passengerMeal =
                    p.confirmedMealTitle ||
                    p.selectedMeal ||
                    "Not Selected";

                  return (
                    <div
                      key={`${p.firstName}-${index}`}
                      className={`grid min-w-0 grid-cols-1 gap-2 px-3 py-2 sm:grid-cols-2 sm:px-4 md:grid-cols-5 ${
                        index > 0
                          ? "border-t border-[#ded4c1]"
                          : ""
                      }`}
                    >
                      <div>
                        <span className="block text-[7px] uppercase">
                          Passenger Name
                        </span>

                        <strong className="mt-1 block text-[9px]">
                          {p.title || "MR"}{" "}
                          {p.firstName || "Traveller"}{" "}
                          {p.lastName || ""}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-[7px] uppercase">
                          Booking Status
                        </span>

                        <span className="mt-1 inline-block rounded bg-[#dfe7e1] px-2 py-[2px] text-[8px] font-bold uppercase text-green-800">
                          {status}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[7px] uppercase">
                          Seat
                        </span>

                        <strong className="mt-1 block text-[9px]">
                          {passengerSeat}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-[7px] uppercase">
                          Meal
                        </span>

                        <strong className="mt-1 block text-[9px]">
                          {passengerMeal}
                        </strong>
                      </div>

                      <div>
                        <span className="block text-[7px] uppercase">
                          Frequent Flyer
                        </span>

                        <strong className="mt-1 block text-[9px]">
                          —
                        </strong>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ===============================================
                  INFORMATION
                  =============================================== */}

              <div className="ticket-information-layout mt-2 grid grid-cols-1 rounded-[8px] border border-[#d8cdb8] md:grid-cols-3">
                <div className="flex gap-3 px-3 py-2">
                  <Clock3
                    size={29}
                    strokeWidth={1.3}
                    className="shrink-0"
                  />

                  <div>
                    <strong className="text-[9px] uppercase">
                      Check-in
                    </strong>

                    <p className="mt-1 text-[8px] leading-4">
                      Check-in opens 3 hours before departure and
                      closes 60 minutes before departure.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-[#ddd2bd] px-3 py-2 md:border-l">
                  <BriefcaseBusiness
                    size={29}
                    strokeWidth={1.3}
                    className="shrink-0"
                  />

                  <div>
                    <strong className="text-[9px] uppercase">
                      Baggage Information
                    </strong>

                    <p className="mt-1 text-[8px] leading-4">
                      Cabin: {cabinBaggage}
                      <br />
                      Check-in: {checkinBaggage}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 border-[#ddd2bd] px-3 py-2 md:border-l">
                  <FileText
                    size={29}
                    strokeWidth={1.3}
                    className="shrink-0"
                  />

                  <div>
                    <strong className="text-[9px] uppercase">
                      Important
                    </strong>

                    <p className="mt-1 text-[8px] leading-4">
                      Carry a valid government-issued photo ID for
                      airport check-in.
                    </p>
                  </div>
                </div>
              </div>

              {/* ===============================================
                  PAYMENT & SUPPORT
                  =============================================== */}

              <div className="ticket-payment-layout mt-2 grid grid-cols-1 border-t border-[#ded4c1] pt-2 md:grid-cols-3">
                {/* Information */}

                <div className="px-3 py-1">
                  <strong className="text-[8px] uppercase">
                    Important Information
                  </strong>

                  <ul className="mt-2 list-disc space-y-1 pl-4 text-[7px] leading-4">
                    <li>
                      Please arrive at the airport well in advance.
                    </li>

                    <li>
                      This is an auto-generated e-ticket. No signature
                      is required.
                    </li>

                    <li>
                      For assistance, contact GoAirClass support.
                    </li>
                  </ul>
                </div>

                {/* Payment */}

                <div className="border-[#ddd2bd] px-4 py-1 md:border-l">
                  <strong className="text-[8px] uppercase">
                    Payment Summary
                  </strong>

                  <div className="mt-2 space-y-1 text-[7px]">
                    <div className="flex justify-between">
                      <span>Base Fare</span>

                      <strong>
                        ₹{formatCurrency(baseFare)}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Taxes & Fees</span>

                      <strong>
                        ₹{formatCurrency(taxes)}
                      </strong>
                    </div>

                    <div className="flex justify-between">
                      <span>Convenience Fee</span>

                      <strong>₹0</strong>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-between rounded-[4px] bg-gradient-to-r from-[#b88b45] via-[#efd895] to-[#bb8b43] px-3 py-1.5 text-[9px] font-black">
                    <span>TOTAL PAID</span>

                    <span>
                      ₹{formatCurrency(total)}
                    </span>
                  </div>
                </div>

                {/* Support */}

                <div className="border-[#ddd2bd] px-4 py-1 md:border-l">
                  <strong className="text-[8px] uppercase">
                    Customer Support
                  </strong>

                  <div className="mt-2 space-y-2 text-[7px]">
                    <div className="flex items-center gap-2">
                      <Phone size={13} />
                      <span>+91 98765 43210</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail size={13} />
                      <span>support@goairclass.com</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Globe2 size={13} />
                      <span>www.goairclass.com</span>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>

          {/* ===================================================
              FOOTER
              =================================================== */}

          <footer className="border-t-2 border-[#c39a53] bg-[#fbf7ed] px-4 py-2">
            <div className="grid grid-cols-1 items-center gap-3 text-[8px] sm:grid-cols-2 md:grid-cols-5">
              <span>
                Thank you for choosing GoAirClass.
              </span>

              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                Verified Ticket
              </span>

              <span className="flex items-center justify-center gap-2">
                <ShieldCheck size={16} />
                Secure Booking
              </span>

              <span className="flex items-center justify-center gap-2">
                <Headphones size={16} />
                24x7 Support
              </span>

              <span className="flex items-center justify-end gap-2 font-serif text-[11px] italic">
                Happy Journey!
                <Plane size={17} className="-rotate-45" />
              </span>
            </div>
          </footer>
        </div>

        {/* =====================================================
            BUTTONS
            ===================================================== */}

        <div className="no-print mx-auto mt-3 flex w-full max-w-[960px] flex-col justify-end gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/", { replace: true })}
            className="flex min-w-[150px] items-center justify-center gap-2 rounded-[7px] border border-[#b9ad98] bg-white px-5 py-2.5 text-[10px] font-bold shadow-sm hover:bg-[#faf8f3]"
          >
            <Home size={15} />
            Go to Home
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex min-w-[190px] items-center justify-center gap-2 rounded-[7px] bg-[#b88945] px-5 py-2.5 text-[10px] font-bold text-white shadow-sm hover:bg-[#9e7136]"
          >
            <Download size={15} />
            Print / Download Ticket
          </button>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */

export default function FlightBookingSuccessPage() {
  const location = useLocation();

  const navigate = useNavigate();

  /* =========================================================
     SESSION CLEANUP & BACK BUTTON NAVIGATION TRAP
     ========================================================= */

  // Clear stale session tokens so any new booking requires creating a fresh session
  useEffect(() => {
    [
      'flight_session_id', 'flight_preview_id', 'multi_city_previews_map',
    ].forEach(key => sessionStorage.removeItem(key));
    for (let i = 0; i < 10; i++) {
      sessionStorage.removeItem(`flight_session_id_${i}`);
      sessionStorage.removeItem(`flight_preview_id_${i}`);
    }
  }, []);

  // Redirect user to Home screen ('/') when browser Back button is pressed on Booking Success page
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      navigate("/", { replace: true });
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate]);

  /* =========================================================
     MOCK DATA
     ========================================================= */

  const stateToUse = location.state || {};

  const {
    bookingData,
    holdData,
    flight,
    passenger,
    passengers,
    pnr,
    bookingId,
  } = stateToUse;

  /* =========================================================
     BOOKING ID
     ========================================================= */

  const fallbackBookingId = useMemo(() => {
    return `GAC-${Date.now().toString().slice(-10)}`;
  }, []);

  const confirmId =
    bookingId ||
    holdData?.booking_details?.trip_id ||
    holdData?.booking_details?.tripId ||
    holdData?.data?.booking_details?.trip_id ||
    holdData?.data?.booking_details?.tripId ||
    holdData?.trip_id ||
    holdData?.tripId ||
    bookingData?.booking_details?.trip_id ||
    bookingData?.booking_details?.tripId ||
    bookingData?.data?.booking_details?.trip_id ||
    bookingData?.data?.booking_details?.tripId ||
    bookingData?.trip_id ||
    bookingData?.tripId ||
    bookingData?.bookingId ||
    bookingData?.data?.tripId ||
    bookingData?.data?.itineraryId ||
    bookingData?.data?.bookingId ||
    fallbackBookingId;

  /* =========================================================
     INITIAL PNR
     ========================================================= */

  const initialPnr =
    pnr ||
    bookingData?.pnr ||
    bookingData?.data?.pnr ||
    bookingData?.airlinePnr ||
    bookingData?.data?.airlinePnr ||
    holdData?.pnr ||
    "";

  /* =========================================================
     LIVE CLEARTRIP DATA
     ========================================================= */

  const [liveDetails, setLiveDetails] = useState(null);

  const [loadingLiveDetails, setLoadingLiveDetails] =
    useState(false);

  useEffect(() => {
    if (
      !confirmId ||
      confirmId.startsWith("GAC-")
    ) {
      return;
    }

    let cancelled = false;

    const loadDetails = async () => {
      setLoadingLiveDetails(true);

      try {
        const response =
          await fetchTripDetailsApi(confirmId);

        if (
          !cancelled &&
          response?.success &&
          response?.data
        ) {
          setLiveDetails(
            response.data.data ||
              response.data
          );
        }
      } catch (error) {
        console.warn(
          "[Flight Ticket] Trip details error:",
          error
        );
      } finally {
        if (!cancelled) {
          setLoadingLiveDetails(false);
        }
      }
    };

    loadDetails();

    return () => {
      cancelled = true;
    };
  }, [confirmId]);

  /* =========================================================
     RESOLVE LIVE DETAILS
     ========================================================= */

  const resolvedLiveDetails = useMemo(() => {
    if (!liveDetails) return null;

    const details =
      liveDetails.booking_details ||
      liveDetails.data ||
      liveDetails;

    /* STATUS */

    const rawStatus =
      details.booking_status ||
      details.tripStatus ||
      details.status ||
      details.statusDescription ||
      "Confirmed";

    const normalizedStatus =
      String(rawStatus).toUpperCase();

    let status = "Confirmed";

    if (
      [
        "P",
        "K",
        "HK",
        "OK",
        "T",
        "CONFIRMED",
        "TICKETED",
        "SUCCESS",
      ].includes(normalizedStatus)
    ) {
      status = "Confirmed";
    } else if (
      [
        "Z",
        "PI",
        "H",
        "PENDING",
        "PROCESSING",
      ].includes(normalizedStatus)
    ) {
      status = "Pending";
    } else if (
      [
        "F",
        "PF",
        "Q",
        "CANCELLED",
        "CANCELED",
        "FAILED",
      ].includes(normalizedStatus)
    ) {
      status = "Cancelled";
    } else {
      status = rawStatus || "Confirmed";
    }

    /* JOURNEY */

    const journey =
      details.journey_details || {};

    const travellers =
      journey.traveller_details || [];

    const airlinesMeta =
      journey.meta_data?.airlines || {};

    const airportsMeta =
      journey.meta_data?.airports || {};

    /* SEGMENTS */

    let rawSegments = [];

    if (
      Array.isArray(
        journey.flight_details
      )
    ) {
      rawSegments =
        journey.flight_details.flatMap(
          (item) =>
            item.segment_details || []
        );
    }

    /* BOOKING INFO */

    const allBookingInfos =
      rawSegments.flatMap(
        (segment) =>
          segment.booking_infos || []
      );

    /* REAL PNR */

    const realPnr =
      allBookingInfos.find(
        (item) => item?.pnr
      )?.pnr ||
      allBookingInfos.find(
        (item) => item?.gds_pnr
      )?.gds_pnr ||
      details.pnr ||
      details.pnrNumber ||
      details.airlinePnr ||
      "";

    /* BAGGAGE */

    const baggage =
      rawSegments?.[0]?.baggage || {};

    const adultBaggage =
      baggage.ADT ||
      baggage.adt ||
      baggage;

    const includedCabinBag =
      adultBaggage?.cab ||
      adultBaggage?.cabin_baggage ||
      adultBaggage?.cabin ||
      "";

    const includedCheckinBag =
      adultBaggage?.cib ||
      adultBaggage?.checkin_baggage ||
      adultBaggage?.checkin ||
      "";

    /* PASSENGERS */

    const mappedPassengers =
      travellers.map(
        (traveller, index) => {
          const paxId =
            traveller.pax_info_id;

          const bookingInfo =
            allBookingInfos.find(
              (item) =>
                item.pax_info_id === paxId
            );

          const fallbackPassenger =
            stateToUse.passengers?.[
              index
            ] ||
            (index === 0
              ? stateToUse.passenger
              : {}) ||
            {};

          return {
            title:
              traveller.title ||
              fallbackPassenger.title ||
              "MR",

            firstName:
              traveller.fn ||
              traveller.first_name ||
              fallbackPassenger.firstName ||
              "Traveller",

            lastName:
              traveller.ln ||
              traveller.last_name ||
              fallbackPassenger.lastName ||
              "",

            type:
              traveller.type ||
              fallbackPassenger.type ||
              "ADT",

            email:
              details.user_details
                ?.email ||
              fallbackPassenger.email ||
              "",

            ticketNumber:
              bookingInfo?.ticket_number ||
              bookingInfo?.ticketNumber ||
              "",

            seatNumber:
              bookingInfo?.seat_number ||
              bookingInfo?.seatNumber ||
              fallbackPassenger.seatNumber ||
              fallbackPassenger.selectedSeat ||
              "",

            selectedMeal:
              fallbackPassenger.selectedMeal ||
              "",

            confirmedMealTitle:
              fallbackPassenger.confirmedMealTitle ||
              "",

            includedCabinBag:
              includedCabinBag ||
              fallbackPassenger.includedCabinBag ||
              fallbackPassenger.cabinBag ||
              "",

            includedCheckinBag:
              includedCheckinBag ||
              fallbackPassenger.includedCheckinBag ||
              fallbackPassenger.checkinBag ||
              "",
          };
        }
      );

    /* FLIGHTS */

    const mappedFlights =
      rawSegments.map((segment) => {
        const depEpoch =
          normalizeEpoch(segment.dd);

        const arrEpoch =
          normalizeEpoch(segment.ad);

        const depAirport =
          airportsMeta[segment.dep] || {};

        const arrAirport =
          airportsMeta[segment.arr] || {};

        const depTimezone =
          depAirport.time_zone ||
          depAirport.timezone ||
          "Asia/Kolkata";

        const arrTimezone =
          arrAirport.time_zone ||
          arrAirport.timezone ||
          "Asia/Kolkata";

        return {
          airlineCode:
            segment.al || "FL",

          airlineName:
            airlinesMeta[segment.al]
              ?.name ||
            segment.airline_name ||
            segment.al ||
            "Partner Airline",

          flightNumber:
            segment.al && segment.fn
              ? `${segment.al} ${segment.fn}`
              : segment.fn || "",

          origin:
            segment.dep || "",

          originCity:
            depAirport.city ||
            segment.dep ||
            "Departure",

          originAirportName:
            depAirport.name ||
            depAirport.airport_name ||
            "",

          destination:
            segment.arr || "",

          destinationCity:
            arrAirport.city ||
            segment.arr ||
            "Arrival",

          destinationAirportName:
            arrAirport.name ||
            arrAirport.airport_name ||
            "",

          depTime:
            formatEpochTime(
              depEpoch,
              depTimezone
            ),

          depDate:
            formatEpochDate(
              depEpoch,
              depTimezone
            ),

          arrTime:
            formatEpochTime(
              arrEpoch,
              arrTimezone
            ),

          arrDate:
            formatEpochDate(
              arrEpoch,
              arrTimezone
            ),

          departureDateTime:
            depEpoch,

          arrivalDateTime:
            arrEpoch,

          duration:
            calculateDuration(
              depEpoch,
              arrEpoch
            ) ||
            segment.duration ||
            "",
        };
      });

    return {
      status,

      pnr: realPnr,

      flights: mappedFlights,

      passengers: mappedPassengers,

      email:
        details.user_details?.email ||
        details.email ||
        "",
    };
  }, [liveDetails, stateToUse]);

  /* =========================================================
     FALLBACK FLIGHTS
     ========================================================= */

  const stateFlights = useMemo(() => {
    const source =
      flight ||
      stateToUse.flight;

    if (
      !Array.isArray(source?.segments)
    ) {
      return [];
    }

    return source.segments.map(
      (segment) => ({
        airlineCode:
          segment.airlineCode ||
          source.airlineCode ||
          "FL",

        airlineName:
          segment.airlineName ||
          source.airlineName ||
          "Partner Airline",

        flightNumber:
          segment.flightNumber ||
          source.flightNumber ||
          "",

        origin:
          segment.origin || "",

        originCity:
          segment.originCity ||
          segment.origin ||
          "Departure",

        originAirportName:
          segment.originAirportName ||
          segment.originAirport ||
          "",

        destination:
          segment.destination || "",

        destinationCity:
          segment.destinationCity ||
          segment.destination ||
          "Arrival",

        destinationAirportName:
          segment.destinationAirportName ||
          segment.destinationAirport ||
          "",

        depTime:
          formatNormalTime(
            segment.departureDateTime,
            segment.departureTime || ""
          ),

        depDate:
          formatNormalDate(
            segment.departureDateTime,
            segment.departureDate || ""
          ),

        arrTime:
          formatNormalTime(
            segment.arrivalDateTime,
            segment.arrivalTime || ""
          ),

        arrDate:
          formatNormalDate(
            segment.arrivalDateTime,
            segment.arrivalDate || ""
          ),

        departureDateTime:
          segment.departureDateTime,

        arrivalDateTime:
          segment.arrivalDateTime,

        duration:
          segment.duration ||
          calculateDuration(
            segment.departureDateTime,
            segment.arrivalDateTime
          ) ||
          source.duration ||
          "",
      })
    );
  }, [flight, stateToUse]);

  /* =========================================================
     DISPLAY DATA
     ========================================================= */

  const displayFlights =
    resolvedLiveDetails?.flights
      ?.length
      ? resolvedLiveDetails.flights
      : stateFlights;

  const fallbackPassengers =
    Array.isArray(passengers) &&
    passengers.length
      ? passengers
      : Array.isArray(
          stateToUse.passengers
        ) &&
        stateToUse.passengers.length
      ? stateToUse.passengers
      : passenger
      ? [passenger]
      : stateToUse.passenger
      ? [stateToUse.passenger]
      : [];

  const displayPassengers =
    resolvedLiveDetails?.passengers
      ?.length
      ? resolvedLiveDetails.passengers
      : fallbackPassengers;

  const displayPnr =
    resolvedLiveDetails?.pnr ||
    initialPnr ||
    (location.state
      ? "Pending"
      : "Q260820974448");

  const displayStatus =
    resolvedLiveDetails?.status ||
    "Confirmed";

  const bookingEmail =
    resolvedLiveDetails?.email ||
    displayPassengers?.[0]?.email ||
    stateToUse.email ||
    bookingData?.email ||
    bookingData?.data?.email ||
    "your registered email";

  /* =========================================================
     PRICE
     ========================================================= */

  const ticketTotal =
    flight?.price ||
    stateToUse.flight?.price ||
    bookingData?.price ||
    bookingData?.totalAmount ||
    bookingData?.amount ||
    bookingData?.data?.price ||
    bookingData?.data?.totalAmount ||
    holdData?.price ||
    holdData?.totalAmount ||
    holdData?.data?.price ||
    (!location.state ? 3486 : 0);

  /* =========================================================
     PRINT
     ========================================================= */

  const handlePrint = () => {
    window.print();
  };

  /* =========================================================
     RENDER
     ========================================================= */

  if (!loadingLiveDetails && displayFlights.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between pt-[75px]">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-none flex items-center justify-center mx-auto mb-4">
            <Plane className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">No Booking Ticket Found</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Please search for flights to start a new booking session.
          </p>
          <button
            onClick={() => navigate('/flights', { replace: true })}
            className="bg-[#b89565] hover:bg-[#a38053] text-white font-bold py-3 px-8 rounded-none transition-all shadow-md"
          >
            Search Flights
          </button>
        </div>
      </div>
    );
  }

  const searchParamsStored = localStorage.getItem('flightSearchParams');
  const parsedSearchParams = searchParamsStored ? JSON.parse(searchParamsStored) : {};
  const storedCabinClass = parsedSearchParams.travelClass || "ECONOMY";

  return (
    <>
      {loadingLiveDetails && (
        <div className="no-print fixed left-1/2 top-4 z-[9999] -translate-x-1/2 rounded-full bg-[#10284d] px-5 py-2 text-[10px] font-semibold text-white shadow-lg">
          Updating ticket details...
        </div>
      )}

      <PremiumFlightTicket
        bookingId={confirmId}
        pnr={displayPnr}
        status={displayStatus}
        flights={displayFlights}
        passengers={displayPassengers}
        totalAmount={ticketTotal}
        bookingEmail={bookingEmail}
        onPrint={handlePrint}
        navigate={navigate}
        cabinClass={storedCabinClass}
      />
    </>
  );
}