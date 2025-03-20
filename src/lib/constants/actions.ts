// 操作タイプの定義
export const ActionTypes = {
  NONE: "none",
  STOP: "stop",
  QUARTER: "quarter",
  HALF: "half",
  REVERSE: "reverse",
  DOUBLE: "double",
} as const;

export type ActionType = (typeof ActionTypes)[keyof typeof ActionTypes];

// 操作タイプの色
export const ActionColors = {
  [ActionTypes.NONE]: "#d1d5db",
  [ActionTypes.STOP]: "#ef4444",
  [ActionTypes.QUARTER]: "#3b82f6",
  [ActionTypes.HALF]: "#8b5cf6",
  [ActionTypes.REVERSE]: "#10b981",
  [ActionTypes.DOUBLE]: "#f59e0b",
};

// アイコン名（Lucide React）
export const ActionIconNames = {
  [ActionTypes.NONE]: "ChevronRight",
  [ActionTypes.STOP]: "Pause",
  [ActionTypes.QUARTER]: "Clock3",
  [ActionTypes.HALF]: "Clock12",
  [ActionTypes.REVERSE]: "RotateCcw",
  [ActionTypes.DOUBLE]: "Play",
};

export const ActionLabels = {
  [ActionTypes.NONE]: "なし",
  [ActionTypes.STOP]: "ストップ(Space)",
  [ActionTypes.QUARTER]: "クオーター(L)",
  [ActionTypes.HALF]: "ハーフ(K)",
  [ActionTypes.REVERSE]: "リバース(S)",
  [ActionTypes.DOUBLE]: "ダブル(D)",
};

// 拍子間隔の定義
export const BeatIntervals = {
  HALF: 0.5,
  ONE: 1,
  TWO: 2,
} as const;

export type BeatInterval = (typeof BeatIntervals)[keyof typeof BeatIntervals];
