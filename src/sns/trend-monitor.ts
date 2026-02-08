/**
 * TSIS Trend Monitor
 *
 * What's Trending MCP連携によるトレンドデータの収集・正規化。
 * 35+ソースからのトレンドトピック取得、スコアリング、フィルタリング。
 */

import { TrendTopic, TrendMonitorResult } from './types';

/**
 * What's Trending MCPの生出力をTrendTopic形式に正規化
 */
export function normalizeTrendData(rawTrends: unknown[]): TrendTopic[] {
  return rawTrends
    .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
    .map((item) => ({
      title: item.title || item.name || item.topic || '',
      source: item.source || item.platform || 'unknown',
      category: item.category || item.type || undefined,
      trendScore: calculateTrendScore(item),
      url: item.url || item.link || undefined,
      relatedKeywords: extractRelatedKeywords(item),
      detectedAt: item.detectedAt || item.timestamp || new Date().toISOString(),
    }))
    .filter((topic) => topic.title.length > 0);
}

/**
 * トレンドスコア計算
 *
 * 算出基準:
 * - volume: 検索ボリューム/投稿数 (0-40点)
 * - sources: 出現ソース数 (0-30点)
 * - recency: 時間減衰 (0-30点)
 */
export function calculateTrendScore(item: any): number {
  // ボリュームスコア (0-40)
  const volume = item.volume || item.searchVolume || item.postCount || 0;
  const volumeScore = Math.min(40, Math.log10(Math.max(1, volume)) * 10);

  // ソーススコア (0-30)
  const sourceCount = item.sourceCount || item.sources?.length || 1;
  const sourceScore = Math.min(30, sourceCount * 5);

  // 時間減衰スコア (0-30)
  const detectedAt = new Date(item.detectedAt || item.timestamp || Date.now());
  const hoursAgo = (Date.now() - detectedAt.getTime()) / (1000 * 60 * 60);
  const recencyScore = Math.max(0, 30 - hoursAgo * 1.25);

  return Math.round(volumeScore + sourceScore + recencyScore);
}

/**
 * 関連キーワードを抽出
 */
function extractRelatedKeywords(item: any): string[] {
  if (item.relatedKeywords?.length) return item.relatedKeywords;
  if (item.keywords?.length) return item.keywords;
  if (item.tags?.length) return item.tags;
  if (item.relatedTopics?.length) {
    return item.relatedTopics.map((t: any) => typeof t === 'string' ? t : t.name || '');
  }
  return [];
}

/**
 * トレンドトピックをスコア順にソート
 */
export function sortByTrendScore(topics: TrendTopic[]): TrendTopic[] {
  return [...topics].sort((a, b) => b.trendScore - a.trendScore);
}

/**
 * カテゴリでフィルタ
 */
export function filterByCategory(topics: TrendTopic[], category: string): TrendTopic[] {
  return topics.filter((t) => t.category === category);
}

/**
 * トレンド結果のサマリーを生成
 */
export function buildTrendSummary(topics: TrendTopic[], sourceCount: number): TrendMonitorResult {
  return {
    topics: sortByTrendScore(topics),
    sources: sourceCount,
    collectedAt: new Date().toISOString(),
  };
}
