import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Marksome, References } from '../src';
import {
  diverseInlineStylesFixtureList,
  mixedInlineStylesFixture,
  referenceLinkFixture,
  customComponentsFixture,
} from './fixtures';

test.each(diverseInlineStylesFixtureList)(
  `renders '%p' as expected`,
  (text) => {
    const { asFragment } = render(<Marksome text={text} />);

    expect(asFragment()).toMatchSnapshot();
  },
);

test('renders mixed inline styles as expected', () => {
  const { asFragment } = render(<Marksome text={mixedInlineStylesFixture} />);

  expect(asFragment()).toMatchInlineSnapshot(`
    		<DocumentFragment>
    		  <span>
    		    This is 
    		    <em>
    		      emphasized
    		    </em>
    		    , 
    		    <strong>
    		      strong
    		    </strong>
    		    ,  
    		    <em>
    		      emphasized with 
    		    </em>
    		    <strong>
    		      a break of strong
    		    </strong>
    		    <em>
    		       in the middle
    		    </em>
    		    , 
    		    <strong>
    		      strong with 
    		    </strong>
    		    <em>
    		      a break of emphasized
    		    </em>
    		    <strong>
    		       in the middle
    		    </strong>
    		    , 
    		    <strong>
    		      <em>
    		        strong within
    		      </em>
    		    </strong>
    		    <em>
    		       emphasized
    		    </em>
    		    , 
    		    <strong>
    		      <em>
    		        emphasized within
    		      </em>
    		       strong
    		    </strong>
    		     and 
    		    <strong>
    		      <em>
    		        both
    		      </em>
    		    </strong>
    		    !
    		  </span>
    		</DocumentFragment>
  	`);
});

test('renders reference link as expected', () => {
  const { asFragment } = render(<Marksome {...referenceLinkFixture} />);

  expect(asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <span>
        For wider markdown support, 
        <a
          href="https://www.npmjs.com/package/markdown-to-jsx"
        >
          check 
          <strong>
            markdown-to-jsx
          </strong>
           out
        </a>
        !
      </span>
    </DocumentFragment>
  `);
});

test('renders reference link fallback, when the respective reference is missing, as expected', () => {
  const { asFragment } = render(<Marksome text={referenceLinkFixture.text} />);

  expect(asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <span>
        For wider markdown support, 
        <span>
          check 
          <strong>
            markdown-to-jsx
          </strong>
           out
        </span>
        !
      </span>
    </DocumentFragment>
  `);
});

test('renders a couple of references as custom elements', () => {
  const onClick = jest.fn();

  const references: References = {
    ...customComponentsFixture.references,
    'greeting-button': (key, children) => (
      <button key={key} onClick={onClick}>
        {children}
      </button>
    ),
  };

  const { asFragment, getByRole } = render(
    <Marksome text={customComponentsFixture.text} references={references} />,
  );

  expect(asFragment()).toMatchInlineSnapshot(`
    <DocumentFragment>
      <span>
        Use references to render custom components like an 
        <strong>
          icon
        </strong>
         (
        <svg
          fill="currentColor"
          height="1em"
          stroke="currentColor"
          stroke-width="0"
          style="vertical-align: middle;"
          version="1.1"
          viewBox="0 0 32 32"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>
            markdown icon
          </title>
          <path
            d="M25.674 9.221h-19.348c-0.899 0-1.63 0.731-1.63 1.63v10.869c0 0.899 0.731 1.63 1.63 1.63h19.348c0.899 0 1.63-0.731 1.63-1.63v-10.869c0-0.899-0.731-1.63-1.63-1.63zM17.413 20.522l-2.826 0.003v-4.239l-2.12 2.717-2.12-2.717v4.239h-2.826v-8.478h2.826l2.12 2.826 2.12-2.826 2.826-0.003v8.478zM21.632 21.229l-3.512-4.943h2.119v-4.239h2.826v4.239h2.119l-3.553 4.943z"
          />
        </svg>
        ) or even a 
        <strong>
          button
        </strong>
        : 
        <button>
          <em>
            Howdie
          </em>
        </button>
      </span>
    </DocumentFragment>
  `);

  const buttonEl = getByRole('button');

  fireEvent.click(buttonEl);

  expect(onClick).toHaveBeenCalledTimes(1);
});
