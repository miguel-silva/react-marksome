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

export const referenceLinkFixture = {
  text: 'For wider markdown support, [check **markdown-to-jsx** out][1]!',
  references: { '1': 'https://www.npmjs.com/package/markdown-to-jsx' },
};
