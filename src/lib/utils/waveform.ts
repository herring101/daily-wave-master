import {
  ActionType,
  ActionTypes,
  BeatInterval,
  BeatIntervals,
} from "../constants/actions";
import { SeededRandom } from "./seed";

export type ActionArray = ActionType[];

// 波形生成アルゴリズム
export const generateWaveform = (
  inputs: ActionArray[],
  beatInterval: BeatInterval,
  resolution = 200
) => {
  // 1小節の拍数
  const totalBeats = 4;

  // 波形のポイント数
  const waveform = new Array(resolution).fill(0);

  // 初期角度と角速度
  let angle = 0;
  const baseAngularVelocity = (2 * Math.PI) / resolution;

  // 前回の入力インデックス
  let lastInputIndex = -1;

  // 各時点での角度と角速度を計算
  for (let i = 0; i < resolution; i++) {
    // 現在の拍位置（0～4）
    const currentBeat = (i / resolution) * totalBeats;

    // 入力配列のインデックス
    const inputIndex = Math.min(
      Math.floor(currentBeat / beatInterval),
      inputs.length - 1
    );

    // 現在の操作（複数可能）
    const currentActions = inputs[inputIndex] || [ActionTypes.NONE];

    // 区間が変わった時、前の区間の影響をリセット
    if (inputIndex !== lastInputIndex) {
      lastInputIndex = inputIndex;
    }

    // 基本の角速度
    let angularVelocity = baseAngularVelocity;

    // 1. ストップ操作
    if (currentActions.includes(ActionTypes.STOP)) {
      angularVelocity = 0; // 停止
    } else {
      // 2. リバース操作
      if (currentActions.includes(ActionTypes.REVERSE)) {
        angularVelocity = -baseAngularVelocity; // 逆方向
      }

      // 3. ダブル操作
      if (currentActions.includes(ActionTypes.DOUBLE)) {
        angularVelocity *= 2; // 倍速
      }
    }

    // 角度を更新
    angle += angularVelocity;

    // 計算された角度をベースに
    let finalAngle = angle;

    // 4. クオーター操作（+90度）- 固定オフセット
    if (currentActions.includes(ActionTypes.QUARTER)) {
      finalAngle += Math.PI / 2;
    }

    // 5. ハーフ操作（+180度）- 固定オフセット
    if (currentActions.includes(ActionTypes.HALF)) {
      finalAngle += Math.PI;
    }

    // 波形に正弦値を設定（クオーター/ハーフの一時的なオフセットを適用した角度）
    waveform[i] = Math.sin(finalAngle);
  }

  return waveform;
};

// 波形の一致度を計算する関数
export const calculateWaveformMatch = (wave1: number[], wave2: number[]) => {
  if (wave1.length !== wave2.length) return 0;

  let totalDifference = 0;

  for (let i = 0; i < wave1.length; i++) {
    totalDifference += Math.abs(wave1[i] - wave2[i]);
  }

  // 平均差分を計算し、一致度（0～100%）に変換
  const avgDifference = totalDifference / wave1.length;
  const matchPercentage = Math.max(0, 100 - avgDifference * 50);

  return matchPercentage;
};

export interface TargetData {
  inputs: ActionArray[];
  beatInterval: BeatInterval;
  waveform: number[];
}

