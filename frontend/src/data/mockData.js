export const destinations = [
  { id: 1, name: 'Dubai', country: 'UAE', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', hotels: '4K+', destinations: '1,000+', price: 15999, gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 2, name: 'Bali', country: 'Indonesia', flag: '🇮🇩', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80', hotels: '2K+', destinations: '800+', price: 22999, gradient: 'linear-gradient(135deg,#0ea5e9,#10b981)' },
  { id: 3, name: 'Paris', country: 'France', flag: '🇫🇷', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80', hotels: '5K+', destinations: '1,200+', price: 35999, gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 4, name: 'Maldives', country: 'Maldives', flag: '🇲🇻', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', hotels: '500+', destinations: '200+', price: 45999, gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
  { id: 5, name: 'Japan', country: 'Japan', flag: '🇯🇵', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80', hotels: '8K+', destinations: '2,500+', price: 38999, gradient: 'linear-gradient(135deg,#ef4444,#f59e0b)' },
  { id: 6, name: 'Manali', country: 'India', flag: '🇮🇳', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=80', hotels: '300+', destinations: '150+', price: 8999, gradient: 'linear-gradient(135deg,#10b981,#06b6d4)' },
]

export const popularRoutes = [
  { from: 'Mumbai', to: 'Delhi', type: 'flight', price: 2499, duration: '2h 10m', icon: '✈️' },
  { from: 'Bangalore', to: 'Goa', type: 'flight', price: 1899, duration: '1h 20m', icon: '✈️' },
  { from: 'Delhi', to: 'Jaipur', type: 'train', price: 450, duration: '4h 30m', icon: '🚆' },
  { from: 'Mumbai', to: 'Pune', type: 'bus', price: 299, duration: '3h 00m', icon: '🚌' },
  { from: 'Chennai', to: 'Hyderabad', type: 'train', price: 650, duration: '6h 15m', icon: '🚆' },
  { from: 'Kolkata', to: 'Mumbai', type: 'flight', price: 3299, duration: '2h 50m', icon: '✈️' },
]

export const offers = [
  { id: 1, title: 'Book Train Tickets', subtitle: 'Save Time and Money!', discount: '5% OFF', tag: 'On Train Booking', color: '#1e3a5f', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400&q=80', badge: 'HOT' },
  { id: 2, title: '100 Lucky Customers', subtitle: 'Every Month', discount: '100% Cashback', tag: 'On Bus Booking', color: '#fff', isLight: true, badge: 'WIN' },
  { id: 3, title: 'Metro Card Recharge', subtitle: 'Flat Cashback', discount: '₹10 Cashback', tag: 'On Metro Card', color: '#2563EB', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&q=80', badge: 'NEW' },
]

export const features = [
  { icon: '🛡️', title: 'Secure Booking', desc: 'Your payments are 100% secure with end-to-end encryption and trusted payment gateways.' },
  { icon: '💰', title: 'Best Price Guarantee', desc: 'We match any lower price you find. Book with confidence and get the best deals always.' },
  { icon: '🎯', title: 'Easy Cancellation', desc: 'Plans change. Cancel or modify your bookings easily with our hassle-free policy.' },
  { icon: '🌍', title: '500+ Destinations', desc: 'Explore over 500 destinations across India and worldwide with curated experiences.' },
  { icon: '📞', title: '24/7 Support', desc: 'Our travel experts are available round the clock to assist you at every step.' },
  { icon: '⚡', title: 'Instant Confirmation', desc: 'Get instant booking confirmations and e-tickets delivered straight to your inbox.' },
]

export const testimonials = [
  { id: 1, name: 'Priya Sharma', role: 'Travel Blogger', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100&q=80', rating: 5, review: 'goairclass made my Bali trip so seamless! Booked flights, hotel and transfers all in one place. The UI is incredibly intuitive and the prices are unbeatable.' },
  { id: 2, name: 'Rahul Mehta', role: 'Business Traveler', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80', rating: 5, review: 'I travel every week for work and Goairclass has become my go-to app. Quick booking, great deals, and the 24/7 support is genuinely helpful. Highly recommended!' },
  { id: 3, name: 'Anjali Nair', role: 'Vacation Planner', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80', rating: 5, review: 'Planned a family trip to Manali completely through Goairclass. From train tickets to hotel, everything was perfect. The destination cards gave great inspiration too!' },
]

export const searchResults = {
  flights: [
    { id: 'f1', from: 'Mumbai (BOM)', to: 'Delhi (DEL)', airline: 'IndiGo', code: '6E-204', depart: '06:00', arrive: '08:10', duration: '2h 10m', price: 2499, seats: 8, stops: 'Non-stop', rating: 4.5 },
    { id: 'f2', from: 'Mumbai (BOM)', to: 'Delhi (DEL)', airline: 'Air India', code: 'AI-864', depart: '09:30', arrive: '11:45', duration: '2h 15m', price: 3199, seats: 3, stops: 'Non-stop', rating: 4.2 },
    { id: 'f3', from: 'Mumbai (BOM)', to: 'Delhi (DEL)', airline: 'Vistara', code: 'UK-981', depart: '14:15', arrive: '16:40', duration: '2h 25m', price: 3899, seats: 12, stops: 'Non-stop', rating: 4.8 },
  ],
  hotels: [
    { id: 'h1', name: 'The Leela Palace', location: 'New Delhi', stars: 5, image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', price: 8500, rating: 4.9, reviews: 2341, amenities: ['WiFi', 'Pool', 'Spa', 'Restaurant'] },
    { id: 'h2', name: 'Taj Hotel & Convention', location: 'New Delhi', stars: 5, image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400&q=80', price: 7200, rating: 4.8, reviews: 1876, amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'] },
    { id: 'h3', name: 'Lemon Tree Premier', location: 'Aerocity, Delhi', stars: 4, image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80', price: 3400, rating: 4.5, reviews: 956, amenities: ['WiFi', 'Pool', 'Gym'] },
  ],
  trains: [
    { id: 't1', name: 'Rajdhani Express', number: '12951', from: 'Mumbai Central', to: 'New Delhi', depart: '17:00', arrive: '08:35', duration: '15h 35m', price: 1450, class: '2A', seats: 24 },
    { id: 't2', name: 'Shatabdi Express', number: '12009', from: 'Mumbai CST', to: 'New Delhi', depart: '06:25', arrive: '22:00', duration: '15h 35m', price: 850, class: 'CC', seats: 42 },
  ],
  buses: [
    { id: 'b1', operator: 'VRL Travels', type: 'Volvo AC Sleeper', from: 'Mumbai', to: 'Goa', depart: '21:00', arrive: '07:30', duration: '10h 30m', price: 899, seats: 6, rating: 4.4 },
    { id: 'b2', operator: 'SRS Travels', type: 'AC Seater', from: 'Mumbai', to: 'Goa', depart: '22:30', arrive: '08:00', duration: '9h 30m', price: 599, seats: 14, rating: 4.1 },
  ]
}
