'use client';

import React from 'react';
import { ActionType, ActionTypes, ActionColors, ActionLabels } from '@/lib/constants/actions';
import { BeatInterval } from '@/lib/constants/actions';
import ActionIcon from '../actions/ActionIcons';

interface VisualTimelineProps {
  inputs: ActionType[][];
  beatInterval: BeatInterval;
  onSelectCell: (index: number) => void;
  selectedIndex: number;
}

const VisualTimeline: React.FC<VisualTimelineProps> = ({ 
  inputs, 
  beatInterval, 
  onSelectCell, 
  selectedIndex 
}) => {
  // 1小節の拍数を算出
  const totalBeats = 4; // 1小節は4拍
  const totalCells = totalBeats / beatInterval;
  
  // 拍のラベル配列を生成
  const beatLabels = [];
  for (let i = 1; i <= totalBeats; i++) {
    beatLabels.push(i);
  }
  
  return (
    <div className="w-full mb-6">
      {/* 拍子ラベル */}
      <div className="flex">
        {beatLabels.map((beat) => (
          <div 
            key={`beat-${beat}`} 
            className="flex-1 text-center text-xs font-medium text-gray-600 mb-1"
          >
            {beat}拍目
          </div>
        ))}
      </div>
      
      {/* タイムライングリッド */}
      <div className="flex h-20 border border-gray-300 rounded-lg overflow-hidden">
        {inputs.map((actions, index) => {
          // 各セルの幅を計算
          const cellWidth = `${100 / totalCells}%`;
          
          // セルの背景色
          const hasActions = actions.length > 0 && actions[0] !== ActionTypes.NONE;
          const defaultBgColor = '#f9fafb';
          
          // 操作テキスト（複数操作の場合）
          const actionsText = actions && actions.length > 0 && actions[0] !== ActionTypes.NONE
            ? actions.map(a => ActionLabels[a].split('(')[0]).join('+')
            : '';
          
          return (
            <div
              key={`timeline-cell-${index}`}
              style={{ 
                width: cellWidth,
                borderLeft: index > 0 ? '1px solid #e5e7eb' : 'none',
                borderRight: index < inputs.length - 1 ? '1px solid #e5e7eb' : 'none',
                borderBottom: index === selectedIndex ? `3px solid ${ActionColors[actions[0] || ActionTypes.NONE]}` : 'none',
              }}
              className="relative flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
              onClick={() => onSelectCell(index)}
            >
              {/* ビート区切り線（太め） */}
              {index > 0 && index % (1 / beatInterval) === 0 && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-400"></div>
              )}
              
              {/* 複数のアクションを表示 */}
              {hasActions ? (
                <div className="absolute inset-0 flex flex-col">
                  {actions.map((action, actionIndex) => (
                    <div 
                      key={`action-${index}-${actionIndex}`}
                      className="flex items-center justify-center"
                      style={{ 
                        flex: 1,
                        backgroundColor: `${ActionColors[action]}20`,
                        borderBottom: actionIndex < actions.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <ActionIcon action={action} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="absolute inset-0" style={{ backgroundColor: defaultBgColor }}></div>
              )}
              
              {/* アクションの短縮テキスト */}
              {actions.length > 1 && (
                <div className="absolute bottom-1 text-xs text-center text-gray-600 w-full z-10">
                  {actionsText}
                </div>
              )}
              
              {/* セル選択インジケーター */}
              {index === selectedIndex && (
                <div className="absolute top-0 left-0 right-0 h-1 z-20" 
                  style={{ backgroundColor: ActionColors[actions[0] || ActionTypes.NONE] }}></div>
              )}
              
              {/* 拍子細分表示 */}
              <div className="absolute top-1 text-xs text-gray-500 z-10">
                {beatInterval === 0.5 ? 
                  (index % 2 === 0 ? '表' : '裏') : 
                  (beatInterval === 1 ? '' : (index * 2 + 1))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualTimeline;