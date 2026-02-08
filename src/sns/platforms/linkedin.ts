/**
 * LinkedIn Platform Normalizer
 *
 * Apify Actor: dev_fusion/linkedin-profile-scraper の出力を UnifiedPost に変換
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
import { toJST, stripHtml } from '../utils';

function extractMedia(item: any): MediaItem[] {
  const media: MediaItem[] = [];

  if (item.images?.length) {
    for (const img of item.images) {
      media.push({
        type: 'image',
        url: typeof img === 'string' ? img : img.url || '',
      });
    }
  }

  if (item.videoUrl || item.video) {
    media.push({
      type: 'video',
      url: item.videoUrl || item.video?.url || '',
      thumbnailUrl: item.video?.thumbnail,
      duration: item.video?.duration,
    });
  }

  if (item.document) {
    media.push({
      type: 'image',
      url: item.document.url || '',
      altText: item.document.title,
    });
  }

  return media;
}

function buildEngagement(item: any): Engagement {
  const likes = item.numLikes ?? item.likesCount ?? item.reactions ?? 0;
  const comments = item.numComments ?? item.commentsCount ?? 0;
  const shares = item.numShares ?? item.repostsCount ?? 0;
  const views = item.numViews ?? item.impressions ?? 0;
  const saves = 0;
  const followers = item.authorFollowers ?? item.author?.followersCount ?? 0;

  return {
    likes,
    shares,
    comments,
    views,
    engagementRate: calculateEngagementRate({ likes, comments, shares, saves }, followers),
    saves,
    reactions: item.reactionsByType || undefined,
  };
}

function detectPostType(item: any): PostType {
  if (item.videoUrl || item.video) return 'video';
  if (item.images?.length > 1) return 'carousel';
  if (item.images?.length === 1) return 'image';
  if (item.document) return 'article';
  if (item.article || item.link) return 'article';
  if (item.poll) return 'poll';
  return 'text';
}

export const linkedinNormalizer: PlatformNormalizer = {
  platform: 'linkedin',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'linkedin' as const,
        platformPostId: String(item.urn || item.postId || item.id || ''),
        author: {
          username: item.authorProfileId || item.author?.publicIdentifier || '',
          displayName: item.authorName || item.author?.name || '',
          followers: item.authorFollowers || item.author?.followersCount || 0,
          verified: item.authorIsInfluencer || false,
          profileUrl: item.authorProfileUrl || item.author?.url || '',
          bio: item.authorHeadline || item.author?.headline,
        },
        content: {
          text: stripHtml(item.text || item.commentary || ''),
          media: extractMedia(item),
          hashtags: item.hashtags || [],
          mentions: item.mentions?.map((m: any) => m.name || m) || [],
          urls: item.link ? [item.link] : [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.postedAt || item.publishedAt || item.date || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.postUrl || item.url || '',
        },
      }));
  },
};
