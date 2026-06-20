import { describe, it, expect } from 'vitest';
import { parseStoryBlocks } from './storyBlocks';

describe('parseStoryBlocks', () => {
  const imageUrls = ['img1.jpg', 'img2.jpg', 'img3.jpg'];

  it('should parse content with IMAGE_PLACEHOLDER markers', () => {
    const content = '도입부 텍스트\n\n[IMAGE_PLACEHOLDER_1]\n\n첫 번째 이미지 설명\n\n[IMAGE_PLACEHOLDER_2]\n\n두 번째 이미지 설명';
    const blocks = parseStoryBlocks(content, imageUrls);

    // 블록 구조: 도입부 텍스트 | img1+설명 | img2+설명
    expect(blocks).toHaveLength(3);
    expect(blocks[0].text).toContain('도입부');
    expect(blocks[0].imageUrl).toBeUndefined();
    expect(blocks[1].imageUrl).toBe('img1.jpg');
    expect(blocks[1].text).toContain('첫 번째');
    expect(blocks[2].imageUrl).toBe('img2.jpg');
    expect(blocks[2].text).toContain('두 번째');
  });

  it('should handle content without markers', () => {
    const content = '텍스트만 있고 마커는 없음';
    const blocks = parseStoryBlocks(content, imageUrls);

    expect(blocks).toHaveLength(1);
    expect(blocks[0].text).toBe('텍스트만 있고 마커는 없음');
    expect(blocks[0].imageUrl).toBeUndefined();
  });

  it('should ignore invalid image indices', () => {
    const content = '텍스트\n\n[IMAGE_PLACEHOLDER_10]\n\n더 많은 텍스트';
    const blocks = parseStoryBlocks(content, imageUrls);

    // 유효하지 않은 인덱스는 무시되고 텍스트만 파싱됨
    expect(blocks.some(b => b.imageUrl)).toBe(false);
  });

  it('should remove HTML tags when removeHtml option is true', () => {
    const content = '<p>도입부 텍스트</p>\n\n[IMAGE_PLACEHOLDER_1]\n\n<b>설명</b>';
    const blocks = parseStoryBlocks(content, imageUrls, { removeHtml: true });

    expect(blocks[0].text).not.toContain('<');
    expect(blocks[0].text).toContain('도입부');
  });

  it('should preserve HTML tags when removeHtml is false', () => {
    const content = '<p>도입부 텍스트</p>';
    const blocks = parseStoryBlocks(content, imageUrls, { removeHtml: false });

    expect(blocks[0].text).toContain('<p>');
  });

  it('should support alternative marker formats with removeHtml', () => {
    const content = '도입부\n\n[사진 1]\n\n설명1\n\n(사진 2)\n\n설명2\n\n[이미지3]';
    const blocks = parseStoryBlocks(content, imageUrls, { removeHtml: true });

    const imageBlocks = blocks.filter(b => b.imageUrl);
    expect(imageBlocks.length).toBeGreaterThanOrEqual(2);
  });

  it('should fallback to prepending images when allowFallback is true and no markers', () => {
    const content = '마커 없는 텍스트 내용';
    const blocks = parseStoryBlocks(content, imageUrls, { allowFallback: true });

    expect(blocks[0].imageUrl).toBe('img1.jpg');
    expect(blocks[imageUrls.length].text).toContain('마커 없는 텍스트');
  });

  it('should not prepend images when allowFallback is false and no markers', () => {
    const content = '마커 없는 텍스트 내용';
    const blocks = parseStoryBlocks(content, imageUrls, { allowFallback: false });

    expect(blocks[0].imageUrl).toBeUndefined();
    expect(blocks[0].text).toContain('마커 없는 텍스트');
  });

  it('should handle empty content', () => {
    const blocks = parseStoryBlocks('', imageUrls);
    expect(blocks).toHaveLength(0);
  });

  it('should trim whitespace from text blocks', () => {
    const content = '   도입부   \n\n[IMAGE_PLACEHOLDER_1]\n\n   설명   ';
    const blocks = parseStoryBlocks(content, imageUrls);

    expect(blocks[0].text).toBe('도입부');
    expect(blocks[1].text).toBe('설명');
  });
});
