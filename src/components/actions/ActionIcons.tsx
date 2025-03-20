'use client';

import React from 'react';
import { 
  ChevronRight, 
  Pause, 
  Clock3, 
  Clock12, 
  RotateCcw, 
  Play 
} from 'lucide-react';
import { ActionType, ActionIconNames } from '@/lib/constants/actions';

interface ActionIconProps {
  action: ActionType;
  className?: string;
}

// アイコンコンポーネントのマップ
const iconComponents = {
  ChevronRight,
  Pause,
  Clock3,
  Clock12,
  RotateCcw,
  Play
};

export const ActionIcon: React.FC<ActionIconProps> = ({ action, className = "w-4 h-4" }) => {
  // アイコン名を取得
  const iconName = ActionIconNames[action] as keyof typeof iconComponents;
  
  // 対応するコンポーネントを取得
  const IconComponent = iconComponents[iconName];
  
  // コンポーネントを返す
  return <IconComponent className={className} />;
};

export default ActionIcon;