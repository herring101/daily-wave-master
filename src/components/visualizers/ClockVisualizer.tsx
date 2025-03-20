'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import { ActionType, ActionTypes, ActionColors } from '@/lib/constants/actions';

export interface ClockVisualizerRef {
  updateAngle: (newAngle: number, newActions: ActionType[]) => void;
  startAnimation: () => void;
}

interface ClockVisualizerProps {
  angle?: number;
  actions?: ActionType[];
  angles?: number[];
  frameActions?: ActionType[][];
  animationSpeed?: number;
  onAnimationProgress?: (progress: number, frame: number) => void;
  onAnimationComplete?: () => void;
}

const ClockVisualizer = forwardRef<ClockVisualizerRef, ClockVisualizerProps>(({ 
  angle = 0, 
  actions = [],
  angles = [],
  frameActions = [],
  animationSpeed = 1,
  onAnimationProgress = null,
  onAnimationComplete = null
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentFrameRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
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
  
  // 時計の描画関数
  const drawClock = useCallback((angle: number, currentActions: ActionType[]) => {
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
    
    if (currentActions && currentActions.length > 0) {
      if (currentActions.includes(ActionTypes.STOP)) {
        needleColor = ActionColors[ActionTypes.STOP];
      } else if (currentActions.includes(ActionTypes.QUARTER)) {
        needleColor = ActionColors[ActionTypes.QUARTER];
      } else if (currentActions.includes(ActionTypes.HALF)) {
        needleColor = ActionColors[ActionTypes.HALF];
      } else if (currentActions.includes(ActionTypes.REVERSE)) {
        needleColor = ActionColors[ActionTypes.REVERSE];
      } else if (currentActions.includes(ActionTypes.DOUBLE)) {
        needleColor = ActionColors[ActionTypes.DOUBLE];
      }
    }
    
    // 針を描画
    // 波形生成と同じロジックで角度を計算
    let finalAngle = angle;
    
    // クオーター操作（-90度）- 固定オフセット
    if (currentActions.includes(ActionTypes.QUARTER)) {
      finalAngle -= 90; // -90度（時計回りに90度）
    }
    
    // ハーフ操作（+180度）- 固定オフセット
    if (currentActions.includes(ActionTypes.HALF)) {
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
    if (currentActions && currentActions.length > 0 && currentActions[0] !== ActionTypes.NONE) {
      currentActions.forEach((action, idx) => {
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
  }, []);

  // アニメーション関数
  const animateClock = useCallback(() => {
    if (!canvasRef.current || !isAnimating || angles.length === 0) return;
    
    // 次のフレームへ進む
    const totalFrames = angles.length;
    const framesPerStep = Math.max(1, Math.floor(totalFrames / (120 / animationSpeed)));
    currentFrameRef.current = Math.min(currentFrameRef.current + framesPerStep, totalFrames);
    const currentFrame = currentFrameRef.current;
    
    // 現在のフレームの角度とアクションを取得
    const currentAngle = currentFrame > 0 ? angles[currentFrame - 1] : 0;
    const currentActions = currentFrame > 0 && frameActions[currentFrame - 1] ? 
                          frameActions[currentFrame - 1] : 
                          [ActionTypes.NONE];
    
    // 時計を描画
    drawClock(currentAngle, currentActions);
    
    // アニメーションの進行状況を通知
    if (onAnimationProgress) {
      onAnimationProgress(currentFrame / totalFrames, currentFrame);
    }
    
    // アニメーション継続判定
    if (currentFrame < totalFrames) {
      animationRef.current = requestAnimationFrame(animateClock);
    } else {
      // アニメーション完了
      setIsAnimating(false);
      
      // 完了コールバック
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
  }, [angles, frameActions, isAnimating, animationSpeed, drawClock, onAnimationProgress, onAnimationComplete]);

  // isAnimating が変更されたときにアニメーションを開始/停止
  useEffect(() => {
    if (isAnimating) {
      animateClock();
    }
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, animateClock]);
  
  // 通常の描画（アニメーションなし）
  useEffect(() => {
    if (!isAnimating && canvasRef.current) {
      drawClock(angle, actions);
    }
  }, [angle, actions, isAnimating, drawClock]);

  // 公開メソッド（角度の即時更新、アニメーション制御など）
  useImperativeHandle(ref, () => ({
    updateAngle: (newAngle: number, newActions: ActionType[]) => {
      if (!canvasRef.current || isAnimating) return;
      drawClock(newAngle, newActions);
    },
    startAnimation: () => {
      // 既存のアニメーションを停止
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      currentFrameRef.current = 0; // フレームをリセット
      setIsAnimating(true);
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