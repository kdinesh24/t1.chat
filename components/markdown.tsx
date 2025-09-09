import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre: ({ children, ...props }) => {
    
    const codeBlock = React.Children.toArray(children).find(
      (child: any) =>
        child.type === CodeBlock || child.type?.name === 'CodeBlock',
    );

    if (codeBlock) {
      return <>{codeBlock}</>;
    }

    return (
      <pre
        className="not-prose text-sm w-full overflow-x-auto p-4 border border-zinc-200 dark:border-black rounded-xl dark:text-zinc-50 text-zinc-900"
        style={{ backgroundColor: '#273b3b' }}
        {...props}
      >
        {children}
      </pre>
    );
  },
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
        className="text-blue-500 hover:underline"
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
  table: ({ children, ...props }) => (
    <div
      className="my-6 overflow-x-auto rounded-lg"
      style={{ backgroundColor: '#1a2929' }}
    >
      <table className="min-w-full" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => (
    <thead style={{ backgroundColor: '#374141' }} {...props}>
      {children}
    </thead>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider"
      style={{ backgroundColor: '#273b3b' }}
      {...props}
    >
      {children}
    </th>
  ),
  tbody: ({ children, ...props }) => (
    <tbody
      className="divide-y"
      style={
        {
          backgroundColor: '#1a2929',
          '--tw-divide-opacity': '1',
          '--tw-divide-color': '#273b3b',
        } as React.CSSProperties
      }
      {...props}
    >
      {children}
    </tbody>
  ),
  tr: ({ children, ...props }) => (
    <tr className="hover:bg-[#273b3b]" {...props}>
      {children}
    </tr>
  ),
  td: ({ children, ...props }) => (
    <td
      className="px-6 py-4 whitespace-nowrap text-sm text-zinc-100"
      style={{ backgroundColor: '#1a2929' }}
      {...props}
    >
      {children}
    </td>
  ),
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
};

const remarkPlugins = [remarkGfm];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <div className="w-full min-w-0">
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
