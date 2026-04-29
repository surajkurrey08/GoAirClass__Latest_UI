import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

/**
 * OfferSlider Component
 * A premium, responsive carousel for travel offers using Swiper.js and Tailwind CSS.
 */
const OfferSlider = ({ offers = [], activeCoupons = [] }) => {
  const navigate = useNavigate();

  // Combine or prioritize data sources
  const displayOffers = activeCoupons.length > 0 ? activeCoupons : offers;

  if (!displayOffers || displayOffers.length === 0) return null;

  return (
    <div className="offer-slider-container relative px-4 py-8">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        grabCursor={true}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          1024: {
            slidesPerView: 3,
          },
        }}
        className="offer-swiper !pb-12"
      >
        {displayOffers.map((offer, index) => {
          // Normalize data based on source (activeCoupons vs mockData offers)
          const isCoupon = !!offer.code;
          const title = offer.title || offer.name;
          const subtitle = offer.subtitle || offer.desc;
          const discount = offer.discountText || offer.discount;
          const image = offer.image;
          const badgeText = isCoupon ? (offer.status === 'Active' ? 'LIVE OFFER' : 'PROMO') : (offer.badge || 'SPECIAL');
          const code = offer.code;
          const buttonText = offer.buttonText || offer.tag || 'Book Now';

          return (
            <SwiperSlide key={offer._id || offer.id || index}>
              <div 
                className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer h-[260px]"
                onClick={() => navigate('/search')}
              >
                {/* Background Image with Lazy Loading */}
                {image && (
                  <img 
                    src={image} 
                    alt={title} 
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                
                {/* Gradient Overlay for Text Legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-opacity duration-300 group-hover:opacity-90" />
                
                {/* Content */}
                <div className="relative z-10 flex h-full flex-col p-6 text-white">
                  {/* Badge */}
                  <div className="mb-3 flex w-fit items-center gap-1 rounded-md bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-lg">
                    <Sparkles size={10} />
                    {badgeText}
                  </div>
                  
                  {/* Title & Subtitle */}
                  <h3 className="text-xl font-bold leading-tight group-hover:text-amber-400 transition-colors">{title}</h3>
                  <p className="mt-1 text-xs text-slate-300 line-clamp-2">{subtitle}</p>
                  
                  {/* Discount Text */}
                  <div className="mt-auto mb-4 font-serif text-3xl font-black italic tracking-tight text-white drop-shadow-md">
                    {discount}
                  </div>
                  
                  {/* Footer Row */}
                  <div className="flex items-end justify-between gap-4">
                    {code && (
                      <div className="flex flex-col rounded-lg bg-black/40 px-3 py-1.5 border border-white/10 backdrop-blur-sm">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">CODE</span>
                        <strong className="font-mono text-sm font-bold text-amber-400">{code}</strong>
                      </div>
                    )}
                    
                    <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold transition-all hover:bg-white hover:text-blue-600 group-hover:scale-105 active:scale-95 shadow-lg shadow-blue-600/30">
                      {buttonText}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Custom Navigation Arrows */}
      <div className="swiper-button-prev-custom absolute left-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-blue-600 shadow-lg transition-all hover:bg-blue-600 hover:text-white md:-left-4 hidden lg:flex">
        <ArrowRight className="rotate-180" size={20} />
      </div>
      <div className="swiper-button-next-custom absolute right-0 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full bg-white/90 p-2 text-blue-600 shadow-lg transition-all hover:bg-blue-600 hover:text-white md:-right-4 hidden lg:flex">
        <ArrowRight size={20} />
      </div>

      {/* Pagination Styling override */}
      <style>{`
        .offer-swiper .swiper-pagination-bullet {
          background: #2563eb;
          opacity: 0.3;
          width: 8px;
          height: 8px;
          transition: all 0.3s ease;
        }
        .offer-swiper .swiper-pagination-bullet-active {
          opacity: 1;
          width: 24px;
          border-radius: 4px;
        }
        .offer-swiper .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default OfferSlider;
