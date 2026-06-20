import { describe, it, expect } from 'vitest';
import {
  findViolations,
  sanitize,
  openingSimilarity,
  OPENING_SIMILARITY_THRESHOLD,
} from './guards';

describe('findViolations — 금지어/금지 패턴 검출', () => {
  it('금지 단어(웃음꽃)를 검출한다', () => {
    const v = findViolations('제목\n오늘도 웃음꽃이 활짝 피었습니다', []);
    expect(v.some((x) => x.includes('웃음꽃'))).toBe(true);
  });

  it('금지 도입 문구를 검출한다', () => {
    const v = findViolations('사회복지사로서 가장 보람찬 순간입니다', []);
    expect(v.some((x) => x.includes('사회복지사로서 가장 보람찬'))).toBe(true);
  });

  it('SOFT(시각참조)는 includeSoft=true에서만 잡힌다', () => {
    const text = '제목\n어르신이 집중하시는 모습입니다';
    expect(findViolations(text, [], { includeSoft: false }).length).toBe(0);
    expect(
      findViolations(text, [], { includeSoft: true }).some((x) => x.includes('모습입니다')),
    ).toBe(true);
  });

  it('깨끗한 글은 위반이 없다', () => {
    const text = '색연필 한 자루\n어르신이 색연필을 천천히 쥐고 선을 그으셨다.';
    expect(findViolations(text, []).length).toBe(0);
  });
});

describe('findViolations — 전문용어 남발(최대 1회)', () => {
  it('"인지 기능" 2회면 위반', () => {
    const text = '제목\n인지 기능 향상에 좋고, 다시 또 인지 기능 자극에도 좋다.';
    expect(findViolations(text, []).some((x) => x.includes('인지 기능'))).toBe(true);
  });

  it('"인지 기능" 1회는 통과', () => {
    const text = '제목\n인지 기능 향상에 도움이 됩니다.';
    expect(findViolations(text, []).some((x) => x.includes('인지 기능'))).toBe(false);
  });
});

describe('openingSimilarity — Jaccard 임계 경계', () => {
  it('동일 문장은 유사도 1', () => {
    const s = '오늘 아침 어르신들이 둘러앉아 노래를 불렀다';
    expect(openingSimilarity(s, s)).toBeCloseTo(1, 5);
  });

  it('무관한 문장은 임계 미만', () => {
    expect(
      openingSimilarity('빨간 사과를 한 입 베었다', '커다란 비행기가 하늘을 날았다'),
    ).toBeLessThan(OPENING_SIMILARITY_THRESHOLD);
  });

  it('유사한 도입은 임계 이상으로 검출된다', () => {
    const recent = '오늘 아침 셔틀버스에서 어르신들이 내리셨어요';
    const opening = '제목\n오늘 아침 셔틀버스에서 어르신들이 내리셨답니다';
    expect(findViolations(opening, [recent]).some((x) => x.includes('도입부가 유사'))).toBe(true);
  });
});

describe('sanitize + 최종 게이트(잔여 HARD 위반 거부)', () => {
  it('치환 가능한 금지어는 sanitize 후 HARD 위반이 사라진다', () => {
    const dirty = '제목\n오늘은 웃음꽃이 가득한 하루였어요.';
    const clean = sanitize(dirty);
    expect(findViolations(clean, [], { includeSoft: false }).length).toBe(0);
  });

  it('치환 불가한 도입 상투구는 sanitize 후에도 잔존(→422 거부)', () => {
    const dirty = '사회복지사로서 가장 보람찬 순간입니다';
    const clean = sanitize(dirty);
    expect(findViolations(clean, [], { includeSoft: false }).length).toBeGreaterThan(0);
  });
});
