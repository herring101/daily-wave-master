'use client';

import React, { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface FailureAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const FailureAnimation: React.FC<FailureAnimationProps> = ({ show, onComplete }) => {
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
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      <div className="relative bg-white rounded-lg p-8 shadow-lg animate-wiggle">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-orange-700 mb-2">再挑戦！</h2>
          <p className="text-lg text-gray-600">惜しい！もう一度挑戦してみましょう</p>
        </div>
      </div>
    </div>
  );
};

export default FailureAnimation;