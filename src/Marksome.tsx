import React, { HTMLAttributes, Key, ReactNode, useMemo } from 'react';
import { parseSegments, Segment } from './marksomeParser';

export type ReferenceRenderFunction = (
  key: Key,
  children: ReactNode,
) => ReactNode;

export type References = Record<string, string | ReferenceRenderFunction>;

export type MarksomeProps = HTMLAttributes<HTMLSpanElement> & {
  text: string;
  references?: References;
};

export default function Marksome({
  text,
  references,
  ...spanProps
}: MarksomeProps) {
  const segments = useMemo(() => {
    return parseSegments(text);
  }, [text]);

  return <span {...spanProps}>{renderSegments(segments, references)}</span>;
}

function renderSegments(
  segments: Segment[],
  references?: References,
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
        const referenceValue = references?.[segment.reference];

        const children = renderSegments(segment.content, references);

        if (!referenceValue) {
          if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line no-console
            console.warn(
              `Marksome: ${segment.reference} for reference-link is missing from references prop. Falling back to span.`,
            );
          }

          return <span key={segmentIndex}>{children}</span>;
        }

        if (typeof referenceValue === 'string') {
          return (
            <a key={segmentIndex} href={referenceValue}>
              {children}
            </a>
          );
        }

        return referenceValue(segmentIndex, children);
      }
      default:
        return null;
    }
  });
}
