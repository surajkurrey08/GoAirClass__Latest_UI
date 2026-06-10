import React from 'react';

const AirlineMarquee = () => {
  const topRowAirlines = [
    { name: 'Air India', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AI.png' },
    { name: 'IndiGo', logo: 'https://www.gstatic.com/flights/airline_logos/70px/6E.png' },
    { name: 'Vistara', logo: 'https://www.gstatic.com/flights/airline_logos/70px/UK.png' },
    { name: 'SpiceJet', logo: 'https://www.gstatic.com/flights/airline_logos/70px/SG.png' },
    { name: 'Akasa Air', logo: 'https://www.gstatic.com/flights/airline_logos/70px/QP.png' },
    { name: 'Alliance Air', logo: 'https://www.gstatic.com/flights/airline_logos/70px/9I.png' },
    { name: 'Star Air', logo: 'https://www.gstatic.com/flights/airline_logos/70px/S5.png' },
    { name: 'Air India Express', logo: 'https://www.gstatic.com/flights/airline_logos/70px/IX.png' },
  ];

  const bottomRowAirlines = [
    { name: 'Qatar Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/QR.png' },
    { name: 'Singapore Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/SQ.png' },
    { name: 'Lufthansa', logo: 'https://www.gstatic.com/flights/airline_logos/70px/LH.png' },
    { name: 'British Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/BA.png' },
    { name: 'Air France', logo: 'https://www.gstatic.com/flights/airline_logos/70px/AF.png' },
    { name: 'KLM', logo: 'https://www.gstatic.com/flights/airline_logos/70px/KL.png' },
    { name: 'Turkish Airlines', logo: 'https://www.gstatic.com/flights/airline_logos/70px/TK.png' },
    { name: 'Etihad Airways', logo: 'https://www.gstatic.com/flights/airline_logos/70px/EY.png' },
    { name: 'Cathay Pacific', logo: 'https://www.gstatic.com/flights/airline_logos/70px/CX.png' },
  ];

  // Double the content for seamless scrolling
  const topRow = [...topRowAirlines, ...topRowAirlines];
  const bottomRow = [...bottomRowAirlines, ...bottomRowAirlines];

  return (
    <section className="airline-marquee-section py-20 bg-[#f8fafc] overflow-hidden relative border-y border-gray-100">
      {/* CSS Keyframes */}
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes scroll-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
          .animate-scroll-left {
            animation: scroll-left 50s linear infinite;
          }
          .animate-scroll-right {
            animation: scroll-right 50s linear infinite;
          }
          .animate-scroll-left:hover,
          .animate-scroll-right:hover {
            animation-play-state: paused;
          }
          @media (max-width: 768px) {
            .animate-scroll-left, .animate-scroll-right {
              animation-duration: 70s;
            }
          }
        `}
      </style>

      <div className="container mx-auto px-4 mb-12 text-center">
        <div className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-widest text-blue-600 uppercase bg-blue-50 rounded-full">
          Global Connectivity
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Fly with the World's Best
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto font-medium pb-10">
          Our strategic partnerships with leading airlines ensure you get the best routes,
          prices, and service every time you book.
        </p>
      </div>

      <div className="relative w-full">
        {/* Edge Gradients - More pronounced for premium feel */}
        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-gradient-to-r from-[#f8fafc] via-[#f8fafc]/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-32 md:w-64 h-full bg-gradient-to-l from-[#f8fafc] via-[#f8fafc]/80 to-transparent z-10 pointer-events-none"></div>

        {/* Top Row: Right to Left */}
        <div className="flex mb-12">
          <div className="flex animate-scroll-left whitespace-nowrap">
            {topRow.map((airline, index) => (
              <div
                key={`top-${index}`}
                className="flex items-center mx-10 md:mx-16 group transition-all duration-500"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center mr-5 bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-blue-100 transition-all duration-300">
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="max-w-full max-h-full object-contain transition-all duration-500 transform group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=' + airline.name.charAt(0); }}
                  />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-400 group-hover:text-gray-900 transition-colors duration-300 tracking-tight">
                  {airline.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row: Left to Right */}
        <div className="flex">
          <div className="flex animate-scroll-right whitespace-nowrap">
            {bottomRow.map((airline, index) => (
              <div
                key={`bottom-${index}`}
                className="flex items-center mx-10 md:mx-16 group transition-all duration-500"
              >
                <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center mr-5 bg-white p-2 rounded-xl shadow-sm border border-gray-100 group-hover:shadow-md group-hover:border-blue-100 transition-all duration-300">
                  <img
                    src={airline.logo}
                    alt={airline.name}
                    className="max-w-full max-h-full object-contain transition-all duration-500 transform group-hover:scale-110"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=' + airline.name.charAt(0); }}
                  />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-400 group-hover:text-gray-900 transition-colors duration-300 tracking-tight">
                  {airline.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirlineMarquee;
