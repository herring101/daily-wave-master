'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ActionType, ActionTypes, ActionColors } from '@/lib/constants/actions';

export interface ClockVisualizerRef {
  updateAngle: (newAngle: number, newActions: ActionType[]) => void;
}

interface ClockVisualizerProps {
  angle?: number;
  actions?: ActionType[];
}

const ClockVisualizer = forwardRef<ClockVisualizerRef, ClockVisualizerProps>(({ 
  angle = 0, 
  actions = [] 
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // 針の角度を更新する
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // 円を描画
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // アクションに基づいて色を決定
    let needleColor = '#ef4444'; // デフォルトは赤
    
    // 複数のアクションがある場合の色の決定
    if (actions && actions.length > 0) {
      if (actions.includes(ActionTypes.STOP)) {
        needleColor = ActionColors[ActionTypes.STOP]; // 赤
      } else if (actions.includes(ActionTypes.QUARTER)) {
        needleColor = ActionColors[ActionTypes.QUARTER]; // 青
      } else if (actions.includes(ActionTypes.HALF)) {
        needleColor = ActionColors[ActionTypes.HALF]; // 紫
      } else if (actions.includes(ActionTypes.REVERSE)) {
        needleColor = ActionColors[ActionTypes.REVERSE]; // 緑
      } else if (actions.includes(ActionTypes.DOUBLE)) {
        needleColor = ActionColors[ActionTypes.DOUBLE]; // オレンジ
      }
    }
    
    // 針を描画
    // 波形生成と同じロジックで角度を計算
    let finalAngle = angle;
    
    // クオーター操作（-90度）- 固定オフセット
    if (actions.includes(ActionTypes.QUARTER)) {
      finalAngle -= 90; // -90度（時計回りに90度）
    }
    
    // ハーフ操作（+180度）- 固定オフセット
    if (actions.includes(ActionTypes.HALF)) {
      finalAngle += 180; // 波形生成と同じく+180度
    }
    
    const radian = finalAngle * (Math.PI / 180);
    ctx.strokeStyle = needleColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(radian) * radius,
      centerY + Math.sin(radian) * radius
    );
    ctx.stroke();
    
    // 中心点
    ctx.fillStyle = needleColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // アクションのアイコンを表示
    if (actions && actions.length > 0 && actions[0] !== ActionTypes.NONE) {
      // 複数のアクションを視覚化
      actions.forEach((action, idx) => {
        if (action !== ActionTypes.NONE) {
          const yPos = height - 15 - (idx * 18);
          const iconSize = 16;
          const iconX = width - 20;
          
          // アイコンの背景円
          ctx.fillStyle = `${ActionColors[action]}40`;
          ctx.beginPath();
          ctx.arc(iconX, yPos, iconSize / 2 + 2, 0, Math.PI * 2);
          ctx.fill();
          
          // アイコンテキスト
          ctx.fillStyle = ActionColors[action];
          ctx.font = 'bold 10px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // アクションに応じたシンボルを描画
          switch (action) {
            case ActionTypes.STOP:
              // ストップシンボル（四角）
              ctx.fillRect(iconX - 4, yPos - 4, 8, 8);
              break;
            case ActionTypes.QUARTER:
              // クオーターシンボル（90度）
              ctx.fillText("90°", iconX, yPos);
              break;
            case ActionTypes.HALF:
              // ハーフシンボル（180度）
              ctx.fillText("180°", iconX, yPos);
              break;
            case ActionTypes.REVERSE:
              // リバースシンボル（矢印）
              ctx.beginPath();
              ctx.moveTo(iconX + 5, yPos - 5);
              ctx.lineTo(iconX - 5, yPos);
              ctx.lineTo(iconX + 5, yPos + 5);
              ctx.fill();
              break;
            case ActionTypes.DOUBLE:
              // ダブルシンボル（x2）
              ctx.fillText("x2", iconX, yPos);
              break;
          }
        }
      });
    }
  }, [angle, actions]);
  
  // 公開メソッド（角度の即時更新など）
  useImperativeHandle(ref, () => ({
    updateAngle: (newAngle: number, newActions: ActionType[]) => {
      if (!canvasRef.current) return;
      
      // コンポーネント再レンダリングせずに直接キャンバスを更新
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const { width, height } = canvas;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 10;
      
      // キャンバスをクリア
      ctx.clearRect(0, 0, width, height);
      
      // 円を描画
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // アクションに基づいて色を決定
      let needleColor = '#ef4444'; // デフォルトは赤
      
      if (newActions && newActions.length > 0) {
        if (newActions.includes(ActionTypes.STOP)) {
          needleColor = ActionColors[ActionTypes.STOP];
        } else if (newActions.includes(ActionTypes.QUARTER)) {
          needleColor = ActionColors[ActionTypes.QUARTER];
        } else if (newActions.includes(ActionTypes.HALF)) {
          needleColor = ActionColors[ActionTypes.HALF];
        } else if (newActions.includes(ActionTypes.REVERSE)) {
          needleColor = ActionColors[ActionTypes.REVERSE];
        } else if (newActions.includes(ActionTypes.DOUBLE)) {
          needleColor = ActionColors[ActionTypes.DOUBLE];
        }
      }
      
      // 針を描画
      // 波形生成と同じロジックで角度を計算
      let finalAngle = newAngle;
      
      // クオーター操作（-90度）- 固定オフセット
      if (newActions.includes(ActionTypes.QUARTER)) {
        finalAngle -= 90; // -90度（時計回りに90度）
      }
      
      // ハーフ操作（+180度）- 固定オフセット
      if (newActions.includes(ActionTypes.HALF)) {
        finalAngle += 180; // 波形生成と同じく+180度
      }
      
      const radian = finalAngle * (Math.PI / 180);
      ctx.strokeStyle = needleColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(radian) * radius,
        centerY + Math.sin(radian) * radius
      );
      ctx.stroke();
      
      // 中心点
      ctx.fillStyle = needleColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
      ctx.fill();
      
      // アクションのアイコンを表示
      if (newActions && newActions.length > 0 && newActions[0] !== ActionTypes.NONE) {
        newActions.forEach((action, idx) => {
          if (action !== ActionTypes.NONE) {
            const yPos = height - 15 - (idx * 18);
            const iconSize = 16;
            const iconX = width - 20;
            
            // アイコンの背景円
            ctx.fillStyle = `${ActionColors[action]}40`;
            ctx.beginPath();
            ctx.arc(iconX, yPos, iconSize / 2 + 2, 0, Math.PI * 2);
            ctx.fill();
            
            // アイコンテキスト
            ctx.fillStyle = ActionColors[action];
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // アクションに応じたシンボルを描画
            switch (action) {
              case ActionTypes.STOP:
                ctx.fillRect(iconX - 4, yPos - 4, 8, 8);
                break;
              case ActionTypes.QUARTER:
                ctx.fillText("90°", iconX, yPos);
                break;
              case ActionTypes.HALF:
                ctx.fillText("180°", iconX, yPos);
                break;
              case ActionTypes.REVERSE:
                ctx.beginPath();
                ctx.moveTo(iconX + 5, yPos - 5);
                ctx.lineTo(iconX - 5, yPos);
                ctx.lineTo(iconX + 5, yPos + 5);
                ctx.fill();
                break;
              case ActionTypes.DOUBLE:
                ctx.fillText("x2", iconX, yPos);
                break;
            }
          }
        });
      }
    }
  }));
  
  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="w-full h-full"
    />
  );
});

ClockVisualizer.displayName = 'ClockVisualizer';

export default ClockVisualizer;