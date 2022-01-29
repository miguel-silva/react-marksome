import { parseSegments } from '../src';

// https://spec.commonmark.org/0.30/#emphasis-and-strong-emphasis
describe('emphasis parsing (commonmark spec)', () => {
  const EMPH_START_EXAMPLE = 350;

  [
    {
      text: '*foo bar*',
      expected: [{ type: 'emphasis', content: ['foo bar'] }],
    },
    {
      text: 'a * foo bar*',
      expected: ['a * foo bar*'],
    },
    {
      text: 'a*"foo"*',
      expected: ['a*"foo"*'],
      exceptions: 'quotes not escaped',
    },
    {
      text: '* a *',
      expected: ['* a *'],
    },
    {
      text: 'foo*bar*',
      expected: ['foo', { type: 'emphasis', content: ['bar'] }],
    },
    {
      text: '5*6*78',
      expected: ['5', { type: 'emphasis', content: ['6'] }, '78'],
    },
    {
      text: '_foo bar_',
      expected: [{ type: 'emphasis', content: ['foo bar'] }],
    },
    {
      text: '_ foo bar_',
      expected: ['_ foo bar_'],
    },
    {
      text: 'a_"foo"_',
      expected: ['a_"foo"_'],
      exceptions: 'quotes not escaped',
    },
    {
      text: 'foo_bar_',
      expected: ['foo_bar_'],
    },
    {
      text: '5_6_78',
      expected: ['5_6_78'],
    },
    {
      text: 'пристаням_стремятся_',
      expected: ['пристаням_стремятся_'],
    },
    {
      text: 'aa_"bb"_cc',
      expected: ['aa_"bb"_cc'],
      exceptions: 'quotes not escaped',
    },
    {
      text: 'foo-_(bar)_',
      expected: ['foo-', { type: 'emphasis', content: ['(bar)'] }],
    },
    {
      text: '_foo*',
      expected: ['_foo*'],
    },
    {
      text: '*foo bar *',
      expected: ['*foo bar *'],
    },
    {
      text: '*foo bar\n*',
      expected: ['*foo bar\n*'],
    },
    {
      text: '*(*foo)',
      expected: ['*(*foo)'],
    },
    {
      text: '*(*foo*)*',
      expected: [
        {
          type: 'emphasis',
          content: ['(', { type: 'emphasis', content: ['foo'] }, ')'],
        },
      ],
    },
    {
      text: '*foo*bar',
      expected: [
        {
          type: 'emphasis',
          content: ['foo'],
        },
        'bar',
      ],
    },
    {
      text: '_foo bar _',
      expected: ['_foo bar _'],
    },
    {
      text: '_(_foo)',
      expected: ['_(_foo)'],
    },
    {
      text: '_(_foo_)_',
      expected: [
        {
          type: 'emphasis',
          content: ['(', { type: 'emphasis', content: ['foo'] }, ')'],
        },
      ],
    },
    {
      text: '_foo_bar',
      expected: ['_foo_bar'],
    },
    {
      text: '_пристаням_стремятся',
      expected: ['_пристаням_стремятся'],
    },
    {
      text: '_foo_bar_baz_',
      expected: [
        {
          type: 'emphasis',
          content: ['foo_bar_baz'],
        },
      ],
    },
    {
      text: '_(bar)_.',
      expected: [
        {
          type: 'emphasis',
          content: ['(bar)'],
        },
        '.',
      ],
    },
    {
      text: '**foo bar**',
      expected: [
        {
          type: 'strong',
          content: ['foo bar'],
        },
      ],
    },
    {
      text: '** foo bar**',
      expected: ['** foo bar**'],
    },
    {
      text: 'a**"foo"**',
      expected: ['a**"foo"**'],
      exceptions: 'quotes not escaped',
    },
    {
      text: 'foo**bar**',
      expected: [
        'foo',
        {
          type: 'strong',
          content: ['bar'],
        },
      ],
    },
    {
      text: '__foo bar__',
      expected: [
        {
          type: 'strong',
          content: ['foo bar'],
        },
      ],
    },
    {
      text: '__ foo bar__',
      expected: ['__ foo bar__'],
    },
    {
      text: '__\nfoo bar__',
      expected: ['__\nfoo bar__'],
    },
    {
      text: 'a__"foo"__',
      expected: ['a__"foo"__'],
      exceptions: 'quotes not escaped',
    },
    {
      text: 'foo__bar__',
      expected: ['foo__bar__'],
    },
    {
      text: '5__6__78',
      expected: ['5__6__78'],
    },
    {
      text: 'пристаням__стремятся__',
      expected: ['пристаням__стремятся__'],
    },
    {
      text: '__foo, __bar__, baz__',
      expected: [
        {
          type: 'strong',
          content: [
            'foo, ',
            {
              type: 'strong',
              content: ['bar'],
            },
            ', baz',
          ],
        },
      ],
    },
    {
      text: 'foo-__(bar)__',
      expected: [
        'foo-',
        {
          type: 'strong',
          content: ['(bar)'],
        },
      ],
    },
    {
      text: '**foo bar **',
      expected: ['**foo bar **'],
    },
    {
      text: '**(**foo)',
      expected: ['**(**foo)'],
    },
    {
      text: '*(**foo**)*',
      expected: [
        {
          type: 'emphasis',
          content: ['(', { type: 'strong', content: ['foo'] }, ')'],
        },
      ],
    },
    {
      text:
        '**Gomphocarpus (*Gomphocarpus physocarpus*, syn.\n*Asclepias physocarpa*)**',
      expected: [
        {
          type: 'strong',
          content: [
            'Gomphocarpus (',
            { type: 'emphasis', content: ['Gomphocarpus physocarpus'] },
            ', syn.\n',
            { type: 'emphasis', content: ['Asclepias physocarpa'] },
            ')',
          ],
        },
      ],
    },
    {
      text: '**foo "*bar*" foo**',
      expected: [
        {
          type: 'strong',
          content: ['foo "', { type: 'emphasis', content: ['bar'] }, '" foo'],
        },
      ],
      exceptions: 'quotes not escaped',
    },
    {
      text: '**foo**bar',
      expected: [
        {
          type: 'strong',
          content: ['foo'],
        },
        'bar',
      ],
    },
    {
      text: '__foo bar __',
      expected: ['__foo bar __'],
    },
    {
      text: '__(__foo)',
      expected: ['__(__foo)'],
    },
    {
      text: '_(__foo__)_',
      expected: [
        {
          type: 'emphasis',
          content: ['(', { type: 'strong', content: ['foo'] }, ')'],
        },
      ],
    },
    {
      text: '__foo__bar',
      expected: ['__foo__bar'],
    },
    {
      text: '__пристаням__стремятся',
      expected: ['__пристаням__стремятся'],
    },
    {
      text: '__foo__bar__baz__',
      expected: [{ type: 'strong', content: ['foo__bar__baz'] }],
    },
    {
      text: '__(bar)__.',
      expected: [{ type: 'strong', content: ['(bar)'] }, '.'],
    },
    {
      text: '*foo [bar][1]*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            { type: 'reference-link', content: ['bar'], reference: '1' },
          ],
        },
      ],
      exceptions: "doesn't parse markdown link blocks",
    },
    {
      text: '*foo\nbar*',
      expected: [
        {
          type: 'emphasis',
          content: ['foo\nbar'],
        },
      ],
    },
    {
      text: '_foo __bar__ baz_',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'strong',
              content: ['bar'],
            },
            ' baz',
          ],
        },
      ],
    },
    {
      text: '_foo _bar_ baz_',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'emphasis',
              content: ['bar'],
            },
            ' baz',
          ],
        },
      ],
    },
    {
      text: '__foo_ bar_',
      expected: [
        {
          type: 'emphasis',
          content: [
            {
              type: 'emphasis',
              content: ['foo'],
            },
            ' bar',
          ],
        },
      ],
    },
    {
      text: '*foo *bar**',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'emphasis',
              content: ['bar'],
            },
          ],
        },
      ],
    },
    {
      text: '*foo **bar** baz*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'strong',
              content: ['bar'],
            },
            ' baz',
          ],
        },
      ],
    },
    {
      text: '*foo**bar**baz*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo',
            {
              type: 'strong',
              content: ['bar'],
            },
            'baz',
          ],
        },
      ],
    },
    {
      text: '*foo**bar*',
      expected: [
        {
          type: 'emphasis',
          content: ['foo**bar'],
        },
      ],
    },
    {
      text: '***foo** bar*',
      expected: [
        {
          type: 'emphasis',
          content: [
            {
              type: 'strong',
              content: ['foo'],
            },
            ' bar',
          ],
        },
      ],
    },
    {
      text: '*foo **bar***',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'strong',
              content: ['bar'],
            },
          ],
        },
      ],
    },
    {
      text: '*foo**bar***',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo',
            {
              type: 'strong',
              content: ['bar'],
            },
          ],
        },
      ],
    },
    {
      text: 'foo***bar***baz',
      expected: [
        'foo',
        {
          type: 'emphasis',
          content: [
            {
              type: 'strong',
              content: ['bar'],
            },
          ],
        },
        'baz',
      ],
    },
    {
      text: 'foo******bar*********baz',
      expected: [
        'foo',
        {
          type: 'strong',
          content: [
            {
              type: 'strong',
              content: [
                {
                  type: 'strong',
                  content: ['bar'],
                },
              ],
            },
          ],
        },
        '***baz',
      ],
    },
    {
      text: '*foo **bar *baz* bim** bop*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'strong',
              content: ['bar ', { type: 'emphasis', content: ['baz'] }, ' bim'],
            },
            ' bop',
          ],
        },
      ],
    },
    {
      text: '*foo [*bar*][1]*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            {
              type: 'reference-link',
              content: [
                {
                  type: 'emphasis',
                  content: ['bar'],
                },
              ],
              reference: '1',
            },
          ],
        },
      ],
      exceptions: "doesn't parse markdown link blocks",
    },
    {
      text: '** is not an empty emphasis',
      expected: ['** is not an empty emphasis'],
    },
    {
      text: '**** is not an empty strong emphasis',
      expected: ['**** is not an empty strong emphasis'],
    },
    {
      text: '**foo [bar][1]**',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'reference-link',
              content: ['bar'],
              reference: '1',
            },
          ],
        },
      ],
      exceptions: "doesn't parse markdown link blocks",
    },
    {
      text: '**foo\nbar**',
      expected: [
        {
          type: 'strong',
          content: ['foo\nbar'],
        },
      ],
    },
    {
      text: '__foo _bar_ baz__',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'emphasis',
              content: ['bar'],
            },
            ' baz',
          ],
        },
      ],
    },
    {
      text: '__foo __bar__ baz__',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'strong',
              content: ['bar'],
            },
            ' baz',
          ],
        },
      ],
    },
    {
      text: '____foo__ bar__',
      expected: [
        {
          type: 'strong',
          content: [
            {
              type: 'strong',
              content: ['foo'],
            },
            ' bar',
          ],
        },
      ],
    },
    {
      text: '**foo **bar****',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'strong',
              content: ['bar'],
            },
          ],
        },
      ],
    },
    {
      text: '**foo *bar* baz**',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'emphasis',
              content: ['bar'],
            },
            ' baz',
          ],
        },
      ],
    },
    {
      text: '**foo*bar*baz**',
      expected: [
        {
          type: 'strong',
          content: [
            'foo',
            {
              type: 'emphasis',
              content: ['bar'],
            },
            'baz',
          ],
        },
      ],
    },
    {
      text: '***foo* bar**',
      expected: [
        {
          type: 'strong',
          content: [
            {
              type: 'emphasis',
              content: ['foo'],
            },
            ' bar',
          ],
        },
      ],
    },
    {
      text: '**foo *bar***',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'emphasis',
              content: ['bar'],
            },
          ],
        },
      ],
    },
    {
      text: '**foo *bar **baz**\nbim* bop**',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'emphasis',
              content: [
                'bar ',
                {
                  type: 'strong',
                  content: ['baz'],
                },
                '\nbim',
              ],
            },
            ' bop',
          ],
        },
      ],
    },
    {
      text: '**foo [*bar*][1]**',
      expected: [
        {
          type: 'strong',
          content: [
            'foo ',
            {
              type: 'reference-link',
              content: [
                {
                  type: 'emphasis',
                  content: ['bar'],
                },
              ],
              reference: '1',
            },
          ],
        },
      ],
      exceptions: "doesn't parse markdown link blocks",
    },
    {
      text: '__ is not an empty emphasis',
      expected: ['__ is not an empty emphasis'],
    },
    {
      text: '____ is not an empty strong emphasis',
      expected: ['____ is not an empty strong emphasis'],
    },
    {
      text: 'foo ***',
      expected: ['foo ***'],
    },
    {
      text: 'foo *\\**',
      expected: [
        'foo ',
        {
          type: 'emphasis',
          content: ['*'],
        },
      ],
    },
    {
      text: 'foo *_*',
      expected: [
        'foo ',
        {
          type: 'emphasis',
          content: ['_'],
        },
      ],
    },
    {
      text: 'foo *****',
      expected: ['foo *****'],
    },
    {
      text: 'foo **\\***',
      expected: [
        'foo ',
        {
          type: 'strong',
          content: ['*'],
        },
      ],
    },
    {
      text: 'foo **_**',
      expected: [
        'foo ',
        {
          type: 'strong',
          content: ['_'],
        },
      ],
    },
    {
      text: '**foo*',
      expected: [
        '*',
        {
          type: 'emphasis',
          content: ['foo'],
        },
      ],
    },
    {
      text: '*foo**',
      expected: [
        {
          type: 'emphasis',
          content: ['foo'],
        },
        '*',
      ],
    },
    {
      text: '***foo**',
      expected: [
        '*',
        {
          type: 'strong',
          content: ['foo'],
        },
      ],
    },
    {
      text: '****foo*',
      expected: [
        '***',
        {
          type: 'emphasis',
          content: ['foo'],
        },
      ],
    },
    {
      text: '**foo***',
      expected: [
        {
          type: 'strong',
          content: ['foo'],
        },
        '*',
      ],
    },
    {
      text: '*foo****',
      expected: [
        {
          type: 'emphasis',
          content: ['foo'],
        },
        '***',
      ],
    },
    {
      text: 'foo ___',
      expected: ['foo ___'],
    },
    {
      text: 'foo _\\__',
      expected: [
        'foo ',
        {
          type: 'emphasis',
          content: ['_'],
        },
      ],
    },
    {
      text: 'foo _*_',
      expected: [
        'foo ',
        {
          type: 'emphasis',
          content: ['*'],
        },
      ],
    },
    {
      text: 'foo _____',
      expected: ['foo _____'],
    },
    {
      text: 'foo __\\___',
      expected: [
        'foo ',
        {
          type: 'strong',
          content: ['_'],
        },
      ],
    },
    {
      text: 'foo __*__',
      expected: [
        'foo ',
        {
          type: 'strong',
          content: ['*'],
        },
      ],
    },
    {
      text: '__foo_',
      expected: [
        '_',
        {
          type: 'emphasis',
          content: ['foo'],
        },
      ],
    },
    {
      text: '_foo__',
      expected: [
        {
          type: 'emphasis',
          content: ['foo'],
        },
        '_',
      ],
    },
    {
      text: '___foo__',
      expected: [
        '_',
        {
          type: 'strong',
          content: ['foo'],
        },
      ],
    },
    {
      text: '____foo_',
      expected: [
        '___',
        {
          type: 'emphasis',
          content: ['foo'],
        },
      ],
    },
    {
      text: '__foo___',
      expected: [
        {
          type: 'strong',
          content: ['foo'],
        },
        '_',
      ],
    },
    {
      text: '_foo____',
      expected: [
        {
          type: 'emphasis',
          content: ['foo'],
        },
        '___',
      ],
    },
    {
      text: '**foo**',
      expected: [
        {
          type: 'strong',
          content: ['foo'],
        },
      ],
    },
    {
      text: '*_foo_*',
      expected: [
        {
          type: 'emphasis',
          content: [
            {
              type: 'emphasis',
              content: ['foo'],
            },
          ],
        },
      ],
    },
    {
      text: '__foo__',
      expected: [
        {
          type: 'strong',
          content: ['foo'],
        },
      ],
    },
    {
      text: '_*foo*_',
      expected: [
        {
          type: 'emphasis',
          content: [
            {
              type: 'emphasis',
              content: ['foo'],
            },
          ],
        },
      ],
    },
    {
      text: '****foo****',
      expected: [
        {
          type: 'strong',
          content: [
            {
              type: 'strong',
              content: ['foo'],
            },
          ],
        },
      ],
    },
    {
      text: '____foo____',
      expected: [
        {
          type: 'strong',
          content: [
            {
              type: 'strong',
              content: ['foo'],
            },
          ],
        },
      ],
    },
    {
      text: '******foo******',
      expected: [
        {
          type: 'strong',
          content: [
            {
              type: 'strong',
              content: [
                {
                  type: 'strong',
                  content: ['foo'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      text: '***foo***',
      expected: [
        {
          type: 'emphasis',
          content: [
            {
              type: 'strong',
              content: ['foo'],
            },
          ],
        },
      ],
    },
    {
      text: '_____foo_____',
      expected: [
        {
          type: 'emphasis',
          content: [
            {
              type: 'strong',
              content: [
                {
                  type: 'strong',
                  content: ['foo'],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      text: '*foo _bar* baz_',
      expected: [
        {
          type: 'emphasis',
          content: ['foo _bar'],
        },
        ' baz_',
      ],
    },
    {
      text: '*foo __bar *baz bim__ bam*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'foo ',
            { type: 'strong', content: ['bar *baz bim'] },
            ' bam',
          ],
        },
      ],
    },
    {
      text: '**foo **bar baz**',
      expected: [
        '**foo ',
        {
          type: 'strong',
          content: ['bar baz'],
        },
      ],
    },
    {
      text: '*foo *bar baz*',
      expected: [
        '*foo ',
        {
          type: 'emphasis',
          content: ['bar baz'],
        },
      ],
    },
    {
      text: '*[bar*][1]',
      expected: [
        '*',
        { type: 'reference-link', content: ['bar*'], reference: '1' },
      ],
      exceptions: "doesn't parse markdown link blocks",
    },
    {
      text: '_foo [bar_][1]',
      expected: [
        '_foo ',
        { type: 'reference-link', content: ['bar_'], reference: '1' },
      ],
      exceptions: "doesn't parse markdown link blocks",
    },
    {
      text: '*[*][foo]',
      expected: [
        '*',
        { type: 'reference-link', content: ['*'], reference: 'foo' },
      ],
      exceptions: "doesn't parse html tags",
    },
    {
      text: '**[foo][**]',
      expected: [
        '**',
        { type: 'reference-link', content: ['foo'], reference: '**' },
      ],
      exceptions: "doesn't parse html tags",
    },
    {
      text: '__[foo][__]',
      expected: [
        '__',
        { type: 'reference-link', content: ['foo'], reference: '__' },
      ],
      exceptions: "doesn't parse html tags",
    },
    {
      text: '*a [*][1]*',
      expected: [
        {
          type: 'emphasis',
          content: [
            'a ',
            { type: 'reference-link', content: ['*'], reference: '1' },
          ],
        },
      ],
      exceptions: "doesn't parse code blocks",
    },
    {
      text: '_a [_][1]_',
      expected: [
        {
          type: 'emphasis',
          content: [
            'a ',
            { type: 'reference-link', content: ['_'], reference: '1' },
          ],
        },
      ],
      exceptions: "doesn't parse code blocks",
    },
    {
      text: '**a[http://foo.bar/?q=**][1]',
      expected: [
        '**a',
        {
          type: 'reference-link',
          content: ['http://foo.bar/?q=**'],
          reference: '1',
        },
      ],
      exceptions: "doesn't parse autolink",
    },
    {
      text: '__a[http://foo.bar/?q=__][1]',
      expected: [
        '__a',
        {
          type: 'reference-link',
          content: ['http://foo.bar/?q=__'],
          reference: '1',
        },
      ],
      exceptions: "doesn't parse autolink",
    },
  ].forEach(({ text, expected, exceptions }, index) => {
    const example = EMPH_START_EXAMPLE + index;

    test(`respects https://spec.commonmark.org/0.30/#example-${example} ${
      exceptions ? `(adapted: ${exceptions})` : ''
    }`, () => {
      expect(parseSegments(text)).toEqual(expected);
    });
  });
});

// https://spec.commonmark.org/0.30/#links
describe('reference links parsing (influenced by commonmark spec)', () => {
  test('basic full reference link', () => {
    expect(parseSegments('[foo][bar]')).toEqual([
      {
        type: 'reference-link',
        content: ['foo'],
        reference: 'bar',
      },
    ]);
  });

  test("link text may contain escaped or unescaped brackets (which don't form a full link reference)", () => {
    expect(parseSegments('[link [foo \\[bar\\]]][ref]')).toEqual([
      {
        type: 'reference-link',
        content: ['link [foo [bar]]'],
        reference: 'ref',
      },
    ]);
  });

  test('link text may contain escaped full link reference', () => {
    expect(parseSegments('[link [bar]\\[ref]][ref]')).toEqual([
      {
        type: 'reference-link',
        content: ['link [bar][ref]'],
        reference: 'ref',
      },
    ]);
  });

  test('The link text may contain inline content', () => {
    expect(parseSegments('[link *foo **bar***][ref]')).toEqual([
      {
        type: 'reference-link',
        content: [
          'link ',
          {
            type: 'emphasis',
            content: ['foo ', { type: 'strong', content: ['bar'] }],
          },
        ],
        reference: 'ref',
      },
    ]);
  });

  test('space between two pairs of brackets count as independent shortcut reference links', () => {
    expect(parseSegments('[foo] [bar]')).toEqual([
      {
        type: 'reference-link',
        content: ['foo'],
        reference: 'foo',
      },
      ' ',
      {
        type: 'reference-link',
        content: ['bar'],
        reference: 'bar',
      },
    ]);
  });

  test('link labels cannot contain unescaped brackets', () => {
    expect(parseSegments('[foo][ref[bar]]')).toEqual([
      {
        type: 'reference-link',
        content: ['foo'],
        reference: 'foo',
      },
      '[ref',
      {
        type: 'reference-link',
        content: ['bar'],
        reference: 'bar',
      },
      ']',
    ]);
  });

  test('link labels may contain escaped brackets', () => {
    expect(parseSegments('[foo][ref\\[]')).toEqual([
      {
        type: 'reference-link',
        content: ['foo'],
        reference: 'ref\\[',
      },
    ]);
  });

  test('respects escaped brakets', () => {
    expect(parseSegments('\\[foo]')).toEqual(['[foo]']);
  });
});
