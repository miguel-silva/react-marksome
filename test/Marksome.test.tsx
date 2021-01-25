import React from 'react';
import { render } from '@testing-library/react';
import { Marksome } from '../src';
import { mixedInlineStylesFixture, referenceLinkFixture } from './fixtures';

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
		    For wider markdown support, check 
		    <a
		      href="https://www.npmjs.com/package/markdown-to-jsx"
		    >
		      markdown-to-jsx
		    </a>
		     out!
		  </span>
		</DocumentFragment>
	`);
});
