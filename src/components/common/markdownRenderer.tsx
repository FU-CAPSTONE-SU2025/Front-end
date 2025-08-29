import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className }) => {
  const renderMarkdown = (text: string) => {
    // Code blocks
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style=\"background-color:#0f172a; color:#e2e8f0; padding:10px; border-radius:8px; font-family:'Monaco','Menlo','Ubuntu Mono',monospace; font-size:12.5px; overflow:auto; margin:6px 0; border:1px solid #1f2937;\"><code>${code}</code></pre>`;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code style="background-color:#111827; color:#e5e7eb; padding:1px 6px; border-radius:6px; font-family:\'Monaco\',\'Menlo\',\'Ubuntu Mono\',monospace; font-size:12.5px; border:1px solid #1f2937;">$1</code>');

    // Headings (colorful)
    text = text.replace(/^###\s+(.*)$/gm, '<h3 style="font-weight:800; font-size:18px; margin:4px 0 4px; color:#2563eb;">$1</h3>');
    text = text.replace(/^####\s+(.*)$/gm, '<h4 style="font-weight:700; font-size:15px; margin:3px 0 2px; color:#6366f1;">$1</h4>');

    // Bold & italic
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight:700; color:#111827;">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong style="font-weight:700; color:#111827;">$1</strong>');
    text = text.replace(/\*(.*?)\*/g, '<em style="font-style:italic; color:#374151;">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em style="font-style:italic; color:#374151;">$1</em>');

    // Links
    text = text.replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener" style="color:#10b981; text-decoration:underline;">$1</a>');

    // List items (compact)
    text = text.replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin:1px 0;">$1</li>');
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin:1px 0;">$1</li>');

    // Wrap lists
    text = text.replace(/((?:<li.*?>.*?<\/li>\n?)+)/g, `<ul style="margin:1px 0; padding-left:14px; list-style-type:disc;">$1</ul>`);

    // Line breaks
    text = text.replace(/\n/g, '<br />');

    return text;
  };

  return (
    <div
      className={className}
      style={{ lineHeight: 1 }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
