import React from 'react';
import { render } from '@testing-library/react';
import { Marksome } from '../src';
import {
  diverseInlineStylesFixtureList,
  mixedInlineStylesFixture,
  referenceLinkFixture,
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
