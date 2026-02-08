/**
 * Bluesky Platform Normalizer
 *
 * Apify Actor: red.cars/bluesky-scraper の出力を UnifiedPost に変換
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
  const embed = item.embed || item.record?.embed;

  if (embed?.images?.length) {
    for (const img of embed.images) {
      media.push({
        type: 'image',
        url: img.fullsize || img.thumb || img.url || '',
        thumbnailUrl: img.thumb,
        altText: img.alt,
        width: img.aspectRatio?.width,
        height: img.aspectRatio?.height,
      });
    }
  }

  if (embed?.video || embed?.$type === 'app.bsky.embed.video#view') {
    media.push({
      type: 'video',
      url: embed.video?.url || embed.playlist || '',
      thumbnailUrl: embed.thumbnail,
    });
  }

  return media;
}

function extractHashtags(item: any): string[] {
  const text = item.text || item.record?.text || '';
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function extractMentions(item: any): string[] {
  const facets = item.record?.facets || item.facets || [];
  const mentions: string[] = [];
  for (const facet of facets) {
    for (const feature of facet.features || []) {
      if (feature.$type === 'app.bsky.richtext.facet#mention') {
        mentions.push(feature.did || '');
      }
    }
  }
  return mentions;
}

function buildEngagement(item: any): Engagement {
  const likes = item.likeCount ?? item.likes ?? 0;
  const shares = item.repostCount ?? item.reposts ?? 0;
  const comments = item.replyCount ?? item.replies ?? 0;
  const views = 0; // Bluesky doesn't expose view counts
  const saves = 0;
  const followers = item.author?.followersCount ?? 0;

  return {
    likes,
    shares,
    comments,
    views,
    engagementRate: calculateEngagementRate({ likes, comments, shares, saves }, followers),
    saves,
    quotes: item.quoteCount ?? 0,
  };
}

function detectPostType(item: any): PostType {
  const embed = item.embed || item.record?.embed;
  if (embed?.video || embed?.$type === 'app.bsky.embed.video#view') return 'video';
  if (embed?.images?.length > 1) return 'carousel';
  if (embed?.images?.length) return 'image';
  if (embed?.external) return 'article';
  return 'text';
}

export const blueskyNormalizer: PlatformNormalizer = {
  platform: 'bluesky',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'bluesky' as const,
        platformPostId: String(item.uri || item.cid || ''),
        author: {
          username: item.author?.handle || '',
          displayName: item.author?.displayName || item.author?.handle || '',
          followers: item.author?.followersCount || 0,
          verified: false,
          profileUrl: `https://bsky.app/profile/${item.author?.handle || ''}`,
          bio: item.author?.description,
          avatarUrl: item.author?.avatar,
        },
        content: {
          text: item.text || item.record?.text || '',
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: extractMentions(item),
          urls: [],
          language: (item.record?.langs?.[0]) || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.indexedAt || item.record?.createdAt || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.url || `https://bsky.app/profile/${item.author?.handle || ''}/post/${extractRkey(item.uri)}`,
          isReply: !!item.record?.reply,
          parentPostId: item.record?.reply?.parent?.uri,
        },
      }));
  },
};

function extractRkey(uri: string | undefined): string {
  if (!uri) return '';
  const parts = uri.split('/');
  return parts[parts.length - 1] || '';
}
