import React from 'react';
import {Composition} from 'remotion';
import {Promo} from './Promo';
import edit from './edit.json';

const total = Math.round(Math.max(...edit.cuts.map((c) => c.t + c.d)) * edit.fps);

export const Root: React.FC = () => (
  <Composition id="IHLondon" component={Promo} durationInFrames={total} fps={edit.fps} width={edit.width} height={edit.height} />
);
