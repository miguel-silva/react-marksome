export type Segment = InlineStyleSegment | ReferenceLinkSegment | string;

type InlineStyleSegment = {
  type: 'strong' | 'emphasis';
  content: Segment[];
};

type ReferenceLinkSegment = {
  type: 'reference-link';
  content: Segment[];
  reference: string;
};

type Match = InlineStyleMatch | ReferenceLinkMatch;

type InlineStyleMatch = {
  type: 'strong' | 'emphasis';
  startIndex: number;
  endIndex: number;
  innerText: string;
  offset: number;
};

type ReferenceLinkMatch = {
  type: 'reference-link';
  startIndex: number;
  endIndex: number;
  innerText: string;
  offset: number;
  reference: string;
};

const STRONG_TEXT_REGEXP = /([*_])\1\1?((?:\[.*?\][([].*?[)\]]|.)*?)\1?\1\1/g;

const EMPHASIZED_TEXT_REGEXP = /([*_])((?:\[.*?\][([].*?[)\]]|.)*?)\1/g;

const REFERENCE_LINK_TEXT_REGEXP = /\[([^\]]*)\] ?\[([^\]]*)\]/g;

export function parseSegments(text: string): Segment[] {
  const matches: Match[] = [];

  Array.from(text.matchAll(REFERENCE_LINK_TEXT_REGEXP)).forEach(
    (referenceLinkRegExpMatch) => {
      const innerText = referenceLinkRegExpMatch[1];
      const reference = referenceLinkRegExpMatch[2];
      const startIndex = referenceLinkRegExpMatch.index;

      if (!innerText || !reference || startIndex == null) {
        return;
      }

      const endIndex = startIndex + referenceLinkRegExpMatch[0].length;

      matches.push({
        type: 'reference-link',
        innerText,
        reference,
        startIndex,
        endIndex,
        offset: 1,
      });
    },
  );

  Array.from(text.matchAll(STRONG_TEXT_REGEXP)).forEach((strongRegExpMatch) => {
    const inlineMatch = getInlineMatchFromRegexpMatch(
      strongRegExpMatch,
      'strong',
    );

    if (inlineMatch) {
      matches.push(inlineMatch);
    }
  });

  Array.from(text.matchAll(EMPHASIZED_TEXT_REGEXP)).forEach(
    (emphasisRegExpMatch) => {
      const inlineMatch = getInlineMatchFromRegexpMatch(
        emphasisRegExpMatch,
        'emphasis',
      );

      if (inlineMatch) {
        matches.push(inlineMatch);
      }
    },
  );

  matches.sort((a, b) => a.startIndex - b.startIndex);

  return getSegmentsFromMatches(text, matches);
}

function getInlineMatchFromRegexpMatch(
  regexpMatch: RegExpMatchArray,
  inlineType: 'strong' | 'emphasis',
): InlineStyleMatch | undefined {
  const startIndex = regexpMatch.index;

  const innerText = regexpMatch[2];

  if (startIndex == null || !innerText) {
    return;
  }

  const decoratedText = regexpMatch[0];

  const offset = decoratedText.indexOf(innerText);

  const endIndex = startIndex + decoratedText.length;

  return {
    type: inlineType,
    startIndex,
    endIndex,
    innerText,
    offset,
  };
}

function getSegmentsFromMatches(text: string, matches: Match[]): Segment[] {
  if (!matches.length) {
    return [text];
  }

  const firstMatchStartIndex = matches[0].startIndex;

  const segments: Segment[] =
    firstMatchStartIndex > 0 ? [text.slice(0, firstMatchStartIndex)] : [];

  while (matches.length) {
    const currentMatch = matches.shift()!;

    const currentMatchTextStart = currentMatch.startIndex + currentMatch.offset;

    const innerMatches: Match[] = [];

    for (let i = 0; i < matches.length; ) {
      const otherMatch = matches[i];

      // if not an inner match, continue to the next
      if (otherMatch.endIndex > currentMatch.endIndex) {
        i++;

        continue;
      }

      // remove it from matches
      matches.splice(i, 1);

      otherMatch.startIndex -= currentMatchTextStart;
      otherMatch.endIndex -= currentMatchTextStart;

      innerMatches.push(otherMatch);
    }

    const content = getSegmentsFromMatches(
      currentMatch.innerText,
      innerMatches,
    );

    if (currentMatch.type === 'reference-link') {
      segments.push({
        type: currentMatch.type,
        content,
        reference: currentMatch.reference,
      });
    } else {
      segments.push({
        type: currentMatch.type,
        content,
      });
    }

    const textAfterLastMatch = matches.length
      ? text.slice(currentMatch.endIndex, matches[0].startIndex)
      : text.slice(currentMatch.endIndex);

    if (textAfterLastMatch) {
      segments.push(textAfterLastMatch);
    }
  }

  return segments;
}
