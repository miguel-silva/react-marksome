import React, { Fragment, useState } from 'react';
import { css } from '@emotion/css';
import { Marksome } from '../src/';
import {
  mixedInlineStylesFixture,
  diverseInlineStylesFixtureList,
  referenceLinkFixture,
} from '../test/fixtures';

export default {
  title: 'react-marksome',
  component: Marksome,
};

export function Samples() {
  return (
    <div
      className={css`
        display: grid;
        grid-gap: 10px;
      `}
    >
      {diverseInlineStylesFixtureList.map((sample) => {
        const text = `This is ${sample}!`;

        return (
          <div key={text}>
            <p>{text}</p>
            <span>
              <Marksome text={text} />
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function CustomInput() {
  const [text, setText] = useState(mixedInlineStylesFixture);

  return (
    <div
      className={css`
        display: grid;

        grid-gap: 10px;
      `}
    >
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <Marksome text={text} />
    </div>
  );
}

export function ReferenceLink() {
  return (
    <>
      <p>
        {referenceLinkFixture.text}
        <dl
          className={css`
            display: grid;
            grid-gap: 5px 3px;
            grid-template-columns: max-content max-content;

            margin-top: 5px;
          `}
        >
          {Object.entries(referenceLinkFixture.references).map(
            ([key, value]) => {
              return (
                <Fragment key={key}>
                  <dt>{key}:</dt>
                  <dd>{value}</dd>
                </Fragment>
              );
            }
          )}
        </dl>
      </p>
      <Marksome {...referenceLinkFixture} />
    </>
  );
}

export function MissingReferences() {
  return (
    <>
      <p>{referenceLinkFixture.text}</p>

      <Marksome text={referenceLinkFixture.text} />
    </>
  );
}
