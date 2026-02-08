/**
 * TSIS SNS Collection - Utility Functions
 */

/**
 * タイムスタンプをJST（ISO 8601形式）に変換
 *
 * 対応フォーマット:
 * - ISO 8601文字列
 * - Unixタイムスタンプ（秒 or ミリ秒）
 * - 日付文字列（Date.parse可能な形式）
 */
export function toJST(timestamp: string | number | undefined): string {
  if (!timestamp) return new Date().toISOString();

  let date: Date;

  if (typeof timestamp === 'number') {
    // Unixタイムスタンプ: 秒の場合はミリ秒に変換
    const ms = timestamp < 1e12 ? timestamp * 1000 : timestamp;
    date = new Date(ms);
  } else {
    date = new Date(timestamp);
  }

  // Invalid date check
  if (isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
}

/**
 * テキストからURLを抽出
 */
export function extractUrlsFromText(text: string): string[] {
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g;
  return text.match(urlPattern) || [];
}

/**
 * HTMLタグを除去してプレーンテキストに変換
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

/**
 * テキストを指定文字数で切り詰め
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}
