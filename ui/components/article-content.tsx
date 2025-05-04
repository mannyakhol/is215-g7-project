import React from 'react';
import { cn } from "@/lib/utils";

interface ArticleContentProps {
  content: string;
  className?: string;
}

export function ArticleContent({ content, className }: ArticleContentProps) {
  // Add references to the article content container
  const contentRef = React.useRef<HTMLDivElement>(null);

  // Apply custom styles to headers after the component mounts
  React.useEffect(() => {
    if (contentRef.current) {
      // Style h1 elements
      const h1Elements = contentRef.current.querySelectorAll('h1');
      h1Elements.forEach((el) => {
        el.classList.add(
          'text-3xl', 'font-extrabold', 'tracking-tight', 
          'pb-2', 'border-b', 'border-border', 'mb-6', 'mt-10'
        );
      });

      // Style h2 elements
      const h2Elements = contentRef.current.querySelectorAll('h2');
      h2Elements.forEach((el) => {
        el.classList.add(
          'text-2xl', 'font-bold', 'tracking-tight', 
          'mt-10', 'mb-4'
        );
      });

      // Style h3 elements
      const h3Elements = contentRef.current.querySelectorAll('h3');
      h3Elements.forEach((el) => {
        el.classList.add(
          'text-xl', 'font-semibold', 'tracking-tight',
          'mt-8', 'mb-3'
        );
      });

      // Style h4 elements
      const h4Elements = contentRef.current.querySelectorAll('h4');
      h4Elements.forEach((el) => {
        el.classList.add(
          'text-lg', 'font-semibold', 'tracking-tight',
          'mt-6', 'mb-2'
        );
      });
      
      // Style paragraphs
      const pElements = contentRef.current.querySelectorAll('p');
      pElements.forEach((el) => {
        el.classList.add('leading-relaxed', 'my-4');
      });
      
      // Style links
      const aElements = contentRef.current.querySelectorAll('a');
      aElements.forEach((el) => {
        el.classList.add('text-primary', 'hover:underline');
      });
      
      // Style lists
      const ulElements = contentRef.current.querySelectorAll('ul');
      ulElements.forEach((el) => {
        el.classList.add('my-6', 'list-disc', 'pl-6');
      });
      
      const olElements = contentRef.current.querySelectorAll('ol');
      olElements.forEach((el) => {
        el.classList.add('my-6', 'list-decimal', 'pl-6');
      });
      
      const liElements = contentRef.current.querySelectorAll('li');
      liElements.forEach((el) => {
        el.classList.add('my-2');
      });
      
      // Style blockquotes
      const blockquoteElements = contentRef.current.querySelectorAll('blockquote');
      blockquoteElements.forEach((el) => {
        el.classList.add(
          'border-l-4', 'border-primary/30', 'pl-4', 'py-1', 'italic', 
          'text-muted-foreground', 'my-6'
        );
      });
      
      // Style images
      const imgElements = contentRef.current.querySelectorAll('img');
      imgElements.forEach((el) => {
        el.classList.add('rounded-lg', 'shadow-md', 'my-6');
      });
    }
  }, [content]);

  return (
    <div 
      ref={contentRef}
      className={cn(
        "prose prose-slate dark:prose-invert max-w-none",
        className
      )}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}