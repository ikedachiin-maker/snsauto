/**
 * Reddit Platform Normalizer
 *
 * Apify Actor: trudax/reddit-scraper の出力を UnifiedPost に変換
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

  if (item.thumbnail && item.thumbnail !== 'self' && item.thumbnail !== 'default') {
    media.push({
      type: 'image',
      url: item.thumbnail,
    });
  }

  if (item.isVideo || item.media?.reddit_video) {
    media.push({
      type: 'video',
      url: item.media?.reddit_video?.fallback_url || item.videoUrl || '',
      thumbnailUrl: item.thumbnail !== 'self' ? item.thumbnail : undefined,
      duration: item.media?.reddit_video?.duration,
    });
  }

  if (item.imageUrl || item.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    media.push({
      type: 'image',
      url: item.imageUrl || item.url,
    });
  }

  if (item.galleryData?.items?.length) {
    for (const galleryItem of item.galleryData.items) {
      media.push({
        type: 'image',
        url: galleryItem.url || '',
      });
    }
  }

  return media;
}

function extractHashtags(item: any): string[] {
  // Reddit uses flairs instead of hashtags
  const tags: string[] = [];
  if (item.flair) tags.push(item.flair);
  if (item.linkFlairText) tags.push(item.linkFlairText);
  return tags;
}

function buildEngagement(item: any): Engagement {
  const likes = item.score ?? item.ups ?? 0;
  const comments = item.numberOfComments ?? item.numComments ?? item.num_comments ?? 0;
  const shares = item.crossposts?.length ?? 0;
  const views = 0; // Reddit doesn't expose view counts via API
  const saves = 0;
  const followers = item.author?.karma ?? 0;

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
  if (item.isVideo || item.media?.reddit_video) return 'video';
  if (item.galleryData?.items?.length > 1) return 'carousel';
  if (item.imageUrl || item.url?.match(/\.(jpg|jpeg|png|gif|webp)$/i)) return 'image';
  if (item.poll) return 'poll';
  if (item.selftext || item.body) return 'text';
  if (item.url) return 'article';
  return 'text';
}

export const redditNormalizer: PlatformNormalizer = {
  platform: 'reddit',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'reddit' as const,
        platformPostId: String(item.id || item.name || ''),
        author: {
          username: item.author || item.authorName || '[deleted]',
          displayName: item.author || item.authorName || '[deleted]',
          followers: item.author_karma ?? 0,
          verified: false,
          profileUrl: `https://www.reddit.com/user/${item.author || ''}`,
        },
        content: {
          text: item.title
            ? item.title + (item.selftext ? '\n\n' + stripHtml(item.selftext) : '')
            : stripHtml(item.body || item.selftext || ''),
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: [],
          urls: item.url && !item.url.startsWith('https://www.reddit.com/r/') ? [item.url] : [],
          language: item.language || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.createdAt || item.created_utc || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.url?.startsWith('https://www.reddit.com')
            ? item.url
            : `https://www.reddit.com${item.permalink || ''}`,
          isPinned: item.stickied || item.pinned || false,
          isReply: !!item.parentId,
          parentPostId: item.parentId,
        },
      }));
  },
};
