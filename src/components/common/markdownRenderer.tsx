import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const renderMarkdown = (text: string) => {
    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style=\"background-color:rgba(0,0,0,0.3); color:#e2e8f0; padding:8px; border-radius:6px; font-family:'Monaco','Menlo','Ubuntu Mono',monospace; font-size:12px; overflow:auto; margin:4px 0; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(10px);\"><code>${code}</code></pre>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code style="background-color:rgba(0,0,0,0.4); color:#fbbf24; padding:1px 4px; border-radius:3px; font-family:\'Monaco\',\'Menlo\',\'Ubuntu Mono\',monospace; font-size:12px; border:1px solid rgba(255,255,255,0.2); backdrop-filter:blur(5px);">$1</code>');

    // Headings (colorful)
    text = text.replace(/^###\s+(.*)$/gm, '<h3 style="font-weight:700; font-size:16px; margin:6px 0 4px; color:#fbbf24; text-shadow:0 1px 2px rgba(0,0,0,0.3);">$1</h3>');
    text = text.replace(/^####\s+(.*)$/gm, '<h4 style="font-weight:600; font-size:14px; margin:4px 0 2px; color:#f59e0b; text-shadow:0 1px 2px rgba(0,0,0,0.3);">$1</h4>');

    // Bold & italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:600; color:#ffffff; text-shadow:0 1px 2px rgba(0,0,0,0.3);">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong style="font-weight:600; color:#ffffff; text-shadow:0 1px 2px rgba(0,0,0,0.3);">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em style="font-style:italic; color:#fde68a; text-shadow:0 1px 2px rgba(0,0,0,0.3);">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em style="font-style:italic; color:#fde68a; text-shadow:0 1px 2px rgba(0,0,0,0.3);">$1</em>');

    // Links
    text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#fbbf24; text-decoration:underline; font-weight:500; transition:color 0.2s ease;">$1</a>');

    // List items (very compact spacing)
    text = text.replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin:1px 0; line-height:1.3; color:#ffffff;">$1</li>');
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin:1px 0; line-height:1.3; color:#ffffff;">$1</li>');

    // Wrap lists
    text = text.replace(/((?:<li.*?>.*?<\/li>\n?)+)/g, `<ul style="margin:3px 0; padding-left:12px; list-style-type:disc;">$1</ul>`);

    // Line breaks
    text = text.replace(/\n/g, '<br />');

    return text;
  };

  return (
    <div
      className={className}
      style={{ 
        lineHeight: 1.3,
        color: '#ffffff',
        fontSize: '13px',
        letterSpacing: '0.1px'
      }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
