import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaCheck, FaTimes, FaShoppingCart } from 'react-icons/fa';

interface Trip {
  id: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  duration: string;
  date: string;
  description: string;
  images: string[];
  itinerary: {
    day: number;
    title: string;
    description: string;
  }[];
  included: string[];
  excluded: string[];
}

export const DetailTrip = () => {
  const { id } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [guests, setGuests] = useState(1);

  useEffect(() => {
    const fetchTripDetails = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`/api/trips/${id}`);
        // const data = await response.json();
        
        // Mock data for development
        const mockData = {
          id: '1',
          title: 'Exploring Ha Long Bay',
          location: 'Ha Long Bay, Vietnam',
          rating: 4.8,
          reviews: 124,
          price: 299,
          duration: '3 days, 2 nights',
          date: 'Available all year',
          description: 'Experience the breathtaking beauty of Ha Long Bay with its emerald waters and thousands of towering limestone islands. Cruise through the bay, explore hidden caves, enjoy kayaking, and savor fresh seafood on this unforgettable journey.',
          images: [
            'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b',
            'https://images.unsplash.com/photo-1573270689103-d5a9b371ce5f',
            'https://images.unsplash.com/photo-1540202404-1b927e27fa8b',
            'https://images.unsplash.com/photo-1528127269322-539801943592'
          ],
          itinerary: [
            {
              day: 1,
              title: 'Hanoi to Ha Long Bay',
              description: 'Morning pickup from your hotel in Hanoi, transfer to Ha Long Bay. Board the cruise in the afternoon, enjoy welcome lunch and visit Sung Sot Cave.'
            },
            {
              day: 2,
              title: 'Bay Exploration',
              description: 'Start the day with Tai Chi on the sundeck, visit fishing villages by kayak, swim at private beaches, and enjoy cooking demonstration.'
            },
            {
              day: 3,
              title: 'Return to Hanoi',
              description: 'Early morning view of the bay, brunch on board while cruising back to harbor. Transfer back to Hanoi, arriving by late afternoon.'
            }
          ],
          included: [
            'Hotel pickup and drop-off from Hanoi',
            'Cruise accommodation',
            'All meals on board',
            'English speaking guide',
            'Kayaking and cave entrance fees'
          ],
          excluded: [
            'Beverages',
            'Personal expenses',
            'Travel insurance',
            'Tips and gratuities'
          ]
        };
        
        setTrip(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching trip details:', error);
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
          Trip not found or an error occurred.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      {/* Image Gallery */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img 
                src={trip.images[activeImage]} 
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="mt-3 flex space-x-2 overflow-x-auto pb-2">
              {trip.images.map((image, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveImage(index)}
                  className={`h-20 w-32 flex-shrink-0 rounded-md overflow-hidden cursor-pointer ${activeImage === index ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <img 
                    src={image} 
                    alt={`${trip.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Booking Card */}
          <div className="mt-6 lg:mt-0">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="text-2xl font-bold text-gray-800">${trip.price} <span className="text-sm font-normal text-gray-500">/ person</span></div>
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="font-medium">{trip.rating}</span>
                  <span className="text-gray-500 text-sm ml-1">({trip.reviews} reviews)</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center mb-3">
                  <FaClock className="text-gray-500 mr-2" />
                  <span>{trip.duration}</span>
                </div>
                <div className="flex items-center mb-4">
                  <FaCalendarAlt className="text-gray-500 mr-2" />
                  <span>{trip.date}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-4">
                <label className="block text-gray-700 mb-2">Number of Guests</label>
                <div className="flex items-center">
                  <button 
                    onClick={() => setGuests(prev => Math.max(1, prev - 1))}
                    className="bg-gray-200 px-3 py-1 rounded-l-md"
                  >
                    -
                  </button>
                  <span className="bg-gray-100 px-6 py-1 text-center">{guests}</span>
                  <button 
                    onClick={() => setGuests(prev => prev + 1)}
                    className="bg-gray-200 px-3 py-1 rounded-r-md"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-gray-200 py-4">
                <div className="flex justify-between mb-2">
                  <span>Price × {guests}</span>
                  <span>${trip.price * guests}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Service fee</span>
                  <span>${Math.round(trip.price * guests * 0.1)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${trip.price * guests + Math.round(trip.price * guests * 0.1)}</span>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium flex items-center justify-center">
                <FaShoppingCart className="mr-2" />
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trip Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{trip.title}</h1>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-1" />
                <span>{trip.location}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">About this trip</h2>
              <p className="text-gray-700 leading-relaxed">{trip.description}</p>
            </div>

            {/* Itinerary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
              <div className="space-y-4">
                {trip.itinerary.map((item) => (
                  <div key={item.day} className="border-l-2 border-blue-500 pl-4 pb-2">
                    <h3 className="font-bold text-lg">Day {item.day}: {item.title}</h3>
                    <p className="text-gray-700">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Included/Excluded */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-3">What's included</h2>
                <ul className="space-y-2">
                  {trip.included.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <FaCheck className="text-green-500 mr-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">What's not included</h2>
                <ul className="space-y-2">
                  {trip.excluded.map((item, index) => (
                    <li key={index} className="flex items-center">
                      <FaTimes className="text-red-500 mr-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};