import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const AnimatedCounter = ({ value }) => {
  const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => Math.round(current));
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
};

const ProfileTab = () => {
  const { user } = useAuth();

  if (!user) return null;

  const pointsValue = (user.loyaltyPoints * 0.1).toFixed(2); // e.g. 1 point = 0.1 rupees

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">My Profile</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Profile Info */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center text-3xl font-bold mb-6">
            {user.name.charAt(0).toUpperCase()}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
              <p className="text-lg font-medium text-gray-900">{user.name}</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Mobile Number</label>
              <p className="text-lg font-medium text-gray-900">{user.mobile}</p>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Email Address</label>
              <p className="text-lg font-medium text-gray-900">{user.email || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Loyalty Points */}
        <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-8 rounded-3xl shadow-lg text-white flex flex-col justify-between relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute -top-10 -right-10 text-9xl opacity-10">🌟</div>
          
          <div>
            <h3 className="text-2xl font-bold mb-2">Loyalty Points</h3>
            <p className="text-amber-100 font-medium">Earn 1 point for every ₹10 spent</p>
          </div>
          
          <div className="my-8 text-center">
            <div className="text-7xl font-bold mb-2">
              <AnimatedCounter value={user.loyaltyPoints || 0} />
            </div>
            <p className="text-amber-100 text-lg">Total Points Available</p>
          </div>
          
          <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm">
            <p className="text-sm font-medium">
              <span className="font-bold text-white">{user.loyaltyPoints || 0} points</span> = ₹{pointsValue} value
            </p>
            <p className="text-xs text-amber-100 mt-1 uppercase tracking-wide">Redemption coming soon</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfileTab;
