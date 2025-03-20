'use client';

import React from 'react';
import { ActionType, ActionTypes, ActionColors, ActionLabels } from '@/lib/constants/actions';
import ActionIcon from './ActionIcons';

interface MultiActionSelectorProps {
  actions: ActionType[];
  onChange: (actions: ActionType[]) => void;
}

const MultiActionSelector: React.FC<MultiActionSelectorProps> = ({ actions, onChange }) => {
  // アクションの切り替え
  const toggleAction = (actionType: ActionType) => {
    // NONEの場合は特別処理
    if (actionType === ActionTypes.NONE) {
      onChange([ActionTypes.NONE]);
      return;
    }
    
    // 現在の選択から除外するかどうか
    const isCurrentlySelected = actions.includes(actionType);
    
    if (isCurrentlySelected) {
      // 選択されている場合は削除
      const newActions = actions.filter(a => a !== actionType);
      
      // 空の場合はNONEをセット
      if (newActions.length === 0) {
        onChange([ActionTypes.NONE]);
      } else {
        onChange(newActions);
      }
    } else {
      // 選択されていない場合は追加（NONEがあれば除去）
      const newActions = actions.filter(a => a !== ActionTypes.NONE);
      newActions.push(actionType);
      onChange(newActions);
    }
  };
  
  // 選択状態のクラス
  const getButtonClass = (actionType: ActionType) => {
    const isSelected = actions.includes(actionType);
    
    return `p-2 rounded flex flex-col items-center ${
      isSelected
        ? 'ring-2 ring-offset-1'
        : 'hover:bg-gray-100'
    }`;
  };
  
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
      {Object.values(ActionTypes).map((value) => (
        <button
          key={value}
          className={getButtonClass(value)}
          style={{ 
            backgroundColor: actions.includes(value) ? `${ActionColors[value]}20` : '', 
            color: ActionColors[value],
            borderColor: ActionColors[value]
          }}
          onClick={() => toggleAction(value)}
        >
          <ActionIcon action={value} />
          <span className="text-xs mt-1 text-gray-700">
            {ActionLabels[value].split('(')[0]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default MultiActionSelector;