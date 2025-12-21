import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, RotateCcw, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhotoBlogResultProps {
  title: string;
  content: string;
  hashtags: string[];
  imageUrls: string[];
  onReset: () => void;
}

interface StoryBlock {
  imageUrl?: string;
  imageIndex?: number;
  text: string;
}

const PhotoBlogResult = ({ 
  title, 
  content, 
  hashtags, 
  imageUrls,
  onReset
}: PhotoBlogResultProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyAsHtml = async () => {
    try {
      let html = `<h2>${title}</h2>\n\n`;
      
      let processedContent = content;
      imageUrls.forEach((url, index) => {
        const placeholder = `[IMAGE_PLACEHOLDER_${index + 1}]`;
        processedContent = processedContent.replace(
          placeholder,
          `\n<img src="${url}" alt="활동 사진 ${index + 1}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`
        );
      });
      
      const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
      processedContent = processedContent.replace(placeholderRegex, (match, num) => {
        const idx = parseInt(num) - 1;
        if (idx >= 0 && idx < imageUrls.length) {
          return `\n<img src="${imageUrls[idx]}" alt="활동 사진 ${num}" style="max-width:100%; border-radius:8px; margin: 16px 0;" />\n`;
        }
        return '';
      });
      
      html += processedContent.split('\n').map(line => `<p>${line}</p>`).join('\n');
      html += `\n\n<p>${hashtags.join(' ')}</p>`;

      const blob = new Blob([html], { type: 'text/html' });
      const clipboardItem = new ClipboardItem({
        'text/html': blob,
        'text/plain': new Blob([`${title}\n\n${content}\n\n${hashtags.join(' ')}`], { type: 'text/plain' })
      });
      
      await navigator.clipboard.write([clipboardItem]);
      
      setCopied(true);
      toast({
        title: '네이버 블로그용 HTML 복사 완료! 🎉',
        description: '네이버 블로그 에디터에 붙여넣기하세요.',
      });
      setTimeout(() => setCopied(false), 3000);
      
    } catch (err) {
      console.error('Failed to copy:', err);
      toast({
        title: '복사 실패',
        description: '복사 중 오류가 발생했습니다. 다시 시도해주세요.',
        variant: 'destructive',
      });
    }
  };

  // Parse content into Story Blocks (Image First structure)
  const parseStoryBlocks = (): StoryBlock[] => {
    const blocks: StoryBlock[] = [];
    const placeholderRegex = /\[IMAGE_PLACEHOLDER_(\d+)\]/g;
    
    let lastIndex = 0;
    let match;
    let currentText = '';

    placeholderRegex.lastIndex = 0;

    while ((match = placeholderRegex.exec(content)) !== null) {
      // Collect text before this placeholder
      if (match.index > lastIndex) {
        currentText += content.slice(lastIndex, match.index);
      }

      const imageIndex = parseInt(match[1]) - 1;
      
      // When we find an image, create a block with image first, then accumulated text
      if (imageIndex >= 0 && imageIndex < imageUrls.length) {
        // If there's accumulated text from before, add it to previous block or create text-only block
        if (currentText.trim() && blocks.length > 0) {
          blocks[blocks.length - 1].text += currentText;
          currentText = '';
        } else if (currentText.trim()) {
          blocks.push({ text: currentText.trim() });
          currentText = '';
        }
        
        // Create new block with this image (text will be added after)
        blocks.push({
          imageUrl: imageUrls[imageIndex],
          imageIndex: imageIndex,
          text: ''
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Handle remaining text
    if (lastIndex < content.length) {
      currentText += content.slice(lastIndex);
    }

    // Assign remaining text to the last image block, or create text-only block
    if (currentText.trim()) {
      if (blocks.length > 0 && blocks[blocks.length - 1].imageUrl) {
        blocks[blocks.length - 1].text = currentText.trim();
      } else {
        blocks.push({ text: currentText.trim() });
      }
    }

    // If no blocks created but we have content, create a single text block
    if (blocks.length === 0 && content.trim()) {
      blocks.push({ text: content.trim() });
    }

    return blocks;
  };

  const storyBlocks = parseStoryBlocks();

  return (
    <article className="w-full max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      {/* Title Section */}
      <header className="mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight mb-4">
          {title}
        </h1>
        <div className="h-px bg-border/60 w-16" />
      </header>

      {/* Seamless Story Stream - Continuous Flow, No Cards */}
      <div className="space-y-0">
        {storyBlocks.map((block, idx) => (
          <div key={idx}>
            {/* Image - Sharp Corners, Full Width */}
            {block.imageUrl && (
              <div className="mt-12 mb-6">
                <img
                  src={block.imageUrl}
                  alt={`활동 사진 ${(block.imageIndex ?? 0) + 1}`}
                  className="w-full rounded-none"
                />
              </div>
            )}
            
            {/* Text - Left Aligned, Loose Leading */}
            {block.text && (
              <div>
                {block.text.split('\n').map((paragraph, pIdx) => (
                  paragraph.trim() && (
                    <p 
                      key={pIdx}
                      className="text-lg text-gray-800 leading-loose mb-6 text-left"
                    >
                      {paragraph}
                    </p>
                  )
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Hashtags Section */}
      <footer className="mt-16 pt-8 border-t border-border/40">
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="text-sm text-primary/70 hover:text-primary transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </footer>

      {/* Action Buttons - Sticky Bottom */}
      <div className="sticky bottom-4 mt-12 flex gap-3">
        <Button
          variant="forest"
          className="flex-1 h-12 text-base font-medium"
          onClick={copyAsHtml}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5" />
              복사 완료!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5" />
              네이버 블로그용 복사하기
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="h-12 px-6 font-medium"
          onClick={onReset}
        >
          <RotateCcw className="w-4 h-4" />
          새 글 작성
        </Button>
      </div>
    </article>
  );
};

export default PhotoBlogResult;
