/**
 * Threads Platform Normalizer
 *
 * Apify Actor: red.cars/threads-scraper の出力を UnifiedPost に変換
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

  if (item.imageUrls?.length) {
    for (const url of item.imageUrls) {
      media.push({
        type: 'image',
        url: typeof url === 'string' ? url : url.url || '',
      });
    }
  }

  if (item.videoUrl) {
    media.push({
      type: 'video',
      url: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl || item.imageUrls?.[0],
    });
  }

  if (item.carouselMedia?.length) {
    for (const m of item.carouselMedia) {
      media.push({
        type: m.videoUrl ? 'video' : 'image',
        url: m.videoUrl || m.imageUrl || '',
        thumbnailUrl: m.imageUrl,
      });
    }
  }

  return media;
}

function extractHashtags(item: any): string[] {
  const text = item.text || item.caption || '';
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function extractMentions(item: any): string[] {
  const text = item.text || item.caption || '';
  const matches = text.match(/@[\w.]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function buildEngagement(item: any): Engagement {
  const likes = item.likeCount ?? item.likes ?? 0;
  const shares = item.repostCount ?? item.reposts ?? 0;
  const comments = item.replyCount ?? item.replies ?? 0;
  const views = item.viewCount ?? 0;
  const saves = 0;
  const followers = item.user?.followerCount ?? 0;

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
  if (item.carouselMedia?.length) return 'carousel';
  if (item.videoUrl) return 'video';
  if (item.imageUrls?.length) return 'image';
  return 'text';
}

export const threadsNormalizer: PlatformNormalizer = {
  platform: 'threads',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'threads' as const,
        platformPostId: String(item.id || item.pk || item.code || ''),
        author: {
          username: item.user?.username || item.username || '',
          displayName: item.user?.fullName || item.user?.name || '',
          followers: item.user?.followerCount || 0,
          verified: item.user?.isVerified || false,
          profileUrl: `https://www.threads.net/@${item.user?.username || ''}`,
        },
        content: {
          text: item.text || item.caption || '',
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: extractMentions(item),
          urls: [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.takenAt || item.publishedAt || item.timestamp || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.url || `https://www.threads.net/@${item.user?.username || ''}/post/${item.code || ''}`,
          isReply: !!item.replyToId,
          parentPostId: item.replyToId,
        },
      }));
  },
};
