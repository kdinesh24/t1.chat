import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // Override code blocks to prevent hydration errors
  code: ({ node, inline, className, children, ...props }) => {
    return (
      <CodeBlock
        node={node}
        inline={inline}
        className={className}
        {...props}
      >
        {children}
      </CodeBlock>
    );
  },
  // Ensure pre elements and code blocks with div children are not nested inside p elements
  p: ({ children, ...props }) => {
    // Check if any child is a pre element
    const hasPreChild = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === 'pre'
    );
    
    // Check if any child is a code element that might contain div children (like CodeBlock)
    const hasCodeWithDivChild = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === 'code'
    );
    
    if (hasPreChild || hasCodeWithDivChild) {
      // If there's a pre child or code child, render children directly without p wrapper
      return <>{children}</>;
    }
    
    return <p className="mb-4 leading-relaxed" {...props}>{children}</p>;
  },
  // Keep a semantic <pre> wrapper for SSR; Shiki will inject its own <pre class="shiki"> inside
  pre: ({ children, ...props }) => (
    <pre {...props} className="text-sm w-full overflow-x-auto my-4">
      {children}
    </pre>
  ),
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
  table: ({ node, children, ...props }) => {
    return (
      <div className="my-4 overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm text-left text-foreground" {...props}>
          {children}
        </table>
      </div>
    );
  },
  thead: ({ node, children, ...props }) => {
    return (
      <thead className="bg-muted border-b border-border" {...props}>
        {children}
      </thead>
    );
  },
  tr: ({ node, children, ...props }) => {
    return (
      <tr
        className="bg-background border-b border-border last:border-b-0 hover:bg-muted transition-colors duration-200"
        {...props}
      >
        {children}
      </tr>
    );
  },
  th: ({ node, children, ...props }) => {
    return (
      <th
        scope="col"
        className="px-4 py-3 font-semibold text-foreground"
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ node, children, ...props }) => {
    return (
      <td className="px-4 py-3 align-top text-foreground" {...props}>
        {children}
      </td>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);