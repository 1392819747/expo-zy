import React from 'react';
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

type WorldBookIconProps = {
  size?: number;
};

const WorldBookIcon = ({ size = 64 }: WorldBookIconProps) => {
  return (
    <Svg height={size} viewBox='0 0 64 64' width={size}>
      <Defs>
        <LinearGradient id='worldBookShell' x1='12' x2='54' y1='8' y2='56'>
          <Stop offset='0' stopColor='#34d399' />
          <Stop offset='1' stopColor='#3b82f6' />
        </LinearGradient>
        <LinearGradient id='worldBookPage' x1='18' x2='46' y1='16' y2='48'>
          <Stop offset='0' stopColor='#ffffff' stopOpacity='0.92' />
          <Stop offset='1' stopColor='#e2f7ff' stopOpacity='0.6' />
        </LinearGradient>
        <LinearGradient id='worldBookRibbon' x1='28' x2='36' y1='20' y2='52'>
          <Stop offset='0' stopColor='#ec4899' />
          <Stop offset='1' stopColor='#8b5cf6' />
        </LinearGradient>
      </Defs>
      <Rect
        fill='url(#worldBookShell)'
        height='50'
        rx='12'
        ry='12'
        width='44'
        x='10'
        y='7'
      />
      <Rect
        fill='url(#worldBookPage)'
        height='38'
        rx='8'
        ry='8'
        width='32'
        x='16'
        y='13'
      />
      <Path
        d='M24 18h16a2 2 0 0 1 2 2v20l-6-4-6 4-6-4-6 4V20a2 2 0 0 1 2-2Z'
        fill='rgba(15, 23, 42, 0.08)'
      />
      <Path
        d='M24 18h16a2 2 0 0 1 2 2v20l-6-4-6 4-6-4-6 4V20a2 2 0 0 1 2-2Z'
        fill='url(#worldBookPage)'
      />
      <Path
        d='M24 24h16M24 30h16M24 36h10'
        stroke='#0f172a'
        strokeLinecap='round'
        strokeOpacity='0.35'
        strokeWidth='2'
      />
      <Path
        d='M32 18v22l6-4'
        fill='none'
        stroke='url(#worldBookRibbon)'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='3.2'
      />
      <Path
        d='M20 44h24'
        stroke='rgba(15, 23, 42, 0.2)'
        strokeLinecap='round'
        strokeWidth='3'
      />
    </Svg>
  );
};

export default WorldBookIcon;
