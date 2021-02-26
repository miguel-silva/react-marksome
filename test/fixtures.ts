import { DiMarkdown } from 'react-icons/di';
import { createElement } from 'react';
import { MarksomeProps, ReferenceRenderFunction } from '../src';

export const mixedInlineStylesFixture =
  'This is *emphasized*, **strong**,  *emphasized with ***a break of strong*** in the middle*, **strong with ***a break of emphasized*** in the middle**, ***strong within** emphasized*, ***emphasized within* strong** and ***both***!';

export const diverseInlineStylesFixtureList = [
  '*emphasized*',
  '**strong**',
  '*emphasized with ***a break of strong*** in the middle*',
  '**strong with ***a break of emphasized*** in the middle**',
  '***strong within** emphasized*',
  '***emphasized within* strong**',
  '**strong with *a bit of emphasized***',
  '*emphasized with **a bit of strong***',
  '***both***',
];

export const referenceLinkFixture: MarksomeProps = {
  text: 'For wider markdown support, [check **markdown-to-jsx** out][1]!',
  references: { '1': 'https://www.npmjs.com/package/markdown-to-jsx' },
};

const RenderMarkdownIcon: ReferenceRenderFunction = (children) =>
  createElement(DiMarkdown, {
    title: String(children),
    style: { verticalAlign: 'middle' },
  });

const RenderGreetingButton: ReferenceRenderFunction = (children) =>
  createElement(
    'button',
    {
      onClick: () => {
        alert('Hello!');
      },
    },
    children,
  );

export const customComponentsFixture: MarksomeProps = {
  text:
    'Use references to render custom components like an **icon** ([markdown icon][md-icon]) or even a **button**: [*Howdie*][greeting-button]',
  references: {
    'md-icon': RenderMarkdownIcon,
    'greeting-button': RenderGreetingButton,
  },
};