// 目標波形を生成する関数（レベルに応じた複雑さ）
export const generateTargetWaveform = (
  level: number,
  seed: string
): TargetData => {
  // レベルに基づいて入力パターンを生成
  const patternLength =
    {
      1: 2, // 2拍ごと、1-3回の入力
      2: 2, // 2拍ごと、3-5回の入力
      3: 4, // 1拍ごと、3-5回の入力
      4: 4, // 1拍ごと、5-7回の入力
      5: 8, // 0.5拍ごと、5-9回の入力
    }[level] || 2;

  // シードをレベルごとに変える（シードに接尾辞を追加）
  const levelSeed = seed + "-level" + level;

  // 乱数生成器をインスタンス化
  const random = new SeededRandom(levelSeed);

  // レベルに応じた「押す・離す」操作回数の範囲
  const operationRanges = {
    1: [2, 4], // 1-2セットの操作（各セットは「押す+離す」で2回）
    2: [4, 8], // 2-4セットの操作
    3: [6, 10], // 3-5セットの操作
    4: [8, 14], // 4-7セットの操作
    5: [10, 18], // 5-9セットの操作
  };

  // 拍子間隔の設定
  const beatInterval =
    level <= 2
      ? BeatIntervals.TWO
      : level <= 4
      ? BeatIntervals.ONE
      : BeatIntervals.HALF;

  // レベルに応じた配置可能なアクションを制限
  let availableActions: ActionType[];
  switch (level) {
    case 1: // レベル1: 基本的な操作のみ
      availableActions = [
        ActionTypes.STOP,
        ActionTypes.QUARTER,
        ActionTypes.HALF,
      ];
      break;
    case 2: // レベル2: 基本操作 + リバース
      availableActions = [
        ActionTypes.STOP,
        ActionTypes.QUARTER,
        ActionTypes.HALF,
        ActionTypes.REVERSE,
      ];
      break;
    case 3: // レベル3: すべての操作を使用（シンプルな組み合わせ）
      availableActions = Object.values(ActionTypes).filter(
        (type) => type !== ActionTypes.NONE
      ) as ActionType[];
      break;
    case 4: // レベル4: すべての操作で複雑な組み合わせ
      availableActions = Object.values(ActionTypes).filter(
        (type) => type !== ActionTypes.NONE
      ) as ActionType[];
      break;
    case 5: // レベル5: 高度な組み合わせ（複数操作の同時使用）
      availableActions = Object.values(ActionTypes).filter(
        (type) => type !== ActionTypes.NONE
      ) as ActionType[];
      break;
    default:
      availableActions = Object.values(ActionTypes).filter(
        (type) => type !== ActionTypes.NONE
      ) as ActionType[];
  }

  // 新しい問題生成アルゴリズム（「押す・離す」の概念を明示的に扱う）
  const generateProblem = (
    length: number,
    minOperations: number,
    maxOperations: number
  ): ActionArray[] => {
    // 初期状態はすべてNONE
    const inputs: ActionArray[] = Array(length)
      .fill(undefined)
      .map(() => [ActionTypes.NONE]);

    // 必要な操作回数を決定（押す・離すの両方を含む）
    const targetOperations = random.nextInt(minOperations, maxOperations);

    // 各操作タイプが何回使われるかをランダムに決定
    const operationCount = Math.ceil(targetOperations / 2); // 「押す・離す」で1セット

    // 使用する操作リスト（複数の同じ操作も含む）
    let operationsToUse: ActionArray[] = [];
    for (let i = 0; i < operationCount; i++) {
      // レベルに応じた複雑さ（複数操作の同時使用確率）
      const useMultipleActions = random.next() < level * 0.1;

      if (useMultipleActions && level >= 3) {
        // 複数操作をランダムに選択（1つまたは2つ）
        const numActions = random.nextInt(
          2,
          Math.min(3, availableActions.length)
        );
        const selectedActions = random
          .shuffle(availableActions)
          .slice(0, numActions);
        operationsToUse.push(selectedActions);
      } else {
        // 単一操作
        operationsToUse.push([random.choose(availableActions)]);
      }
    }

    // 操作をシャッフル
    operationsToUse = random.shuffle(operationsToUse);

    // 操作の配置可能な位置を決定
    const availablePositions = Array.from({ length }, (_, i) => i);

    // 現在の区間ごとの状態を保持
    const currentState: ActionType[][] = Array(length)
      .fill(undefined)
      .map(() => []);

    // 各操作を配置（押す・離す）
    for (const operation of operationsToUse) {
      // 押すタイミングをランダムに選択
      const startIdx = random.nextInt(
        0,
        Math.max(0, availablePositions.length - 2)
      );
      const startPos = availablePositions[startIdx];

      // 継続時間を決定（最低1区間、最大は残りの区間数）
      const maxDuration = Math.min(3, length - startPos);
      const duration = random.nextInt(1, maxDuration);

      // 押している間、操作を適用
      for (let i = 0; i < duration; i++) {
        const pos = startPos + i;
        if (pos < length) {
          // 現在の区間に操作を追加
          for (const action of operation) {
            if (!currentState[pos].includes(action)) {
              currentState[pos].push(action);
            }
          }
        }
      }
    }

    // 最終的な入力配列に変換
    for (let i = 0; i < length; i++) {
      // NONEの場合は[ActionTypes.NONE]を設定
      inputs[i] =
        currentState[i].length > 0 ? currentState[i] : [ActionTypes.NONE];
    }

    return inputs;
  };

  // 問題生成
  const minOps =
    operationRanges[level as keyof typeof operationRanges]?.[0] || 2;
  const maxOps =
    operationRanges[level as keyof typeof operationRanges]?.[1] || 4;
  const randomInputs = generateProblem(patternLength, minOps, maxOps);

  // 入力から波形を生成
  return {
    inputs: randomInputs,
    beatInterval: beatInterval,
    waveform: generateWaveform(randomInputs, beatInterval),
  };
};
