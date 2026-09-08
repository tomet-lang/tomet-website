/**
 * Documentation sections in navigation display order.
 */
export const SECTIONS = [
  { dir: 'guide', label: 'ガイド', blurb: '書き方を順に追う' },
  { dir: 'spec', label: '仕様', blurb: '文法と組み込み要素の定義' },
  { dir: 'examples', label: '実例', blurb: '実際の .tmt 文書' },
  { dir: 'why', label: '設計の理由', blurb: 'なぜこの形なのか' },
] as const;

export interface DocEntry {
  slug: string;
  section: string;
  sourcePath: string;
}
