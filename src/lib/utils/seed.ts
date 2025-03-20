// 今日の日付から問題シードを生成
export const getTodaysSeed = () => {
  const today = new Date();
  return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
};

// シード付き乱数生成器
export class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hash(seed) % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  // 文字列をハッシュ値に変換
  private hash(str: string): number {
    return Array.from(str).reduce((hash, char) => {
      return (hash << 5) - hash + char.charCodeAt(0);
    }, 0);
  }

  // 次の乱数を取得
  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }

  // 範囲内の整数を取得
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // 配列からランダムに要素を選択
  choose<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  // 配列の要素をシャッフル
  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}
