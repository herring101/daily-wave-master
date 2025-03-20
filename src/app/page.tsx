'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// DailyWaveMasterをクライアントサイドでのみレンダリングするために
// dynamic importを使用します（Canvasの操作があるため）
const DailyWaveMaster = dynamic(
  () => import('@/components/DailyWaveMaster'),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen">
      <DailyWaveMaster />
    </div>
  );
}