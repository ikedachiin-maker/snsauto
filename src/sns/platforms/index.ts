/**
 * Platform Normalizer Registry
 *
 * 全10プラットフォームのノーマライザーを一元管理。
 * プラットフォーム名からノーマライザーを取得する。
 */

import { PlatformNormalizer } from '../types';
import { Platform } from '../../types/unified-post';

import { twitterNormalizer } from './twitter';
import { instagramNormalizer } from './instagram';
import { youtubeNormalizer } from './youtube';
import { tiktokNormalizer } from './tiktok';
import { facebookNormalizer } from './facebook';
import { linkedinNormalizer } from './linkedin';
import { redditNormalizer } from './reddit';
import { pinterestNormalizer } from './pinterest';
import { threadsNormalizer } from './threads';
import { blueskyNormalizer } from './bluesky';

/**
 * 全ノーマライザーレジストリ
 */
const normalizers: Record<string, PlatformNormalizer> = {
  twitter: twitterNormalizer,
  instagram: instagramNormalizer,
  youtube: youtubeNormalizer,
  tiktok: tiktokNormalizer,
  facebook: facebookNormalizer,
  linkedin: linkedinNormalizer,
  reddit: redditNormalizer,
  pinterest: pinterestNormalizer,
  threads: threadsNormalizer,
  bluesky: blueskyNormalizer,
};

/**
 * プラットフォーム名からノーマライザーを取得
 */
export function getNormalizer(platform: string): PlatformNormalizer | undefined {
  return normalizers[platform];
}

/**
 * 対応プラットフォーム一覧を取得
 */
export function getSupportedPlatforms(): Platform[] {
  return Object.keys(normalizers) as Platform[];
}

/**
 * 全ノーマライザーを取得
 */
export function getAllNormalizers(): PlatformNormalizer[] {
  return Object.values(normalizers);
}

export {
  twitterNormalizer,
  instagramNormalizer,
  youtubeNormalizer,
  tiktokNormalizer,
  facebookNormalizer,
  linkedinNormalizer,
  redditNormalizer,
  pinterestNormalizer,
  threadsNormalizer,
  blueskyNormalizer,
};
