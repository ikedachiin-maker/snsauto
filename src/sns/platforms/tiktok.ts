/**
 * TikTok Platform Normalizer
 *
 * Apify Actor: clockworks/tiktok-scraper の出力を UnifiedPost に変換
 */

import { PlatformNormalizer } from '../types';
import {
  UnifiedPost,
  PostType,
  MediaItem,
  Engagement,
  calculateEngagementRate,
} from '../../types/unified-post';
import { randomUUID } from 'crypto';
import { toJST } from '../utils';

function extractMedia(item: any): MediaItem[] {
  const media: MediaItem[] = [];

  media.push({
    type: 'video',
    url: item.videoUrl || item.video?.playAddr || '',
    thumbnailUrl: item.coverUrl || item.video?.cover || item.thumbnail,
    width: item.video?.width,
    height: item.video?.height,
    duration: item.videoDuration || item.video?.duration,
  });

  return media;
}

function extractHashtags(item: any): string[] {
  if (item.hashtags?.length) {
    return item.hashtags.map((h: any) => typeof h === 'string' ? h : h.name || h.title || '');
  }
  const text = item.text || item.desc || '';
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function extractMentions(item: any): string[] {
  if (item.mentions?.length) return item.mentions;
  const text = item.text || item.desc || '';
  const matches = text.match(/@[\w.]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function buildEngagement(item: any): Engagement {
  const likes = item.diggCount ?? item.likes ?? item.stats?.diggCount ?? 0;
  const shares = item.shareCount ?? item.shares ?? item.stats?.shareCount ?? 0;
  const comments = item.commentCount ?? item.comments ?? item.stats?.commentCount ?? 0;
  const views = item.playCount ?? item.views ?? item.stats?.playCount ?? 0;
  const saves = item.collectCount ?? item.saves ?? item.stats?.collectCount ?? 0;
  const followers = item.authorMeta?.fans ?? item.author?.followerCount ?? 0;

  return {
    likes,
    shares,
    comments,
    views,
    engagementRate: calculateEngagementRate({ likes, comments, shares, saves }, followers),
    saves,
  };
}

function detectPostType(item: any): PostType {
  const duration = item.videoDuration || item.video?.duration;
  if (duration && duration <= 60) return 'short';
  return 'video';
}

export const tiktokNormalizer: PlatformNormalizer = {
  platform: 'tiktok',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'tiktok' as const,
        platformPostId: String(item.id || item.videoId || ''),
        author: {
          username: item.authorMeta?.name || item.author?.uniqueId || '',
          displayName: item.authorMeta?.nickName || item.author?.nickname || '',
          followers: item.authorMeta?.fans || item.author?.followerCount || 0,
          verified: item.authorMeta?.verified || item.author?.verified || false,
          profileUrl: `https://www.tiktok.com/@${item.authorMeta?.name || item.author?.uniqueId || ''}`,
        },
        content: {
          text: item.text || item.desc || '',
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: extractMentions(item),
          urls: [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.createTime || item.createTimeISO || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.webVideoUrl || `https://www.tiktok.com/@${item.authorMeta?.name || ''}/video/${item.id || ''}`,
        },
      }));
  },
};
