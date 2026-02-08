/**
 * YouTube Platform Normalizer
 *
 * Apify Actor: streamers/youtube-scraper の出力を UnifiedPost に変換
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
  const thumbnailUrl = item.thumbnailUrl || item.thumbnail?.url
    || (item.videoId ? `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg` : undefined);

  media.push({
    type: 'video',
    url: item.url || `https://www.youtube.com/watch?v=${item.videoId || item.id || ''}`,
    thumbnailUrl,
    duration: parseDuration(item.duration || item.lengthText),
  });

  return media;
}

function parseDuration(duration: any): number | undefined {
  if (typeof duration === 'number') return duration;
  if (!duration || typeof duration !== 'string') return undefined;

  // ISO 8601 format: PT1H2M3S
  const isoMatch = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (isoMatch) {
    const hours = parseInt(isoMatch[1] || '0', 10);
    const minutes = parseInt(isoMatch[2] || '0', 10);
    const seconds = parseInt(isoMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // HH:MM:SS or MM:SS format
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];

  return undefined;
}

function extractHashtags(item: any): string[] {
  if (item.hashtags?.length) return item.hashtags;
  const text = (item.title || '') + ' ' + (item.description || '');
  const matches = text.match(/#[\w\u3000-\u9FFF\uF900-\uFAFF]+/g);
  return matches ? matches.map((m: string) => m.slice(1)) : [];
}

function buildEngagement(item: any): Engagement {
  const likes = item.likes ?? item.likeCount ?? 0;
  const comments = item.commentsCount ?? item.commentCount ?? 0;
  const views = item.viewCount ?? item.views ?? 0;
  const shares = 0; // YouTube API does not expose share count
  const saves = 0;
  const followers = item.channelFollowerCount ?? item.channel?.subscriberCount ?? 0;

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
  const duration = parseDuration(item.duration || item.lengthText);
  if (duration && duration <= 60) return 'short';
  if (item.isLive || item.liveBroadcastContent === 'live') return 'video';
  return 'video';
}

export const youtubeNormalizer: PlatformNormalizer = {
  platform: 'youtube',
  normalize(rawItems: unknown[]): UnifiedPost[] {
    return rawItems
      .filter((item): item is Record<string, any> => item != null && typeof item === 'object')
      .map((item) => ({
        id: randomUUID(),
        platform: 'youtube' as const,
        platformPostId: String(item.videoId || item.id || ''),
        author: {
          username: item.channelName || item.channel?.name || '',
          displayName: item.channelName || item.channel?.name || '',
          followers: item.channelFollowerCount || item.channel?.subscriberCount || 0,
          verified: item.channelIsVerified || false,
          profileUrl: item.channelUrl || `https://www.youtube.com/channel/${item.channelId || ''}`,
        },
        content: {
          text: (item.title || '') + (item.description ? '\n\n' + item.description : ''),
          media: extractMedia(item),
          hashtags: extractHashtags(item),
          mentions: [],
          urls: item.urls || [],
          language: item.defaultLanguage || item.defaultAudioLanguage || 'und',
          transcript: item.subtitles || item.transcript,
        },
        engagement: buildEngagement(item),
        metadata: {
          publishedAt: toJST(item.date || item.publishedAt || item.uploadDate || ''),
          collectedAt: new Date().toISOString(),
          postType: detectPostType(item),
          permalink: item.url || `https://www.youtube.com/watch?v=${item.videoId || item.id || ''}`,
        },
      }));
  },
};
