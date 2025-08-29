import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderMarkdown = (text: string) => {
    // Handle code blocks (```code```)
    text = text.replace(/```([\s\S]*?)```/g, (match, code) => {
      return `<pre style="background-color: #f3f4f6; padding: 0.75rem; border-radius: 0.5rem; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; font-size: 0.875rem; overflow-x: auto; margin: 0.5rem 0;"><code>${code}</code></pre>`;
    });

    // Handle inline code (`code`)
    text = text.replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: \'Monaco\', \'Menlo\', \'Ubuntu Mono\', monospace; font-size: 0.875rem;">$1</code>');

    // Handle bold (**text** or __text__)
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 600;">$1</strong>');
    text = text.replace(/__(.*?)__/g, '<strong style="font-weight: 600;">$1</strong>');

    // Handle italic (*text* or _text_)
    text = text.replace(/\*(.*?)\*/g, '<em style="font-style: italic;">$1</em>');
    text = text.replace(/_(.*?)_/g, '<em style="font-style: italic;">$1</em>');

    // Handle lists
    text = text.replace(/^\s*[-*+]\s+(.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>');
    text = text.replace(/^\s*\d+\.\s+(.+)$/gm, '<li style="margin: 0.25rem 0;">$1</li>');

    // Wrap lists in ul/ol
    text = text.replace(/(<li.*?<\/li>)/gs, '<ul style="margin: 0.5rem 0; padding-left: 1rem; list-style-type: disc;">$1</ul>');

    // Handle line breaks
    text = text.replace(/\n/g, '<br />');

    return text;
  };

  return (
    <div 
      style={{ lineHeight: 1.6 }}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default MarkdownRenderer;
