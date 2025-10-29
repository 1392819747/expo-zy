import React from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type PresetIconProps = {
  size?: number;
};

const PresetIcon = ({ size = 64 }: PresetIconProps) => {
  return (
    <Svg height={size} viewBox='0 0 64 64' width={size}>
      <Defs>
        <LinearGradient id='presetOuter' x1='10' x2='54' y1='8' y2='56'>
          <Stop offset='0' stopColor='#38bdf8' />
          <Stop offset='1' stopColor='#14b8a6' />
        </LinearGradient>
        <LinearGradient id='presetInner' x1='18' x2='46' y1='16' y2='48'>
          <Stop offset='0' stopColor='rgba(15, 23, 42, 0.92)' />
          <Stop offset='1' stopColor='rgba(15, 23, 42, 0.72)' />
        </LinearGradient>
        <LinearGradient id='presetGlyph' x1='24' x2='44' y1='20' y2='44'>
          <Stop offset='0' stopColor='#f8fafc' />
          <Stop offset='1' stopColor='#e2e8f0' />
        </LinearGradient>
      </Defs>
      <Rect fill='url(#presetOuter)' height='52' rx='14' ry='14' width='48' x='8' y='6' />
      <Rect fill='url(#presetInner)' height='40' rx='10' ry='10' width='36' x='14' y='12' />
      <Path
        d='M24 20h12c5.522 0 10 3.582 10 8s-4.478 8-10 8h-6v8h-6z'
        fill='url(#presetGlyph)'
      />
      <Path
        d='M30 24v8h6c2.21 0 4-1.79 4-4s-1.79-4-4-4z'
        fill='rgba(15, 23, 42, 0.12)'
      />
      <Path
        d='M24 44h16'
        stroke='rgba(148, 163, 184, 0.45)'
        strokeLinecap='round'
        strokeWidth='3'
      />
    </Svg>
  );
};

export default PresetIcon;
