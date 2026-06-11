/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const BRAID_BRANDS = [
  'Avvis',
  'Darling',
  'Havana',
  'Jibambe',
  'Rubie',
  'X-Pression',
  'Sensationnel',
  'Bobbi Boss',
  'Freetress',
  'Outre',
] as const;

export const BRAID_STYLES = [
  'Box Braid',
  'Ponytail',
  'Twist',
  'Knotless',
  'Nat Twist',
  'Locs',
  'Crochet',
  'Havana Curl',
  'Jerry Curl',
  'Water Wave',
  'Straight',
  'Deep Wave',
] as const;

export const BRAID_LENGTHS = [
  'Short',
  'Medium',
  'Long',
  'Extra Long',
] as const;

export type BraidBrand = (typeof BRAID_BRANDS)[number];
export type BraidStyle = (typeof BRAID_STYLES)[number];
export type BraidLength = (typeof BRAID_LENGTHS)[number];

export const CUSTOM_OPTION = '__custom__';
