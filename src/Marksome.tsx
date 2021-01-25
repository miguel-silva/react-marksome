import React, { HTMLAttributes, ReactNode, useMemo } from 'react';
import { parseSegments, Segment } from './marksomeParser';

type Props = HTMLAttributes<HTMLSpanElement> & {
  text: string;
  references?: Record<string, string>;
};

export default function Marksome({ text, references, ...spanProps }: Props) {
  const segments = useMemo(() => {
    return parseSegments(text);
  }, [text]);

  return <span {...spanProps}>{renderSegments(segments, references)}</span>;
}

function renderSegments(
  segments: Segment[],
  references?: Record<string, string>,
): ReactNode {
  return segments.map((segment, segmentIndex) => {
    if (typeof segment === 'string') {
      return segment;
    }

    switch (segment.type) {
      case 'strong':
        return (
          <strong key={segmentIndex}>
            {renderSegments(segment.content, references)}
          </strong>
        );

      case 'emphasis':
        return (
          <em key={segmentIndex}>
            {renderSegments(segment.content, references)}
          </em>
        );

      case 'reference-link': {
        const href = references?.[segment.reference];

        if (!href) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn(
              `Marksome: ${segment.reference} for reference-link is missing from references prop. Falling back to span.`,
            );
          }

          return (
            <span key={segmentIndex}>
              {renderSegments(segment.content, references)}
            </span>
          );
        }

        return (
          <a key={segmentIndex} href={href}>
            {renderSegments(segment.content, references)}
          </a>
        );
      }
      default:
        return null;
    }
  });
}
