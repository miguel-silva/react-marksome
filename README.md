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

  const references: References = {
    '1':
      'https://en.wikipedia.org/wiki/The_quick_brown_fox_jumps_over_the_lazy_dog',
  };

  return <Marksome text={text} references={references} />;
}
```

renders the following line:

The _quick_ _brown_ **fox** jumps over the _lazy_ **dog**. [Wikipedia]("https://en.wikipedia.org/wiki/The_quick_brown_fox_jumps_over_the_lazy_dog")

For more examples, see the [stories](./stories/Marksome.stories.tsx) together with related [fixtures](./test/fixtures.ts).

## API

### Marksome component

React component that parses and renders a subset of markdown.

It expects the markdown text to be provided via a `text` prop, which then is combined with reference links (`[label][reference]`)defined under the `references` prop.

#### Props

```ts
type MarksomeProps = HTMLAttributes<HTMLSpanElement> & {
  text: string;
  references?: References;
};

type References = Record<string, string | ReferenceRenderFunction>;

type ReferenceRenderFunction = (key: Key, children: ReactNode) => ReactNode;
```

#### Basic usage

See [Quick start](#quick-start).

#### Custom components

One can actually render custom components in the place of reference links by providing a render function instead of link url:

```tsx
function CustomComponentsDemo() {
  const text = 'The following is an actual button: [*Howdie*][greeting-button]';

  const references: References = {
    'greeting-button': (key, children) => (
      <button
        key={key}
        onClick={() => {
          alert('Hello!');
        }}
      >
        {children}
      </button>
    ),
  };

  return <Marksome text={text} references={references} />;
}
```

## Rationale

The current subset of markdown that is supported is:

- \*\*strong text\*\*
- \*emphasized text\*
- \[link description\]\[reference\]

By restricting ourselves to only support some markdown we're able to:

- build a light package ([bundlephobia](https://bundlephobia.com/result?p=react-marksome))
- that provides a flexible, readable and condensed format for singleline pieces of text

Additionally, we build out a tree of segments instead of simply using string replacement mostly for extensibility and configuratility, like being able to render segments with [custom React components](#custom-components).

All of the above means that users don't need to worry about escaping the text since:

- it relies on regular React components instead of injecting HTML via [dangerouslySetInnerHTML](https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
- the only way to inject a link is via a separate references object.

## Supported browsers

The following [browserslist](https://github.com/browserslist/browserslist) is supported without the need of any polyfills:

<details>
  <summary>>0.25% or last 2 major versions and supports es6-module</summary>

  <p style="white-space: pre">
  <strong>caniuse-lite db date: 15/02/2020</strong>
  and_chr 87
  and_ff 83
  and_qq 10.4
  android 81
  chrome 87
  chrome 86
  chrome 85
  edge 87
  edge 86
  firefox 84
  firefox 83
  ios_saf 14.0-14.3
  ios_saf 13.4-13.7
  ios_saf 13.3
  ios_saf 13.2
  ios_saf 13.0-13.1
  ios_saf 12.2-12.4
  opera 72
  opera 71
  safari 14
  safari 13.1
  safari 13
  samsung 13.0
  samsung 12.0
  </p>
</details>

## Alternatives

If you're looking for wider markdown support:

- [snarkdown](https://www.npmjs.com/package/snarkdown) for lightweight Markdown parser that returns plain HTML string
- [markdown-to-jsx](https://www.npmjs.com/package/markdown-to-jsx) for a lot configurability and extensibility

## Commands

This project was bootstrapped with [TSDX](https://github.com/formium/tsdx). Check its docs for more info on the commands.

### Storybook

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
