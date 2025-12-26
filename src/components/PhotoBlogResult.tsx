import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, RotateCcw } from 'lucide-react';
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
      if (match.index > lastIndex) {
        currentText += content.slice(lastIndex, match.index);
      }

      const imageIndex = parseInt(match[1]) - 1;
      
      if (imageIndex >= 0 && imageIndex < imageUrls.length) {
        if (currentText.trim() && blocks.length > 0) {
          blocks[blocks.length - 1].text += currentText;
          currentText = '';
        } else if (currentText.trim()) {
          blocks.push({ text: currentText.trim() });
          currentText = '';
        }
        
        blocks.push({
          imageUrl: imageUrls[imageIndex],
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

    if (blocks.length === 0 && content.trim()) {
      blocks.push({ text: content.trim() });
    }

    return blocks;
  };

  const storyBlocks = parseStoryBlocks();

  return (
    <div className="w-full animate-fade-in">
      {/* Naver Blog Style Preview Container */}
      <article 
        className="mx-auto bg-white shadow-lg border border-gray-200"
        style={{
          maxWidth: '800px',
          fontFamily: "'Nanum Gothic', 'Malgun Gothic', sans-serif",
        }}
      >
        {/* Blog Header Bar */}
        <div className="bg-gradient-to-r from-[#03C75A] to-[#00B843] px-6 py-3">
          <span className="text-white text-xs font-medium tracking-wide">
            📝 네이버 블로그 미리보기
          </span>
        </div>

        {/* Content Area */}
        <div 
          className="px-5 sm:px-10 py-10"
          style={{
            fontSize: '16px',
            lineHeight: '1.8',
            color: '#333333',
            wordBreak: 'keep-all',
          }}
        >
          {/* Title */}
          <h1 
            className="font-bold mb-8 pb-4 border-b-2 border-[#03C75A]"
            style={{
              fontSize: '24px',
              lineHeight: '1.4',
              color: '#1a1a1a',
            }}
          >
            {title}
          </h1>

          {/* Story Blocks */}
          <div className="space-y-0">
            {storyBlocks.map((block, idx) => (
              <div key={idx}>
                {/* Image */}
                {block.imageUrl && (
                  <div className="my-6">
                    <img
                      src={block.imageUrl}
                      alt={`활동 사진 ${(block.imageIndex ?? 0) + 1}`}
                      className="block mx-auto"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                )}
                
                {/* Text Paragraphs */}
                {block.text && (
                  <div>
                    {block.text.split('\n').map((paragraph, pIdx) => (
                      paragraph.trim() && (
                        <p 
                          key={pIdx}
                          className="mb-6"
                          style={{
                            fontSize: '16px',
                            lineHeight: '1.8',
                            color: '#333333',
                            textAlign: 'left',
                          }}
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

          {/* Hashtags */}
          <div 
            className="mt-10 pt-6 border-t border-gray-200"
            style={{ color: '#03C75A' }}
          >
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag, index) => (
                <span
                  key={index}
                  className="text-sm hover:underline cursor-pointer"
                  style={{ color: '#03C75A' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Action Buttons - Outside the blog preview */}
      <div className="max-w-[800px] mx-auto mt-6 px-4 flex gap-3">
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
    </div>
  );
};

export default PhotoBlogResult;
