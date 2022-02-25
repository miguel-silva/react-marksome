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
  type: '<' | '>' | '<>';
};

type ReferenceLinkMatch = {
  type: 'reference-link';
  startIndex: number;
  endIndex: number;
  innerText: string;
  offset: number;
  reference: string;
};

// Capture [text][reference] or [reference]
const REFERENCE_LINK_REGEXP = /(?:\[(.+?)\])?\[([^[\]]+)?\]/g;

// Capture sequence of '*' or '_'
const EMPH_SEQUENCE_REGEXP = /(\*+|_+)/g;

export function parseSegments(text: string): Segment[] {
  const matches: Match[] = [];

  const pendingOpenersByBlockIndex = new Map<number, InlineStyleDelimiter[]>([
    [-1, []],
  ]);

  const referenceLinkMatches: ReferenceLinkMatch[] = [];

  matchAll(REFERENCE_LINK_REGEXP, text, (referenceLinkRegExpMatch) => {
    const reference = referenceLinkRegExpMatch[2];
    let startIndex = referenceLinkRegExpMatch.index;
    const endIndex = startIndex + referenceLinkRegExpMatch[0].length;

    let innerText = referenceLinkRegExpMatch[1];
    let referenceBlockStartIndex: number;

    if (innerText) {
      // it was matched as a shortcut reference link `[innerText][reference]`
      referenceBlockStartIndex = innerText.length + 2;

      // if the innerText is escaped -> discard the innerText block
      if (
        isCharEscaped(text, startIndex) ||
        isCharEscaped(text, innerText.length + 1)
      ) {
        startIndex = referenceBlockStartIndex;
        innerText = reference;
      }
    } else {
      // it was matched as a shortcut reference link `[reference]`
      innerText = reference;
      referenceBlockStartIndex = startIndex;
    }

    // if the reference block is escaped -> discard this whole match
    if (
      isCharEscaped(text, referenceBlockStartIndex) ||
      isCharEscaped(text, endIndex - 1)
    ) {
      return;
    }

    const match: ReferenceLinkMatch = {
      type: 'reference-link',
      innerText,
      reference,
      startIndex,
      endIndex,
      offset: 1,
    };

    pendingOpenersByBlockIndex.set(referenceLinkMatches.length, []);

    referenceLinkMatches.push(match);
    matches.push(match);
  });

  let currentReferenceLinkIndex = 0;

  matchAll(EMPH_SEQUENCE_REGEXP, text, (emphCharRegExpMatch) => {
    let index = emphCharRegExpMatch.index;
    let length = emphCharRegExpMatch[0].length;

    // if the first char of the sequence is escaped
    if (isCharEscaped(text, index)) {
      if (length === 1) {
        return;
      }

      // ignore the escaped char
      index++;
      length--;
    }

    const char = emphCharRegExpMatch[1][0] as '*' | '_';

    const previousCharInfo = getCharInfo(text[index - 1]);
    const nextCharInfo = getCharInfo(text[index + length]);

    const leftFlanking =
      !nextCharInfo || (nextCharInfo === '.' && !!previousCharInfo);
    const rightFlanking =
      !previousCharInfo || (previousCharInfo === '.' && !!nextCharInfo);

    let canOpen = leftFlanking;
    let canClose = rightFlanking;

    if (char === '_') {
      canOpen = leftFlanking && (!rightFlanking || previousCharInfo === '.');
      canClose = rightFlanking && (!leftFlanking || nextCharInfo === '.');
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
      type: canOpen && canClose ? '<>' : canClose ? '>' : '<',
    };

    const pendingOpeners = pendingOpenersByBlockIndex.get(blockIndex)!;

    // can close -> look for last compatible opener
    if (delimiter.type !== '<') {
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
        if (pendingOpener.type === '<>' || delimiter.type === '<>') {
          if ((pendingOpener.length + delimiter.length) % 3 === 0) {
            if (pendingOpener.length % 3 || delimiter.length % 3) {
              continue;
            }
          }
        }

        // it's a match!
        delimiter.type = '>';

        let matchDelimiterLength = Math.min(
          delimiter.length,
          pendingOpener.length,
        );

        // for each pair -> extract strong based on matchDelimiterInnerOffset
        while (matchDelimiterLength > 1) {
          matches.push(
            createInlineStyleMatch(text, 'strong', pendingOpener, delimiter),
          );

          matchDelimiterLength -= 2;
        }

        // if one left -> extract emphasis based on matchDelimiterInnerOffset
        if (matchDelimiterLength) {
          matches.push(
            createInlineStyleMatch(text, 'emphasis', pendingOpener, delimiter),
          );
        }

        // if opener is wider than closer
        if (pendingOpener.length) {
          // remove openers until current one (exclusive)
          pendingOpeners.splice(pendingOpenerIndex + 1);
        } else {
          // remove openers until current one (inclusive)
          pendingOpeners.splice(pendingOpenerIndex);

          // if closer is wider than opener -> look for more openers
          if (delimiter.length) {
            continue;
          }
        }

        break;
      }
    }

    if (delimiter.type !== '>') {
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

function createInlineStyleMatch(
  text: string,
  type: 'strong' | 'emphasis',
  opener: InlineStyleDelimiter,
  closer: InlineStyleDelimiter,
): InlineStyleMatch {
  const innerTextStartIndex = opener.index + opener.length;
  const innerTextEndIndex = closer.index;

  const offset = type === 'strong' ? 2 : 1;

  // adjust delimiters
  opener.length -= offset;
  closer.length -= offset;
  closer.index += offset;

  return {
    type,
    startIndex: innerTextStartIndex - offset,
    endIndex: innerTextEndIndex + offset,
    innerText: text.slice(innerTextStartIndex, innerTextEndIndex),
    offset,
  };
}

function getCharInfo(char: string | undefined): ' ' | '.' | undefined {
  // detect spaces
  if (!char || /\s/.exec(char)) {
    return ' ';
  }

  // detect punctuation
  if (/[!"#$%&'()*+,.\/:;<=>?@[\\\]^_`{|}~-]/.exec(char)) {
    return '.';
  }

  return;
}

function getSegmentsFromMatches(text: string, matches: Match[]): Segment[] {
  if (!matches.length) {
    return [unescapeText(text)];
  }

  const firstMatchStartIndex = matches[0].startIndex;

  const segments: Segment[] =
    firstMatchStartIndex > 0
      ? [unescapeText(text.slice(0, firstMatchStartIndex))]
      : [];

  while (matches.length) {
    const currentMatch = matches.shift()!;

    const currentMatchTextStart = currentMatch.startIndex + currentMatch.offset;

    const innerMatches: Match[] = [];

    // find innerMatches
    while (matches.length && matches[0].endIndex < currentMatch.endIndex) {
      const otherMatch = matches.shift()!;

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
      segments.push(unescapeText(textAfterLastMatch));
    }
  }

  return segments;
}

function isCharEscaped(text: string, charIndex: number): boolean {
  let isEscaped = false;

  let currentCharIndex = charIndex;

  while (text[--currentCharIndex] === '\\') {
    isEscaped = !isEscaped;
  }

  return isEscaped;
}

function unescapeText(text: string) {
  // subset of escapable markdown chars which are used as markers in this lib
  return text.replace(/\\([*[\\\]_])/g, '$1');
}
