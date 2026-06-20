import { describe, expect, it } from 'vitest';
import {
  generateDefaultEpisode,
  generateHighlightEpisode,
  meltFactsIntoNarrative,
} from './narrative';

describe('narrative', () => {
  it('melts extracted facts into a center-specific episode', () => {
    const episode = meltFactsIntoNarrative(
      {
        elderName: '양OO',
        quantity: '세 곡',
        nickname: '명가수',
        action: '노래를 부르시다',
        emotion: null,
        context: '젊었을 때',
      },
      '노래 교실',
      '행복센터',
    );

    expect(episode).toContain('행복센터');
    expect(episode).toContain('양OO');
    expect(episode).toContain('세 곡');
    expect(episode).toContain('명가수');
  });

  it('generates default episode when custom details are blank', () => {
    const expected = generateDefaultEpisode(['환하게 웃으시며'], '체조');
    const actual = generateHighlightEpisode('   ', ['환하게 웃으시며'], '체조', '행복센터');

    expect(actual).toBe(expected);
  });

  it('uses at most first two reactions in default episode', () => {
    const episode = generateDefaultEpisode(
      ['눈물을 흘리시며', '환하게 웃으시며', '세 번째 반응'],
      '미술 활동',
    );

    expect(episode).toContain('눈시울을 붉히시는');
    expect(episode).toContain('웃음꽃을 피우시는');
    expect(episode).not.toContain('세 번째 반응');
  });

  it('creates fact-based highlight without copying original details verbatim', () => {
    const original = '양OO 어르신이 세 곡을 부르시며 명가수라고 불렸어요';
    const episode = generateHighlightEpisode(original, [], '노래 교실', '행복센터');

    expect(episode).toContain('행복센터');
    expect(episode).toContain('양OO');
    expect(episode).toContain('세 곡');
    expect(episode).not.toContain(original);
  });
});
