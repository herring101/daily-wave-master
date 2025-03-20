'use client';

import React, { useState, useEffect } from 'react';
import MultiActionSelector from '@/components/actions/MultiActionSelector';
import VisualTimeline from '@/components/timeline/VisualTimeline';
import { ActionType, ActionTypes, BeatInterval, BeatIntervals } from '@/lib/constants/actions';

interface InputEditorProps {
  inputs: ActionType[][];
  onChange: (inputs: ActionType[][]) => void;
  beatInterval: BeatInterval;
  setBeatInterval: (interval: BeatInterval) => void;
}

const InputEditor: React.FC<InputEditorProps> = ({ 
  inputs, 
  onChange, 
  beatInterval, 
  setBeatInterval 
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [propagateChanges, setPropagateChanges] = useState(true); // デフォルトで継続する
  
  // 選択されたセルのアクションを変更
  const handleActionsChange = (actions: ActionType[]) => {
    const newInputs = [...inputs];
    
    // 現在のセルの操作を変更
    const prevActions = [...newInputs[selectedIndex]];
    newInputs[selectedIndex] = actions;
    
    // 「継続する」設定がオンで、変更がある場合のみ以降のセルに伝播
    if (propagateChanges) {
      // 追加された操作（前になくて今追加されたもの）
      const addedActions = actions.filter(action => 
        !prevActions.includes(action) && action !== ActionTypes.NONE);
      
      // 削除された操作（前にあって今なくなったもの）
      const removedActions = prevActions.filter(action => 
        !actions.includes(action) && action !== ActionTypes.NONE);
      
      // 選択されたセル以降のすべてのセルに変更を適用
      for (let i = selectedIndex + 1; i < newInputs.length; i++) {
        let currentActions = [...newInputs[i]];
        
        // 削除された操作を後続のセルからも削除
        currentActions = currentActions.filter(action => 
          !removedActions.includes(action));
        
        // 追加された操作を後続のセルにも追加
        addedActions.forEach(action => {
          if (!currentActions.includes(action)) {
            currentActions.push(action);
          }
        });
        
        // 操作がなければNONEを設定
        if (currentActions.length === 0) {
          newInputs[i] = [ActionTypes.NONE];
        } else {
          // NONEを除外して設定
          newInputs[i] = currentActions.filter(action => action !== ActionTypes.NONE);
          if (newInputs[i].length === 0) {
            newInputs[i] = [ActionTypes.NONE];
          }
        }
      }
    }
    
    onChange(newInputs);
  };
  
  // タイムラインのセルを選択
  const handleSelectCell = (index: number) => {
    setSelectedIndex(index);
  };
  
  // 拍子間隔が変更された時に選択インデックスをリセット
  useEffect(() => {
    setSelectedIndex(0);
  }, [beatInterval]);
  
  // 現在選択されているセルのアクション
  const selectedActions = inputs[selectedIndex] || [ActionTypes.NONE];
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">入力設定</h3>
        
        {/* 拍子間隔切り替え */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">入力間隔:</span>
          <div className="flex bg-gray-100 rounded-md shadow-sm">
            <button
              className={`px-3 py-1 text-sm rounded-l ${
                beatInterval === 0.5
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setBeatInterval(BeatIntervals.HALF)}
            >
              0.5拍
            </button>
            <button
              className={`px-3 py-1 text-sm ${
                beatInterval === 1
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setBeatInterval(BeatIntervals.ONE)}
            >
              1拍
            </button>
            <button
              className={`px-3 py-1 text-sm rounded-r ${
                beatInterval === 2
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setBeatInterval(BeatIntervals.TWO)}
            >
              2拍
            </button>
          </div>
        </div>
      </div>
      
      {/* 継続設定トグル */}
      <div className="flex items-center mb-4">
        <input
          type="checkbox"
          id="propagateChanges"
          checked={propagateChanges}
          onChange={() => setPropagateChanges(!propagateChanges)}
          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="propagateChanges" className="text-sm text-gray-700">
          選択した操作の変更（追加/解除）をこの区間以降にも継続する
        </label>
      </div>
      
      <div className="bg-blue-50 p-3 mb-4 rounded text-sm text-blue-700">
        <p><strong>操作の仕様:</strong></p>
        <ul className="list-disc pl-5 mt-1">
          <li><strong>ストップ(Space)</strong>: 針の動きを停止します</li>
          <li><strong>クオーター(L)</strong>: 押されている間、針が+90度の位置を指します</li>
          <li><strong>ハーフ(K)</strong>: 押されている間、針が+180度の位置を指します</li>
          <li><strong>リバース(S)</strong>: 針が逆方向に回転します</li>
          <li><strong>ダブル(D)</strong>: 針の回転速度が2倍になります</li>
        </ul>
      </div>
      
      {/* ビジュアルタイムライン */}
      <VisualTimeline 
        inputs={inputs} 
        beatInterval={beatInterval} 
        onSelectCell={handleSelectCell}
        selectedIndex={selectedIndex}
      />
      
      {/* 選択された入力の詳細エディター */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center mb-2">
          <span className="text-sm font-medium text-gray-700 mr-2">
            選択中: {beatInterval === 0.5 ? 
              `${Math.floor(selectedIndex/2) + 1}拍目${selectedIndex % 2 ? '裏' : '表'}` : 
              beatInterval === 1 ? 
                `${selectedIndex + 1}拍目` : 
                `${selectedIndex * 2 + 1}-${selectedIndex * 2 + 2}拍目`}
          </span>
          <span className="text-xs text-gray-500">
            （複数の操作を同時に選択できます）
          </span>
        </div>
        
        <MultiActionSelector 
          actions={selectedActions} 
          onChange={handleActionsChange} 
        />
      </div>
    </div>
  );
};

export default InputEditor;