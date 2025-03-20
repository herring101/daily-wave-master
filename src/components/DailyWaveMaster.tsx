'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Check, RefreshCw, Info, Award, ChevronRight, ChevronLeft } from 'lucide-react';
import WaveVisualizer, { WaveVisualizerRef } from '@/components/visualizers/WaveVisualizer';
import ActionIcon from '@/components/actions/ActionIcons';
import ClockVisualizer, { ClockVisualizerRef } from '@/components/visualizers/ClockVisualizer';
import InputEditor from '@/components/timeline/InputEditor';
import SuccessAnimation from '@/components/animations/SuccessAnimation';
import FailureAnimation from '@/components/animations/FailureAnimation';
import { ActionType, ActionTypes, BeatInterval, BeatIntervals, ActionColors, ActionLabels } from '@/lib/constants/actions';
import { getTodaysSeed } from '@/lib/utils/seed';
import { generateWaveform, calculateWaveformMatch, generateTargetWaveform, TargetData } from '@/lib/utils/waveform';

// 波形コンポーネントのCSSアニメーション用スタイル
const wigglyStyle = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-5deg); }
    75% { transform: rotate(5deg); }
  }
  .animate-wiggle {
    animation: wiggle 0.5s ease-in-out infinite;
  }
`;

const DailyWaveMaster: React.FC = () => {
  // 状態管理
  const [currentLevel, setCurrentLevel] = useState(1);
  const [beatInterval, setBeatInterval] = useState<BeatInterval>(BeatIntervals.TWO);
  const [inputs, setInputs] = useState<ActionType[][]>([]);
  const [generatedWaveform, setGeneratedWaveform] = useState<number[]>([]);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [targetData, setTargetData] = useState<TargetData>({ waveform: [], inputs: [], beatInterval: BeatIntervals.TWO });
  const [solvedLevels, setSolvedLevels] = useState<number[]>([]);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showFailureAnimation, setShowFailureAnimation] = useState(false);
  
  // 波形と時計の参照
  const waveVisualizerRef = useRef<WaveVisualizerRef>(null);
  const clockRef = useRef<ClockVisualizerRef>(null);
  
  // 現在のアニメーションフレームでの針の角度と操作
  const [needleAngle, setNeedleAngle] = useState(0);
  const [currentActions, setCurrentActions] = useState<ActionType[]>([]);
  
  // 今日の問題シード
  const todaySeed = getTodaysSeed();
  
  // レベルをロード
  const loadLevel = useCallback((level: number) => {
    const targetData = generateTargetWaveform(level, todaySeed);
    setTargetData(targetData);
    setBeatInterval(targetData.beatInterval);
    resetInputs(targetData.beatInterval);
    setIsSubmitted(false);
    setIsCorrect(null);
    setMatchPercentage(null);
    setShowHint(false);
    setGeneratedWaveform([]);
    setIsAnimating(false);
    setNeedleAngle(0);
    setCurrentActions([]);
  }, [todaySeed]);
  
  // 初期化と問題生成
  useEffect(() => {
    // ローカルストレージから解決済みのレベルを取得
    const saved = localStorage.getItem(`waveMaster_${todaySeed}`);
    if (saved) {
      setSolvedLevels(JSON.parse(saved));
    }
    
    loadLevel(currentLevel);
  }, [currentLevel, loadLevel, todaySeed]);
  
  // 入力配列をリセット
  const resetInputs = (interval: BeatInterval) => {
    // 4拍（1小節）に対して必要な入力数を計算
    const inputCount = Math.ceil(4 / interval);
    setInputs(Array(inputCount).fill(undefined).map(() => [ActionTypes.NONE]));
  };
  
  // 拍子間隔変更ハンドラ
  const handleBeatIntervalChange = (newInterval: BeatInterval) => {
    setBeatInterval(newInterval);
    resetInputs(newInterval);
    setIsSubmitted(false);
    setIsAnimating(false);
    setGeneratedWaveform([]);
  };
  
  // 入力変更ハンドラ
  const handleInputsChange = (newInputs: ActionType[][]) => {
    setInputs(newInputs);
    setIsSubmitted(false);
    setIsAnimating(false);
    setGeneratedWaveform([]);
  };
  
  // 提出ハンドラ
  const handleSubmit = () => {
    // 生成した波形をセット
    const waveform = generateWaveform(inputs, beatInterval);
    setGeneratedWaveform(waveform);
    
    // アニメーション状態をリセット
    setIsAnimating(true);
    setNeedleAngle(0);
    setCurrentActions([]);
    
    // 正解/不正解状態をリセット
    setIsCorrect(null);
    setMatchPercentage(null);
    setIsSubmitted(false);
    
    // 成功/失敗アニメーションをリセット
    setShowSuccessAnimation(false);
    setShowFailureAnimation(false);
    
    // 波形アニメーションを明示的に開始
    if (waveVisualizerRef.current) {
      setTimeout(() => {
        waveVisualizerRef.current?.startAnimation();
      }, 50);
    }
  };
  
  // アニメーション進行ハンドラ
  const handleAnimationProgress = (progress: number, frame: number) => {
    // 波形生成と同じロジックで針の角度を計算
    const totalFrames = generatedWaveform.length;
    const currentBeat = (frame / totalFrames) * 4; // 4拍（1小節）
    
    // 入力配列のインデックス
    const inputIndex = Math.min(
      Math.floor(currentBeat / beatInterval),
      inputs.length - 1
    );
    
    // 現在の操作を設定
    const currentActions = inputs[inputIndex] || [ActionTypes.NONE];
    setCurrentActions(currentActions);
    
    // 波形生成と全く同じロジックで角度を計算
    // 波形生成のアルゴリズムでは：
    // 1. 角速度を計算
    // 2. 角速度に基づいて角度を更新
    // 3. クオーターとハーフは最終角度に固定オフセットを追加
    
    // 基本の角速度（波形生成のbaseAngularVelocityに相当）
    // 波形生成では2π/resolutionを使用、ここでは360度系で計算
    
    // 1. ストップ操作
    if (currentActions.includes(ActionTypes.STOP)) {
      // 停止
    } else {
      // 2. リバース操作
      if (currentActions.includes(ActionTypes.REVERSE)) {
        // 逆方向
      }
      
      // 3. ダブル操作
      if (currentActions.includes(ActionTypes.DOUBLE)) {
        // 倍速
      }
    }
    
    // 波形生成と同じように角度を計算
    // 現在のフレームに基づいて角度を計算（絶対角度）
    // 1フレームあたりの基本角度 = 360度 / 総フレーム数
    // 時計回りに回転させるためにマイナスを付ける
    let angle = -1 * (frame / totalFrames) * 360;
    
    // ストップ操作の場合は角度を固定
    if (currentActions.includes(ActionTypes.STOP)) {
      // ストップの場合は前の角度を維持
      angle = needleAngle;
    } else {
      // リバース操作の場合は方向を反転
      if (currentActions.includes(ActionTypes.REVERSE)) {
        // マイナスを取ることで逆方向に
        angle = -angle;
      }
      
      // ダブル操作の場合は角度を2倍
      if (currentActions.includes(ActionTypes.DOUBLE)) {
        angle = angle * 2;
      }
    }
    
    // クオーターとハーフは固定オフセットを追加
    if (currentActions.includes(ActionTypes.QUARTER)) {
      // -90度（時計回りに90度）
    }
    
    if (currentActions.includes(ActionTypes.HALF)) {
      // +180度
    }
    
    // 針の角度を更新（ClockVisualizer の公開メソッドを使用）
    if (clockRef.current) {
      clockRef.current.updateAngle(angle % 360, currentActions);
    } else {
      // フォールバック
      setNeedleAngle(angle % 360);
    }
  };
  
  // アニメーション完了ハンドラ
  const handleAnimationComplete = () => {
    setIsAnimating(false);
    setIsSubmitted(true);
    
    // 目標波形との比較
    const match = calculateWaveformMatch(generatedWaveform, targetData.waveform);
    setMatchPercentage(match);
    
    const correct = match >= 90; // 90%以上で正解
    setIsCorrect(correct);
    
    // 成功/失敗アニメーションを表示
    if (correct) {
      setShowSuccessAnimation(true);
      
      // 正解した場合、解決済みレベルを更新
      if (!solvedLevels.includes(currentLevel)) {
        const newSolvedLevels = [...solvedLevels, currentLevel];
        setSolvedLevels(newSolvedLevels);
        localStorage.setItem(`waveMaster_${todaySeed}`, JSON.stringify(newSolvedLevels));
      }
    } else {
      setShowFailureAnimation(true);
    }
  };
  
  // アニメーション終了ハンドラ
  const handleAnimationDismiss = () => {
    setShowSuccessAnimation(false);
    setShowFailureAnimation(false);
  };
  
  // ヒントを表示
  const toggleHint = () => {
    setShowHint(!showHint);
  };
  
  // 次のレベルへ
  const goToNextLevel = () => {
    if (currentLevel < 5) {
      setCurrentLevel(currentLevel + 1);
    }
  };
  
  // 前のレベルへ
  const goToPreviousLevel = () => {
    if (currentLevel > 1) {
      setCurrentLevel(currentLevel - 1);
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* アニメーションのためのスタイル */}
      <style>{wigglyStyle}</style>
      
      {/* 成功/失敗アニメーション */}
      <SuccessAnimation 
        show={showSuccessAnimation} 
        onComplete={handleAnimationDismiss} 
      />
      <FailureAnimation 
        show={showFailureAnimation} 
        onComplete={handleAnimationDismiss}
      />
      
      {/* ヘッダー */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">DailyWaveMaster</h1>
            <p className="text-lg">リズム・ジオメトリーの日替わりパズル</p>
          </div>
          <div className="text-right">
            <p className="text-sm">{new Date().toLocaleDateString('ja-JP')}の問題</p>
            <p className="text-sm">解決済み: {solvedLevels.length}/5</p>
          </div>
        </div>
      </header>
      
      {/* メインコンテンツ */}
      <main className="container mx-auto p-4 flex-grow">
        {/* レベル選択 */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPreviousLevel}
            disabled={currentLevel === 1}
            className={`p-2 rounded ${
              currentLevel === 1 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex space-x-2 bg-white rounded-lg shadow-md p-2">
            {[1, 2, 3, 4, 5].map(level => (
              <button
                key={level}
                className={`w-12 h-12 flex items-center justify-center rounded-md ${
                  currentLevel === level
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${
                  solvedLevels.includes(level) ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setCurrentLevel(level)}
              >
                <div className="flex flex-col items-center">
                  <span className="font-bold">{level}</span>
                  {solvedLevels.includes(level) && (
                    <Award className="w-3 h-3 text-green-500" />
                  )}
                </div>
              </button>
            ))}
          </div>
          
          <button
            onClick={goToNextLevel}
            disabled={currentLevel === 5}
            className={`p-2 rounded ${
              currentLevel === 5 ? 'text-gray-400' : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        {/* 問題説明 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold mb-2">
                Level {currentLevel}: {
                  {
                    1: 'シンプルなパターンから始めましょう',
                    2: 'もう少し複雑なパターンに挑戦',
                    3: '1拍ごとの入力に挑戦',
                    4: '複雑な1拍パターンに挑戦',
                    5: '0.5拍の達人になろう'
                  }[currentLevel]
                }
              </h2>
              <p className="text-gray-600">
                {beatInterval === BeatIntervals.HALF ? '0.5拍' : beatInterval === BeatIntervals.ONE ? '1拍' : '2拍'}
                ごとの入力で、目標の波形を作成してください。
                想定入力回数: 約{
                  {
                    1: '1～3',
                    2: '3～5',
                    3: '3～5',
                    4: '5～7',
                    5: '5～9'
                  }[currentLevel]
                }回
              </p>
            </div>
            
            <button
              onClick={toggleHint}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <Info className="w-4 h-4 mr-1" />
              {showHint ? 'ヒントを隠す' : 'ヒントを表示'}
            </button>
          </div>
          
          {/* ヒント表示 */}
          {showHint && (
            <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
              <p className="font-medium text-blue-800 mb-2">ヒント:</p>
              <ul className="list-disc pl-5 space-y-1 text-blue-700">
                <li>ストップ(Space): 波形の変化を一時停止させます</li>
                <li>クオーター(L): 波形の位相を90度シフトさせます</li>
                <li>ハーフ(K): 波形の位相を180度シフトさせます</li>
                <li>リバース(S): 波形の進行方向を反転させます</li>
                <li>ダブル(D): 波形の変化速度を2倍にします</li>
                <li>複数の操作を組み合わせることも可能です</li>
              </ul>
            </div>
          )}
        </div>
        
        {/* 波形表示エリア - 修正されたレイアウト */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* 目標波形 */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">目標波形</h3>
            <div className="relative h-48 border border-gray-200 rounded bg-gray-50">
              <WaveVisualizer 
                waveform={targetData.waveform} 
                color="#ff9500"
                gridLines={true}
              />
            </div>
          </div>
          
          {/* 右側カラム: 時計ビジュアライザー */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">針の動き</h3>
            <div className="flex justify-center items-center h-48">
              <div className="w-32 h-32">
                <ClockVisualizer 
                  ref={clockRef}
                  angle={needleAngle} 
                  actions={currentActions}
                />
              </div>
            </div>
          </div>
          
          {/* ユーザー波形 - 2列使用して下に配置 */}
          <div className="col-span-2 bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">あなたの波形</h3>
              {isSubmitted && matchPercentage !== null && (
                <div className={`text-sm font-medium ${
                  isCorrect ? 'text-green-600' : 'text-orange-600'
                }`}>
                  一致率: {Math.round(matchPercentage)}%
                </div>
              )}
            </div>
            
            <div className="relative h-48 border border-gray-200 rounded bg-gray-50">
              <WaveVisualizer 
                ref={waveVisualizerRef}
                waveform={generatedWaveform} 
                color="#06b6d4"
                compareWaveform={isSubmitted ? targetData.waveform : null}
                showComparison={isSubmitted && !isAnimating}
                gridLines={true}
                animationSpeed={1.0} 
                onAnimationProgress={handleAnimationProgress}
                onAnimationComplete={handleAnimationComplete}
              />
              
              {!isSubmitted && !isAnimating && generatedWaveform.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
                  <p className="text-gray-500">「提出」ボタンを押して波形を生成</p>
                </div>
              )}
            </div>
          </div>
          
          {/* アニメーション中の操作説明 */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold mb-2">現在の操作</h3>
            <div className="h-48 flex flex-col justify-center items-center">
              {isAnimating ? (
                <div className="text-center">
                  <div className="mb-2">
                    {currentActions && currentActions.length > 0 && currentActions[0] !== ActionTypes.NONE ? (
                      <div className="space-y-2">
                        {currentActions.map((action, idx) => (
                          <div 
                            key={idx}
                            className="inline-flex items-center px-3 py-1 rounded-full mr-1 mb-1"
                            style={{ backgroundColor: `${ActionColors[action]}20`, color: ActionColors[action] }}
                          >
                            <ActionIcon action={action} />
                            <span className="ml-1 text-sm">{ActionLabels[action].split('(')[0]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500">何も適用されていません</div>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 mt-4">
                    波形生成中...
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">
                  {isSubmitted ? "生成完了" : "波形生成前"}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* フィードバック表示 */}
        {isSubmitted && !isAnimating && (
          <div className={`mb-6 p-4 rounded-lg ${
            isCorrect ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
          }`}>
            <div className="flex items-center">
              {isCorrect ? (
                <>
                  <Check className="w-6 h-6 mr-2" />
                  <div>
                    <p className="font-medium">正解です！素晴らしい波形制御です。</p>
                    {currentLevel < 5 && (
                      <button 
                        className="mt-2 text-sm text-green-700 hover:text-green-900 underline"
                        onClick={goToNextLevel}
                      >
                        次のレベルに進む
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <RefreshCw className="w-6 h-6 mr-2" />
                  <p className="font-medium">
                    もう一度挑戦してみましょう。波形が目標と一致していません。
                    {matchPercentage && matchPercentage < 50 ? ' かなり差があります。' : ' もう少しです！'}
                  </p>
                </>
              )}
            </div>
          </div>
        )}
        
        {/* 入力エディタ */}
        <InputEditor 
          inputs={inputs} 
          onChange={handleInputsChange}
          beatInterval={beatInterval}
          setBeatInterval={handleBeatIntervalChange}
        />
        
        {/* 提出ボタン */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleSubmit}
            disabled={isAnimating}
            className={`flex items-center px-6 py-3 ${
              isAnimating 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
          >
            <Play className="w-5 h-5 mr-2" />
            {isAnimating ? '生成中...' : '波形を生成して提出'}
          </button>
        </div>
      </main>
      
      {/* フッター */}
      <footer className="bg-gray-800 text-white p-4 mt-8">
        <div className="container mx-auto text-center">
          <p> 2025 DailyWaveMaster - リズム・ジオメトリー公式練習サイト</p>
          <p className="text-sm text-gray-400 mt-1">
            毎日新しいパズルが登場します。また明日も挑戦してください！
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DailyWaveMaster;