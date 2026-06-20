import { describe, it, expect } from 'vitest';
import { extractFactsFromInput } from './factExtraction';

describe('extractFactsFromInput', () => {
  it('should extract elder name with O/○/ㅇ masking', () => {
    const facts = extractFactsFromInput('양OO 어르신이 노래를 부르셨어요');
    expect(facts.elderName).toBe('양OO');
  });

  it('should extract quantity (number words)', () => {
    const facts = extractFactsFromInput('세 곡을 부르셨어요');
    expect(facts.quantity).toBe('세 곡');
  });

  it('should extract quantity (other forms)', () => {
    const facts = extractFactsFromInput('다섯 번 춤을 추셨어요');
    expect(facts.quantity).toBe('다섯 번');
  });

  it('should extract action: singing', () => {
    const facts = extractFactsFromInput('노래를 부르셨어요');
    expect(facts.action).toBe('노래를 부르시다');
  });

  it('should extract action: dancing', () => {
    const facts = extractFactsFromInput('춤을 추셨어요');
    expect(facts.action).toBe('춤을 추시다');
  });

  it('should extract action: drawing', () => {
    const facts = extractFactsFromInput('그림을 그리셨어요');
    expect(facts.action).toBe('그림을 그리시다');
  });

  it('should extract nickname', () => {
    const facts = extractFactsFromInput('명가수라고 불렸어요');
    expect(facts.nickname).toBe('명가수');
  });

  it('should extract emotion', () => {
    const facts = extractFactsFromInput('정말 즐거워하셨어요');
    expect(facts.emotion).toBe('즐거');
  });

  it('should extract context (past tense)', () => {
    const facts = extractFactsFromInput('젊었을 때 노래를 부르셨어요');
    expect(facts.context).toBe('젊었을 때');
  });

  it('should extract context (alternative form)', () => {
    const facts = extractFactsFromInput('옛날에 그렇게 했었대요');
    expect(facts.context).toContain('옛날');
  });

  it('should return null for missing fields', () => {
    const facts = extractFactsFromInput('오늘 활동이 있었어요');
    expect(facts.elderName).toBeNull();
    expect(facts.quantity).toBeNull();
    expect(facts.nickname).toBeNull();
    expect(facts.action).toBeNull();
    expect(facts.emotion).toBeNull();
    expect(facts.context).toBeNull();
  });

  it('should extract multiple facts from one input', () => {
    const input = '양OO 어르신이 세 곡을 부르시며 명가수라고 불렸어요. 젊었을 적 노래를 잘하셨대요.';
    const facts = extractFactsFromInput(input);

    expect(facts.elderName).toBe('양OO');
    expect(facts.quantity).toBe('세 곡');
    expect(facts.nickname).toBe('명가수');
    expect(facts.action).toBe('노래를 부르시다');
    expect(facts.context).toBe('젊었을 적');
  });

  it('should handle other quantity units', () => {
    const facts = extractFactsFromInput('다섯 개를 만드셨어요');
    expect(facts.quantity).toBe('다섯 개');
  });

  it('should extract feeling emotion keyword', () => {
    const facts = extractFactsFromInput('감격해서 눈물을 흘리셨어요');
    expect(facts.emotion).toBe('감격');
  });
});
