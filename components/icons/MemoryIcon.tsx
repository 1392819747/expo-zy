import React from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type MemoryIconProps = {
  size?: number;
};

const MemoryIcon = ({ size = 64 }: MemoryIconProps) => {
  return (
    <Svg height={size} viewBox='0 0 64 64' width={size}>
      <Defs>
        <LinearGradient id='memoryOuter' x1='10' x2='54' y1='8' y2='56'>
          <Stop offset='0' stopColor='#6366f1' />
          <Stop offset='1' stopColor='#22d3ee' />
        </LinearGradient>
        <LinearGradient id='memoryInner' x1='18' x2='46' y1='16' y2='48'>
          <Stop offset='0' stopColor='rgba(15, 23, 42, 0.92)' />
          <Stop offset='1' stopColor='rgba(15, 23, 42, 0.72)' />
        </LinearGradient>
        <LinearGradient id='memoryNeuron' x1='24' x2='44' y1='22' y2='42'>
          <Stop offset='0' stopColor='#f8fafc' />
          <Stop offset='1' stopColor='#cbd5f5' />
        </LinearGradient>
      </Defs>
      <Rect fill='url(#memoryOuter)' height='52' rx='14' ry='14' width='48' x='8' y='6' />
      <Rect fill='url(#memoryInner)' height='40' rx='10' ry='10' width='36' x='14' y='12' />
      <Path
        d='
          M32 20c-5.514 0-10 4.486-10 10 0 2.48 0.9 4.744 2.39 6.49l-1.39 4.51 4.73-1.45A10.01 10.01 0 0 0 32 40c5.514 0 10-4.486 10-10s-4.486-10-10-10zm-3.5 8.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zm3.5 9.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zm6-6.75a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'
        fill='url(#memoryNeuron)'
      />
      <Path
        d='M24.5 43.5h15'
        stroke='rgba(148, 163, 184, 0.45)'
        strokeLinecap='round'
        strokeWidth='3'
      />
    </Svg>
  );
};

export default MemoryIcon;
