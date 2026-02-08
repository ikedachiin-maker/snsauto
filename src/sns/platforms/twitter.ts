/**
 * Twitter/X Platform Normalizer
 *
 * Apify Actor: apidojo/tweet-scraper の出力を UnifiedPost に変換
 */

import { PlatformNormalizer } from '../types';
import {
  UnifiedPost,
  PostType,
  MediaItem,
  MediaType,
  Engagement,
  calculateEngagementRate,
} from '../../types/unified-post';
import { randomUUID } from 'crypto';
import { toJST } from '../utils';

function extractMedia(item: any): MediaItem[] {
  const media: MediaItem[] = [];
  const entities = item.extendedEntities?.media || item.entities?.media || [];
  for (const m of entities) {
    const type: MediaType = m.type === 'video' ? 'video'
      : m.type === 'animated_gif' ? 'gif'
      : 'image';
    media.push({
      type,
      url: m.media_url_https || m.url || '',
      thumbnailUrl: m.media_url_https,
      width: m.sizes?.large?.w,
      height: m.sizes?.large?.h,
      duration: m.video_info?.duration_millis ? m.video_info.duration_millis / 1000 : undefined,
    });
  }
  // Apify tweet-scraper format
  if (media.length === 0 && item.media?.length) {
    for (const m of item.media) {
      media.push({
        type: m.type === 'video' ? 'video' : m.type === 'gif' ? 'gif' : 'image',
        url: m.url || m.media_url || '',
        thumbnailUrl: m.thumbnail_url || m.preview_image_url,
      });
    }
  }
  return media;
}

function extractHashtags(item: any): string[] {
  if (item.entities?.hashtags) {
    return item.entities.hashtags.map((h: any) => h.tag || h.text || '');
  }
  if (item.hashtags) return item.hashtags;
  const text = item.text || item.full_text || '';
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function extractMentions(item: any): string[] {
  if (item.entities?.user_mentions) {
    return item.entities.user_mentions.map((m: any) => m.screen_name || '');
  }
  if (item.mentions) return item.mentions;
  const text = item.text || item.full_text || '';
  const matches = text.match(/@[\w]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function extractUrls(item: any): string[] {
  if (item.entities?.urls) {
    return item.entities.urls.map((u: any) => u.expanded_url || u.url || '');
  }
  return [];
}

function buildEngagement(item: any): Engagement {
  const likes = item.likeCount ?? item.favorite_count ?? item.likes ?? 0;
  const shares = item.retweetCount ?? item.retweet_count ?? item.retweets ?? 0;
  const comments = item.replyCount ?? item.reply_count ?? item.replies ?? 0;
  const views = item.viewCount ?? item.views ?? 0;
  const quotes = item.quoteCount ?? item.quote_count ?? 0;
  const saves = item.bookmarkCount ?? item.bookmark_count ?? 0;
  const followers = item.author?.followers ?? item.user?.followers_count ?? 0;

  return {
    likes,
    shares,
    comments,
    views,
    engagementRate: calculateEngagementRate({ likes, comments, shares, saves }, followers),
    saves,
    quotes,
  };
}

function detectPostType(item: any): PostType {
  if (item.isThread || item.conversation_id) return 'thread';
  if (item.extendedEntities?.media?.some((m: any) => m.type === 'video')) return 'video';
  if (item.extendedEntities?.media?.length || item.media?.length) return 'image';
  if (item.poll) return 'poll';
  return 'text';
}

export const twitterNormalizer: PlatformNormalizer = {
  platform: 'twitter',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'twitter' as const,
        platformPostId: String(item.id || item.id_str || ''),
        author: {
          username: item.author?.userName || item.user?.screen_name || '',
          displayName: item.author?.displayName || item.user?.name || '',
          followers: item.author?.followers || item.user?.followers_count || 0,
          verified: item.author?.isVerified || item.user?.verified || false,
          profileUrl: `https://x.com/${item.author?.userName || item.user?.screen_name || ''}`,
        },
        content: {
          text: item.text || item.full_text || '',
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: extractMentions(item),
          urls: extractUrls(item),
          language: item.lang || 'und',
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.createdAt || item.created_at || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.url || `https://x.com/i/status/${item.id || item.id_str || ''}`,
          isReply: !!(item.inReplyToStatusId || item.in_reply_to_status_id),
          parentPostId: item.inReplyToStatusId || item.in_reply_to_status_id_str,
        },
      }));
  },
};
