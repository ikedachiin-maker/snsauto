/**
 * Facebook Platform Normalizer
 *
 * Apify Actor: apify/facebook-posts-scraper の出力を UnifiedPost に変換
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

  if (item.photoUrl || item.imageUrl) {
    media.push({
      type: 'image',
      url: item.photoUrl || item.imageUrl || '',
      thumbnailUrl: item.thumbnailUrl,
    });
  }

  if (item.videoUrl) {
    media.push({
      type: 'video',
      url: item.videoUrl,
      thumbnailUrl: item.thumbnailUrl || item.photoUrl,
      duration: item.videoDuration,
    });
  }

  if (item.photos?.length) {
    for (const photo of item.photos) {
      media.push({
        type: 'image',
        url: typeof photo === 'string' ? photo : photo.url || '',
      });
    }
  }

  return media;
}

function extractHashtags(item: any): string[] {
  const text = item.text || item.message || '';
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function buildEngagement(item: any): Engagement {
  const likes = item.likesCount ?? item.reactions ?? item.likes ?? 0;
  const shares = item.sharesCount ?? item.shares ?? 0;
  const comments = item.commentsCount ?? item.comments ?? 0;
  const views = item.videoViewCount ?? item.views ?? 0;
  const saves = 0;
  const followers = item.pageFollowers ?? 0;

  return {
    likes,
    shares,
    comments,
    views,
    engagementRate: calculateEngagementRate({ likes, comments, shares, saves }, followers),
    saves,
    reactions: item.reactionCounts || undefined,
  };
}

function detectPostType(item: any): PostType {
  if (item.videoUrl) return 'video';
  if (item.photos?.length > 1) return 'carousel';
  if (item.photoUrl || item.imageUrl) return 'image';
  if (item.type === 'link' || item.link) return 'article';
  return 'text';
}

export const facebookNormalizer: PlatformNormalizer = {
  platform: 'facebook',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'facebook' as const,
        platformPostId: String(item.postId || item.id || ''),
        author: {
          username: item.pageName || item.user?.name || '',
          displayName: item.pageName || item.user?.name || '',
          followers: item.pageFollowers || 0,
          verified: item.isVerified || false,
          profileUrl: item.pageUrl || item.user?.url || '',
        },
        content: {
          text: item.text || item.message || '',
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: [],
          urls: item.link ? [item.link] : [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.time || item.timestamp || item.date || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.postUrl || item.url || '',
          isSponsored: item.isSponsored || false,
          isPinned: item.isPinned || false,
        },
      }));
  },
};
