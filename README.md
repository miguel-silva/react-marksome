# react-marksome

Parses some markdown, builds a tree of segments and renders them in React.

It was designed for adding basic support for styling and links to singleline strings.

See [Rationale](#rationale) for more info.

## Quick start

```tsx
import { Marksome } from 'react-marksome';

function Demo() {
  const text =
    'The *quick* *brown* **fox** jumps over the *lazy* **dog**. [Wikipedia][1]';

  const references = {
    '1':
      'https://en.wikipedia.org/wiki/The_quick_brown_fox_jumps_over_the_lazy_dog',
  };

  return <Marksome text={text} references={references} />;
}
```

renders

...

The _quick_ _brown_ **fox** jumps over the _lazy_ **dog**. [Wikipedia]("https://en.wikipedia.org/wiki/The_quick_brown_fox_jumps_over_the_lazy_dog")

...

For more examples, see the [stories](./stories/Marksome.stories.tsx).

## Rationale

The current subset of markdown that is supported is:

- \*\*strong text\*\*
- \*emphasized text\*
- \[link description\]\[reference\]

By restricting ourselves to only support some markdown we're able to:

- build a light package ([bundlephobia](https://bundlephobia.com/result?p=react-marksome))
- that provides a flexible, readable and condensed format for singleline pieces of text

Additionally we build out a tree of segments instead of simply using string replacement mostly for future extensibility and configuratility, like being able to render segments with custom React components (WIP).

All of the above means that users don't need to worry about escaping the text since:

- it relies on regular React components instead of injecting HTML via [dangerouslySetInnerHTML](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- the only way to inject a link is via a separate references object.

## Alternatives

If you're looking for wider markdown support:

- [snarkdown](https://www.npmjs.com/package/snarkdown) for lightweight Markdown parser that returns plain HTML string
- [markdown-to-jsx](https://www.npmjs.com/package/markdown-to-jsx) for a lot configurability and extensibility

## Commands

This project was bootstrapped with [TSDX](https://github.com/formium/tsdx). Check the docs for more info on the commands.

### Storybook

Run inside another terminal:

```bash
npm run storybook
```

This loads the stories from `./stories`.

### Testing

Jest tests are set up to run with `npm test`.

### Bundle analysis

Calculates the real cost of your library using [size-limit](https://github.com/ai/size-limit) with `npm run size` and visualize it with `npm run analyze`.

## Credits

- [devuo](https://github.com/devuo) for providing some ideas and inspiration!
