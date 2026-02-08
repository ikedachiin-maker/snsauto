/**
 * Instagram Platform Normalizer
 *
 * Apify Actor: apify/instagram-scraper の出力を UnifiedPost に変換
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

  if (item.displayUrl || item.imageUrl) {
    media.push({
      type: item.type === 'Video' || item.videoUrl ? 'video' : 'image',
      url: item.videoUrl || item.displayUrl || item.imageUrl || '',
      thumbnailUrl: item.displayUrl || item.thumbnailUrl,
      width: item.dimensionsWidth || item.dimensions?.width,
      height: item.dimensionsHeight || item.dimensions?.height,
      duration: item.videoDuration,
    });
  }

  // Carousel children
  if (item.childPosts?.length) {
    for (const child of item.childPosts) {
      media.push({
        type: child.type === 'Video' ? 'video' : 'image',
        url: child.videoUrl || child.displayUrl || '',
        thumbnailUrl: child.displayUrl,
      });
    }
  }

  // Sidecar edges (alternative format)
  if (item.sidecarEdges?.length) {
    for (const edge of item.sidecarEdges) {
      media.push({
        type: edge.is_video ? 'video' : 'image',
        url: edge.video_url || edge.display_url || '',
        thumbnailUrl: edge.display_url,
      });
    }
  }

  return media;
}

function extractHashtags(item: any): string[] {
  if (item.hashtags?.length) return item.hashtags;
  const text = item.caption || '';
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function extractMentions(item: any): string[] {
  if (item.mentions?.length) return item.mentions;
  const text = item.caption || '';
  const matches = text.match(/@[\w.]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function buildEngagement(item: any): Engagement {
  const likes = item.likesCount ?? item.likes ?? 0;
  const comments = item.commentsCount ?? item.comments ?? 0;
  const views = item.videoViewCount ?? item.videoPlayCount ?? item.views ?? 0;
  const shares = item.sharesCount ?? 0;
  const saves = item.savesCount ?? 0;
  const followers = item.ownerFollowerCount ?? item.owner?.followers ?? 0;

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
  if (item.type === 'Sidecar' || item.childPosts?.length || item.productType === 'carousel_container') return 'carousel';
  if (item.type === 'Video' || item.productType === 'clips') return 'reel';
  if (item.isStory || item.productType === 'story') return 'story';
  if (item.videoUrl) return 'video';
  return 'image';
}

export const instagramNormalizer: PlatformNormalizer = {
  platform: 'instagram',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'instagram' as const,
        platformPostId: String(item.id || item.pk || item.shortCode || ''),
        author: {
          username: item.ownerUsername || item.owner?.username || '',
          displayName: item.ownerFullName || item.owner?.full_name || '',
          followers: item.ownerFollowerCount || item.owner?.followers || 0,
          verified: item.ownerIsVerified || item.owner?.is_verified || false,
          profileUrl: `https://www.instagram.com/${item.ownerUsername || item.owner?.username || ''}/`,
        },
        content: {
          text: item.caption || item.text || '',
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: extractMentions(item),
          urls: item.urls || [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.timestamp || item.takenAtTimestamp || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.url || `https://www.instagram.com/p/${item.shortCode || ''}/`,
          isSponsored: item.isSponsored || item.isPaidPartnership || false,
          isPinned: item.isPinned || false,
        },
      }));
  },
};
