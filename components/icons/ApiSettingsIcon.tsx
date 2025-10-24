import React from 'react';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

type ApiSettingsIconProps = {
  size?: number;
};

const ApiSettingsIcon = ({ size = 64 }: ApiSettingsIconProps) => {
  return (
    <Svg fill='none' height={size} viewBox='0 0 64 64' width={size}>
      <Defs>
        <LinearGradient id='apiGradient' x1='10' x2='54' y1='8' y2='56'>
          <Stop offset='0' stopColor='#5B86E5' />
          <Stop offset='1' stopColor='#36D1DC' />
        </LinearGradient>
        <LinearGradient id='apiGlow' x1='32' x2='32' y1='12' y2='52'>
          <Stop offset='0' stopColor='#FFFFFF' stopOpacity='0.92' />
          <Stop offset='1' stopColor='#FFFFFF' stopOpacity='0.2' />
        </LinearGradient>
      </Defs>
      <Path
        d='M18 6h28a6 6 0 0 1 6 6v40a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V12a6 6 0 0 1 6-6Z'
        fill='url(#apiGradient)'
      />
      <Path
        d='M22 14h20a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z'
        fill='url(#apiGlow)'
        opacity={0.85}
      />
      <Path
        d='M20 20h8m16 0h-4m4 12h-8m-16 0h6m-6 12h10m14 0h-6'
        stroke='#E6FFFA'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeOpacity={0.9}
        strokeWidth={1.6}
      />
      <Circle cx='20' cy='20' fill='#FFFFFF' fillOpacity='0.85' r='2.2' />
      <Circle cx='32' cy='20' fill='#FFFFFF' fillOpacity='0.65' r='1.6' />
      <Circle cx='44' cy='20' fill='#FFFFFF' fillOpacity='0.45' r='1.4' />
      <Circle cx='26' cy='32' fill='#FFFFFF' fillOpacity='0.6' r='1.9' />
      <Circle cx='44' cy='32' fill='#FFFFFF' fillOpacity='0.6' r='1.9' />
      <Circle cx='30' cy='44' fill='#FFFFFF' fillOpacity='0.5' r='1.7' />
      <Circle cx='38' cy='44' fill='#FFFFFF' fillOpacity='0.5' r='1.7' />
      <Path
        d='
          M32 24.5
          c0.9 0 1.7 0.5 2.2 1.3l0.4 0.6
          2.3 0.5c1 0.2 1.8 1 2 2l0.1 0.7
          1.8 1.3c0.8 0.6 1.2 1.5 1.1 2.5l-0.1 0.7
          1 2.2c0.4 0.9 0.3 1.9-0.2 2.7l-0.4 0.6
          0.4 2.3c0.2 1-0.2 2-1 2.6l-0.6 0.5
          -2.2 0.9c-0.3 0.8-0.9 1.4-1.7 1.8l-0.7 0.3
          -2.4-0.1c-0.6 0.6-1.4 1-2.3 1s-1.7-0.4-2.3-1l-0.7 0.1
          -2.4 0.1c-0.9 0-1.7-0.5-2.3-1.2l-0.5-0.6
          -2.2-0.9c-0.9-0.4-1.5-1.1-1.7-2l-0.1-0.7
          -0.4-2.3c-0.7-0.6-1.2-1.5-1.2-2.5 0-0.6 0.2-1.2 0.5-1.7l0.4-0.6
          -1-2.2c-0.4-0.9-0.3-1.9 0.3-2.7l0.4-0.6
          -0.1-0.7c-0.2-1 0.2-2 1-2.6l0.6-0.5
          2.2-0.9c0.3-0.8 0.9-1.4 1.7-1.8l0.7-0.3
          2.4 0.1c0.5-0.6 1.3-1 2.2-1Z'
        fill='rgba(20, 27, 45, 0.08)'
        stroke='rgba(15, 23, 42, 0.35)'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={1.4}
      />
      <Circle cx='32' cy='32' fill='rgba(22, 30, 49, 0.9)' r='5.2' />
      <Circle cx='32' cy='32' fill='#70FACC' fillOpacity='0.9' r='2.6' />
    </Svg>
  );
};

export default ApiSettingsIcon;
