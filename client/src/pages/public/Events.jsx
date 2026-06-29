import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/axiosInstance';
import PageWrapper from '../../components/PageWrapper';
import Footer from '../../components/Footer';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await axiosInstance.get('/events');
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Sort events so upcoming is first, but since the backend sorts by date ascending, we might just split them.
  const now = new Date();
  
  // A simple way to split upcoming and past if needed, 
  // but let's just show them all in the order returned for now, 
  // highlighting the ones that are in the future.
  
  return (
    <PageWrapper>
      <div className="bg-white min-h-screen pt-16 flex flex-col">
        <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-dark mb-4">Bakery Events</h1>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              Join us for special tastings, holiday pop-ups, and community gatherings. Don't miss out on what's baking next!
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-20 text-muted bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <span className="text-4xl block mb-4">🎈</span>
              <p className="text-xl font-medium">No upcoming events right now.</p>
              <p className="mt-2">Check back soon for holiday specials and announcements!</p>
            </div>
          ) : (
            <div className="space-y-12">
              {events.map((event, index) => {
                const eventDate = new Date(event.date);
                const isPast = eventDate < now;
                const formattedDate = eventDate.toLocaleDateString(undefined, { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                });

                return (
                  <motion.div 
                    key={event._id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col md:flex-row gap-6 md:gap-10 rounded-3xl overflow-hidden border ${isPast ? 'border-gray-200 bg-gray-50/50 opacity-80' : 'border-amber-100 bg-white shadow-xl shadow-amber-900/5'} transition-all duration-300 hover:shadow-2xl hover:-translate-y-1`}
                  >
                    {/* Event Image */}
                    <div className="md:w-2/5 shrink-0 relative overflow-hidden group">
                      {event.imageUrl ? (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-64 md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-64 md:h-full bg-amber-50 flex items-center justify-center">
                          <span className="text-6xl">🎉</span>
                        </div>
                      )}
                      
                      {/* Date Badge overlay */}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur shadow-lg rounded-xl flex flex-col items-center justify-center w-16 h-16 border border-amber-100">
                        <span className="text-amber-600 font-bold text-xl leading-none">{eventDate.getDate()}</span>
                        <span className="text-gray-600 font-medium text-xs uppercase tracking-wider">{eventDate.toLocaleString('default', { month: 'short' })}</span>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="p-6 md:p-8 md:w-3/5 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        {isPast ? (
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full uppercase tracking-wide">
                            Past Event
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wide animate-pulse">
                            Upcoming
                          </span>
                        )}
                        <span className="text-gray-500 text-sm font-medium">
                          {formattedDate}
                        </span>
                      </div>
                      
                      <h2 className="text-2xl md:text-3xl font-bold text-dark mb-4">{event.title}</h2>
                      <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">
                        {event.description}
                      </p>
                      
                      {!isPast && (
                        <div className="mt-auto">
                          <a 
                            href={`https://wa.me/918074381678?text=Hi! I'm interested in the upcoming event: ${event.title} on ${formattedDate}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-full font-bold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                            </svg>
                            Inquire Now
                          </a>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
        <Footer />
      </div>
    </PageWrapper>
  );
};

export default Events;
