'use client';

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';

export interface WaveVisualizerRef {
  startAnimation: () => void;
}

interface WaveVisualizerProps {
  waveform: number[];
  color?: string;
  compareWaveform?: number[] | null;
  showComparison?: boolean;
  gridLines?: boolean;
  animationSpeed?: number;
  onAnimationProgress?: (progress: number, frame: number) => void;
  onAnimationComplete?: () => void;
}

const WaveVisualizer = forwardRef<WaveVisualizerRef, WaveVisualizerProps>(({ 
  waveform, 
  color = '#06b6d4',
  compareWaveform = null,
  showComparison = false,
  gridLines = true,
  animationSpeed = 1,
  onAnimationProgress = null,
  onAnimationComplete = null
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const currentFrameRef = useRef<number>(0); // アニメーションフレームをrefで管理
  
  // アニメーション実行フラグ
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 外部から参照可能なメソッド
  useImperativeHandle(ref, () => ({
    startAnimation: () => {
      // 既存のアニメーションを停止
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      currentFrameRef.current = 0; // フレームをリセット
      setIsAnimating(true);
      
      // アニメーションを開始（次のレンダリングサイクルで）
      requestAnimationFrame(() => animateWave());
    }
  }));
  
  // 波形アニメーション関数
  const animateWave = useCallback(() => {
    if (!canvasRef.current || !waveform || waveform.length === 0 || !isAnimating) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { width, height } = canvas;
    
    const totalFrames = waveform.length;
    const framesPerStep = Math.max(1, Math.floor(totalFrames / (120 / animationSpeed)));
    
    // 次のフレームへ進む（refを使用）
    currentFrameRef.current = Math.min(currentFrameRef.current + framesPerStep, totalFrames);
    const currentFrame = currentFrameRef.current;
    
    // キャンバスをクリア
    ctx.clearRect(0, 0, width, height);
    
    // グリッドを描画
    if (gridLines) {
      drawGridLines(ctx, width, height);
    }
    
    // 波形を描画（現在のフレームまで）
    drawWaveform(ctx, width, height, waveform, color, 3, currentFrame);
    
    // 針先の円を描画
    if (currentFrame > 0 && currentFrame < totalFrames) {
      const x = (currentFrame - 1) / waveform.length * width;
      const y = height / 2 - waveform[currentFrame - 1] * height / 4;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // アニメーション進捗コールバック
    if (onAnimationProgress) {
      onAnimationProgress(currentFrame / totalFrames, currentFrame);
    }
    
    // アニメーション継続判定
    if (currentFrame < totalFrames) {
      animationRef.current = requestAnimationFrame(animateWave);
    } else {
      // アニメーション完了
      setIsAnimating(false);
      
      // 比較波形の表示
      if (showComparison && compareWaveform && compareWaveform.length > 0) {
        drawWaveform(ctx, width, height, compareWaveform, 'rgba(100, 100, 100, 0.3)', 2);
        
        if (waveform.length === compareWaveform.length) {
          highlightDifferences(ctx, width, height, waveform, compareWaveform);
        }
      }
      
      // 完了コールバック
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }
  }, [waveform, isAnimating, gridLines, color, animationSpeed, showComparison, compareWaveform, onAnimationProgress, onAnimationComplete]);
  
  // isAnimating が変更されたときにアニメーションを開始/停止
  useEffect(() => {
    if (isAnimating && waveform && waveform.length > 0) {
      animateWave();
    }
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAnimating, waveform, animateWave]);
  

  
  // 通常の描画（アニメーションなし）
  useEffect(() => {
    if (!isAnimating && canvasRef.current && waveform && waveform.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const { width, height } = canvas;
      
      ctx.clearRect(0, 0, width, height);
      
      if (gridLines) {
        drawGridLines(ctx, width, height);
      }
      
      drawWaveform(ctx, width, height, waveform, color);
      
      if (showComparison && compareWaveform && compareWaveform.length > 0) {
        drawWaveform(ctx, width, height, compareWaveform, 'rgba(100, 100, 100, 0.3)', 2);
        
        if (waveform.length === compareWaveform.length) {
          highlightDifferences(ctx, width, height, waveform, compareWaveform);
        }
      }
    }
  }, [waveform, color, compareWaveform, showComparison, gridLines, isAnimating]);
  
  // グリッドライン描画関数
  const drawGridLines = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.3)';
    ctx.lineWidth = 1;
    
    // 垂直線（拍子）
    for (let i = 0; i <= 4; i++) {
      const x = i * (width / 4);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
      
      // 拍子番号
      if (i < 4) {
        ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${i+1}`, x + (width / 8), height - 5);
      }
    }
    
    // 水平線（中心）
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
  };
  
  // 波形描画関数
  const drawWaveform = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    waveform: number[], 
    strokeColor: string, 
    lineWidth = 3, 
    endPoint = waveform.length
  ) => {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    
    for (let i = 0; i < endPoint; i++) {
      const x = i / waveform.length * width;
      const yPos = height / 2 - waveform[i] * height / 4;
      
      if (i === 0) {
        ctx.moveTo(x, yPos);
      } else {
        ctx.lineTo(x, yPos);
      }
    }
    
    ctx.stroke();
  };
  
  // 差分の強調表示
  const highlightDifferences = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    wave1: number[], 
    wave2: number[]
  ) => {
    const threshold = 0.2;
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    
    for (let i = 0; i < wave1.length; i++) {
      const diff = Math.abs(wave1[i] - wave2[i]);
      if (diff > threshold) {
        const x = i / wave1.length * width;
        const y1 = height / 2 - wave1[i] * height / 4;
        const y2 = height / 2 - wave2[i] * height / 4;
        
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x + (width / wave1.length), y1);
        ctx.lineTo(x + (width / wave1.length), y2);
        ctx.lineTo(x, y2);
        ctx.closePath();
        ctx.fill();
      }
    }
  };
  
  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={200}
      className="w-full h-full"
    />
  );
});

WaveVisualizer.displayName = 'WaveVisualizer';

export default WaveVisualizer;