import React, { useState } from 'react';
import { X, Clock, Luggage, ShieldCheck, Info } from 'lucide-react';
import './FlightDetailsModal.css';

const FlightDetailsModal = ({ flight, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  if (!flight) return null;

  return (
    <div className="fd-modal-overlay" onClick={onClose}>
      <div className="fd-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="fd-close-btn" onClick={onClose}><X size={24} /></button>

        {/* Tabs */}
        <div className="fd-tabs">
          <button 
            className={`fd-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            Flight Details
          </button>
          <button 
            className={`fd-tab ${activeTab === 'cancellation' ? 'active' : ''}`}
            onClick={() => setActiveTab('cancellation')}
          >
            Cancellation
          </button>
          <button 
            className={`fd-tab ${activeTab === 'reschedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('reschedule')}
          >
            Rescheduling
          </button>
        </div>

        <div className="fd-body">
          {activeTab === 'details' && (
            <div className="fd-itinerary">
              <div className="fd-route-header">
                <h3>{flight.from} → {flight.to}</h3>
                <span>Non-Stop · {flight.duration} · Economy</span>
              </div>

              <div className="fd-timeline">
                <div className="fd-checkpoint">
                  <div className="fd-time-info">
                    <span className="fd-time">{flight.departureTime}</span>
                    <span className="fd-date">Mon, 27 Apr</span>
                  </div>
                  <div className="fd-marker">
                    <div className="fd-dot"></div>
                    <div className="fd-line"></div>
                  </div>
                  <div className="fd-airport-info">
                    <strong>{flight.from} · {flight.airline}</strong>
                    <p>Terminal 1</p>
                  </div>
                </div>

                <div className="fd-duration-strip">
                  <Clock size={14} /> <span>{flight.duration}</span>
                </div>

                <div className="fd-checkpoint">
                  <div className="fd-time-info">
                    <span className="fd-time">{flight.arrivalTime}</span>
                    <span className="fd-date">Mon, 27 Apr</span>
                  </div>
                  <div className="fd-marker">
                    <div className="fd-dot"></div>
                  </div>
                  <div className="fd-airport-info">
                    <strong>{flight.to} · {flight.airline}</strong>
                    <p>Terminal 2</p>
                  </div>
                </div>
              </div>

              <div className="fd-baggage-info">
                <h4><Luggage size={18} /> Baggage Policy</h4>
                <div className="fd-baggage-grid">
                  <div className="fd-bag-item">
                    <span>Cabin Baggage</span>
                    <strong>7 kg (1 piece per pax)</strong>
                  </div>
                  <div className="fd-bag-item">
                    <span>Check-in Baggage</span>
                    <strong>15 kg (1 piece per pax)</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cancellation' && (
            <div className="fd-policy">
              <h4><ShieldCheck size={18} /> Cancellation Policy</h4>
              <table className="fd-policy-table">
                <thead>
                  <tr>
                    <th>Time frame</th>
                    <th>Cancellation Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0-2 hours before departure</td>
                    <td>Non-Refundable</td>
                  </tr>
                  <tr>
                    <td>2-24 hours before departure</td>
                    <td>₹3,500</td>
                  </tr>
                  <tr>
                    <td>24+ hours before departure</td>
                    <td>₹3,000</td>
                  </tr>
                </tbody>
              </table>
              <div className="fd-note">
                <Info size={14} /> <span>Convenience fee is non-refundable.</span>
              </div>
            </div>
          )}

          {activeTab === 'reschedule' && (
            <div className="fd-policy">
              <h4><Clock size={18} /> Rescheduling Policy</h4>
              <table className="fd-policy-table">
                <thead>
                  <tr>
                    <th>Time frame</th>
                    <th>Reschedule Fee</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>0-2 hours before departure</td>
                    <td>Non-Reschedulable</td>
                  </tr>
                  <tr>
                    <td>2-24 hours before departure</td>
                    <td>₹3,250 + Fare Difference</td>
                  </tr>
                  <tr>
                    <td>24+ hours before departure</td>
                    <td>₹2,750 + Fare Difference</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="fd-footer">
          <div className="fd-total">
            <span>Total Fare</span>
            <strong>₹{flight.price.toLocaleString()}</strong>
          </div>
          <button className="fd-book-now" onClick={() => window.location.href=`/booking/${flight._id}?type=flight`}>
            Book Flight
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetailsModal;
