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

type InlineStyleDelimiter = {
  char: '*' | '_';
  index: number;
  length: number;
  type: 'open' | 'close' | 'both';
};

type ReferenceLinkMatch = {
  type: 'reference-link';
  startIndex: number;
  endIndex: number;
  innerText: string;
  offset: number;
  reference: string;
};

// Capture [text][reference] or [reference] (taking into account escaped squared brackets)
const REFERENCE_LINK_REGEXP = /(?<!\\)(?:\\\\)*(?:\[(.+?)(?<!\\)(?:\\\\)*\])?\[((?:(?<!\\)(?:\\\\)*\\[[]|[^[])+?)(?<!\\)(?:\\\\)*\]/g;

// Capture sequence of '*' or '_' (non-escaped)
const EMPH_SEQUENCE_REGEXP = /(?<!\\)(?:\\\\)*(\*+|_+)/g;

const WHITESPACE_CHAR_REGEXP = /\s/;
const PUNCTUATION_CHAR_REGEXP = /[!"#$%&'()*+,.\/:;<=>?@[\\\]^_`{|}~-]/;

// subset of escapable markdown chars which are used as markers in this lib
const ESCAPABLE_CHAR_REGEXP = /\\([*[\\\]_])/g;

export function parseSegments(text: string): Segment[] {
  const matches: Match[] = [];

  const referenceLinkMatches: ReferenceLinkMatch[] = [];

  matchAll(REFERENCE_LINK_REGEXP, text, (referenceLinkRegExpMatch) => {
    const reference = referenceLinkRegExpMatch[2];
    const startIndex = referenceLinkRegExpMatch.index;

    const innerText = referenceLinkRegExpMatch[1] || reference;

    const endIndex = startIndex + referenceLinkRegExpMatch[0].length;

    const match: ReferenceLinkMatch = {
      type: 'reference-link',
      innerText,
      reference,
      startIndex,
      endIndex,
      offset: 1,
    };

    referenceLinkMatches.push(match);
    matches.push(match);
  });

  const pendingOpenersByBlockIndex = new Map<number, InlineStyleDelimiter[]>([
    [-1, []],
  ]);

  referenceLinkMatches.forEach((_match, index) => {
    pendingOpenersByBlockIndex.set(index, []);
  });

  let currentReferenceLinkIndex = 0;

  matchAll(EMPH_SEQUENCE_REGEXP, text, (emphCharRegExpMatch) => {
    const char = emphCharRegExpMatch[1][0] as '*' | '_';

    const length = emphCharRegExpMatch[0].length;

    const index = emphCharRegExpMatch.index;

    const previousCharInfo = analyseSurroundingChar(text[index - 1]);
    const nextCharInfo = analyseSurroundingChar(text[index + length]);

    const leftFlanking =
      nextCharInfo === 'other' ||
      (nextCharInfo === 'punctuation' && previousCharInfo !== 'other');
    const rightFlanking =
      previousCharInfo === 'other' ||
      (previousCharInfo === 'punctuation' && nextCharInfo !== 'other');

    let canOpen = leftFlanking;
    let canClose = rightFlanking;

    if (char === '_') {
      canOpen =
        leftFlanking && (!rightFlanking || previousCharInfo === 'punctuation');
      canClose =
        rightFlanking && (!leftFlanking || nextCharInfo === 'punctuation');
    }

    if (!canOpen && !canClose) {
      return;
    }

    // identify current delimiter block index
    let blockIndex = -1;

    for (
      ;
      currentReferenceLinkIndex < referenceLinkMatches.length;
      currentReferenceLinkIndex++
    ) {
      const currentReferenceLinkMatch =
        referenceLinkMatches[currentReferenceLinkIndex];

      // comes before the current block -> it's outside a block
      if (currentReferenceLinkMatch.startIndex > index) {
        break;
      }

      // comes after the current block -> check next block
      if (currentReferenceLinkMatch.endIndex <= index) {
        continue;
      }

      // it's inside the block but outside it's innerText -> ignore this emph char match
      if (
        currentReferenceLinkMatch.startIndex +
          currentReferenceLinkMatch.offset +
          currentReferenceLinkMatch.innerText.length <
        index
      ) {
        currentReferenceLinkIndex++;
        return;
      }

      blockIndex = currentReferenceLinkIndex;
      break;
    }

    const delimiter: InlineStyleDelimiter = {
      char,
      index,
      length,
      type: canOpen && canClose ? 'both' : canClose ? 'close' : 'open',
    };

    const pendingOpeners = pendingOpenersByBlockIndex.get(blockIndex)!;

    // can close -> look for last compatible opener
    if (delimiter.type !== 'open') {
      for (
        let pendingOpenerIndex = pendingOpeners.length - 1;
        pendingOpenerIndex >= 0;
        pendingOpenerIndex--
      ) {
        const pendingOpener = pendingOpeners[pendingOpenerIndex];

        // ensure that the pendingOpener is the same character
        if (pendingOpener.char !== delimiter.char) {
          continue;
        }

        // from spec (https://spec.commonmark.org/0.30/#emphasis-and-strong-emphasis rule 9)
        // If one of the delimiters can both open and close emphasis,
        // then the sum of the lengths of the delimiter runs containing the opening and closing delimiters
        // must not be a multiple of 3 unless both lengths are multiples of 3
        if (pendingOpener.type === 'both' || delimiter.type === 'both') {
          if ((pendingOpener.length + delimiter.length) % 3 === 0) {
            if (pendingOpener.length % 3 !== 0 || delimiter.length % 3 !== 0) {
              continue;
            }
          }
        }

        // it's a match!
        delimiter.type = 'close';

        const matchDelimiterLength = Math.min(
          delimiter.length,
          pendingOpener.length,
        );

        let matchDelimiterInnerOffset = 0;

        // for each pair -> extract strong based on matchDelimiterInnerOffset
        while (matchDelimiterLength - matchDelimiterInnerOffset > 1) {
          matches.push(
            createInlineStyleMatchFromDelimiters(
              text,
              'strong',
              pendingOpener,
              delimiter,
              matchDelimiterInnerOffset,
            ),
          );

          matchDelimiterInnerOffset += 2;
        }

        // if one left -> extract emphasis based on matchDelimiterInnerOffset
        if (matchDelimiterLength - matchDelimiterInnerOffset === 1) {
          matches.push(
            createInlineStyleMatchFromDelimiters(
              text,
              'emphasis',
              pendingOpener,
              delimiter,
              matchDelimiterInnerOffset,
            ),
          );
        }

        // if opener is wider than closer -> decrement from opener the diff
        if (pendingOpener.length > delimiter.length) {
          pendingOpener.length -= delimiter.length;

          // remove openers until current one (exclusive)
          pendingOpeners.splice(
            pendingOpenerIndex + 1,
            pendingOpeners.length - pendingOpenerIndex - 1,
          );
        } else {
          // remove openers until current one (inclusive)
          pendingOpeners.splice(
            pendingOpenerIndex,
            pendingOpeners.length - pendingOpenerIndex,
          );

          // if closer is wider than opener -> decrement from closer the diff and look for more openers
          if (pendingOpener.length < delimiter.length) {
            delimiter.length -= pendingOpener.length;
            delimiter.index += pendingOpener.length;

            continue;
          }
        }

        break;
      }
    }

    if (delimiter.type !== 'close') {
      pendingOpeners.push(delimiter);
    }
  });

  matches.sort((a, b) => a.startIndex - b.startIndex);

  return getSegmentsFromMatches(text, matches);
}

function matchAll(
  regexp: RegExp,
  text: string,
  onMatch: (match: RegExpExecArray) => void,
) {
  let match: RegExpExecArray | null;
  while ((match = regexp.exec(text)) !== null) {
    onMatch(match);
  }
}

function createInlineStyleMatchFromDelimiters(
  text: string,
  type: 'strong' | 'emphasis',
  opener: InlineStyleDelimiter,
  closer: InlineStyleDelimiter,
  matchDelimiterInnerOffset: number,
): InlineStyleMatch {
  const innerTextStartIndex =
    opener.index + opener.length - matchDelimiterInnerOffset;
  const innerTextEndIndex = closer.index + matchDelimiterInnerOffset;

  const offset = type === 'strong' ? 2 : 1;

  return {
    type,
    startIndex: innerTextStartIndex - offset,
    endIndex: innerTextEndIndex + offset,
    innerText: text.slice(innerTextStartIndex, innerTextEndIndex),
    offset,
  };
}

function analyseSurroundingChar(
  char: string | undefined,
): 'whitespace' | 'punctuation' | 'other' {
  if (!char || WHITESPACE_CHAR_REGEXP.exec(char)) {
    return 'whitespace';
  }

  if (PUNCTUATION_CHAR_REGEXP.exec(char)) {
    return 'punctuation';
  }

  return 'other';
}

function getSegmentsFromMatches(text: string, matches: Match[]): Segment[] {
  if (!matches.length) {
    return [text.replace(ESCAPABLE_CHAR_REGEXP, '$1')];
  }

  const firstMatchStartIndex = matches[0].startIndex;

  const segments: Segment[] =
    firstMatchStartIndex > 0
      ? [
          text
            .slice(0, firstMatchStartIndex)
            .replace(ESCAPABLE_CHAR_REGEXP, '$1'),
        ]
      : [];

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
      segments.push(textAfterLastMatch.replace(ESCAPABLE_CHAR_REGEXP, '$1'));
    }
  }

  return segments;
}
