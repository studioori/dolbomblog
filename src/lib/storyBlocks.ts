import { StoryBlock } from '../types/blog';

/**
 * Parse content into Story Blocks (이미지 우선 구조)
 *
 * 구조: [도입부 텍스트] → [IMAGE_1] → [텍스트1] → [IMAGE_2] → [텍스트2] → ...
 *
 * @param content - Generated blog content with IMAGE_PLACEHOLDER_N markers
 * @param imagePaths - Array of image URLs
 * @returns Array of StoryBlock objects
 */
export function parseStoryBlocks(content: string, imagePaths: string[]): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;

  let lastIndex = 0;
  let match;
  let currentText = '';

  placeholderRegex.lastIndex = 0;

  while ((match = placeholderRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      currentText += content.slice(lastIndex, match.index);
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

  if (lastIndex < content.length) {
    currentText += content.slice(lastIndex);
  }

  if (currentText.trim()) {
    if (blocks.length > 0 && blocks[blocks.length - 1].imageUrl) {
      blocks[blocks.length - 1].text = currentText.trim();
    } else {
      blocks.push({ text: currentText.trim() });
    }
  }

  return blocks;
}
