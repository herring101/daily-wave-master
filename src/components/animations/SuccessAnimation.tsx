'use client';

import React, { useEffect } from 'react';
import { Check } from 'lucide-react';

interface SuccessAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const SuccessAnimation: React.FC<SuccessAnimationProps> = ({ show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black bg-opacity-40 animate-pulse"></div>
      <div className="relative bg-white rounded-lg p-8 shadow-lg transform scale-110 animate-bounce">
        <div className="text-center">
          <Check className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-green-700 mb-2">成功！</h2>
          <p className="text-lg text-gray-600">素晴らしい波形制御です</p>
        </div>
      </div>
    </div>
  );
};

export default SuccessAnimation;