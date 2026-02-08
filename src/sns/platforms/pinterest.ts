/**
 * Pinterest Platform Normalizer
 *
 * Apify Actor: easyapi/pinterest-search-scraper の出力を UnifiedPost に変換
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

  if (item.images?.orig?.url || item.imageUrl) {
    media.push({
      type: item.isVideo ? 'video' : 'image',
      url: item.images?.orig?.url || item.imageUrl || '',
      thumbnailUrl: item.images?.['236x']?.url || item.thumbnailUrl,
      width: item.images?.orig?.width,
      height: item.images?.orig?.height,
    });
  }

  if (item.videoUrl || item.videos) {
    media.push({
      type: 'video',
      url: item.videoUrl || item.videos?.v720p?.url || '',
      thumbnailUrl: item.images?.orig?.url,
      duration: item.videoDuration,
    });
  }

  return media;
}

function buildEngagement(item: any): Engagement {
  const likes = item.reactionCounts?.like ?? item.saves ?? 0;
  const saves = item.saveCount ?? item.saves ?? 0;
  const comments = item.commentCount ?? item.comments ?? 0;
  const shares = item.repinCount ?? item.repins ?? 0;
  const views = item.viewCount ?? item.impressions ?? 0;
  const followers = item.pinner?.followerCount ?? 0;

  return {
    likes,
    shares,
    comments,
    views,
    engagementRate: calculateEngagementRate({ likes, comments, shares, saves }, followers),
    saves,
  };
}

export const pinterestNormalizer: PlatformNormalizer = {
  platform: 'pinterest',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'pinterest' as const,
        platformPostId: String(item.id || item.pinId || ''),
        author: {
          username: item.pinner?.username || item.owner?.username || '',
          displayName: item.pinner?.fullName || item.owner?.fullName || '',
          followers: item.pinner?.followerCount || 0,
          verified: item.pinner?.isVerified || false,
          profileUrl: `https://www.pinterest.com/${item.pinner?.username || ''}/`,
        },
        content: {
          text: item.description || item.title || '',
          media: extractMedia(item),
          hashtags: [],
          mentions: [],
          urls: item.link ? [item.link] : [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.createdAt || item.created_at || ''),
          collectedAt: new Date().toISOString(),
          postType: 'pin' as PostType,
          permalink: item.url || `https://www.pinterest.com/pin/${item.id || ''}/`,
        },
      }));
  },
};
