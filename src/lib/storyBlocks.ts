import { StoryBlock } from '../types/blog';

/**
 * Parse content into Story Blocks (이미지 우선 구조)
 *
 * 구조: [도입부 텍스트] → [IMAGE_1] → [텍스트1] → [IMAGE_2] → [텍스트2] → ...
 *
 * @param content - Generated blog content with image markers
 * @param imagePaths - Array of image URLs
 * @param options - Parsing options
 * @returns Array of StoryBlock objects
 */
export interface ParseOptions {
  removeHtml?: boolean;  // HTML 태그 제거 (기본: false)
  allowFallback?: boolean;  // 마커 없을 시 이미지를 앞에 배치 (기본: false)
}

export function parseStoryBlocks(
  content: string,
  imagePaths: string[],
  options?: ParseOptions
): StoryBlock[] {
  const opts = { removeHtml: false, allowFallback: false, ...options };

  let processedContent = content;

  // Step 1: HTML 제거 (옵션)
  if (opts.removeHtml) {
    processedContent = processedContent.replace(/<[^>]*>/g, '');
  }

  // Step 2: 이미지 마커 패턴 정규화
  // 다양한 마커 형식 → [IMAGE_PLACEHOLDER_N] 형식으로 통일
  const markerPatterns = [
    { pattern: /\[사진\s*(\d+)\]|\(사진\s*(\d+)\)|\[이미지\s*(\d+)\]/g, prefix: 'IMAGE_PLACEHOLDER_' },
    { pattern: /\[사진(\d+)\]|\(사진(\d+)\)/g, prefix: 'IMAGE_PLACEHOLDER_' },
  ];

  for (const { pattern } of markerPatterns) {
    processedContent = processedContent.replace(pattern, (match, ...groups) => {
      const imgNum = groups.find(g => g !== undefined);
      return `[IMAGE_PLACEHOLDER_${imgNum}]`;
    });
  }

  // Step 3: IMAGE_PLACEHOLDER 파싱
  const blocks: StoryBlock[] = [];
  const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;

  let lastIndex = 0;
  let match;
  let currentText = '';

  placeholderRegex.lastIndex = 0;

  while ((match = placeholderRegex.exec(processedContent)) !== null) {
    if (match.index > lastIndex) {
      currentText += processedContent.slice(lastIndex, match.index);
    }

    const imageIndex = parseInt(match[1]) - 1;

    if (imageIndex >= 0 && imageIndex < imagePaths.length) {
      if (currentText.trim() && blocks.length > 0) {
        blocks[blocks.length - 1].text += currentText;
        currentText = '';
      } else if (currentText.trim()) {
        blocks.push({ text: currentText.trim() });
        currentText = '';
      }

      blocks.push({
        imageUrl: imagePaths[imageIndex],
        imageIndex: imageIndex,
        text: ''
      });
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processedContent.length) {
    currentText += processedContent.slice(lastIndex);
  }

  if (currentText.trim()) {
    if (blocks.length > 0 && blocks[blocks.length - 1].imageUrl) {
      blocks[blocks.length - 1].text = currentText.trim();
    } else {
      blocks.push({ text: currentText.trim() });
    }
  }

  // Step 4: Fallback - 마커 없으면 이미지를 앞에 배치 (옵션)
  if (opts.allowFallback && blocks.every(b => !b.imageUrl) && imagePaths.length > 0) {
    const textBlocks = [...blocks];
    blocks.length = 0;
    imagePaths.forEach((url, idx) => {
      blocks.push({
        imageUrl: url,
        imageIndex: idx,
        text: ''
      });
    });
    blocks.push(...textBlocks);
  }

  return blocks;
}
