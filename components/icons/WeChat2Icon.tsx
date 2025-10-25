import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface WeChat2IconProps {
  size?: number;
}

export default function WeChat2Icon({ size = 60 }: WeChat2IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Background with gradient effect */}
      <Rect width="60" height="60" rx="13.5" fill="#09B83E" />
      
      {/* Main chat bubble - larger one */}
      <Path
        d="M24 18C17.925 18 13 21.688 13 26.25C13 28.875 14.55 31.2 17.025 32.75C16.8 34.625 15.375 36.125 15.35 36.15C15.25 36.25 15.2 36.375 15.2 36.525C15.2 36.775 15.4 37 15.65 37C18.125 37 20.125 35.75 21 35.125C21.975 35.375 22.975 35.5 24 35.5C30.075 35.5 35 31.812 35 27.25C35 22.688 30.075 19 24 19Z"
        fill="white"
      />
      
      {/* Smaller chat bubble - right side */}
      <Path
        d="M40.5 28C35.806 28 32 30.912 32 34.5C32 36.506 33.231 38.281 35.156 39.438C34.981 40.844 33.844 42.031 33.825 42.05C33.75 42.125 33.712 42.219 33.712 42.331C33.712 42.519 33.869 42.675 34.056 42.675C35.944 42.675 37.475 41.712 38.125 41.219C38.869 41.406 39.669 41.5 40.5 41.5C45.194 41.5 49 38.588 49 35C49 31.412 45.194 28.5 40.5 28.5Z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Eyes on main bubble */}
      <Circle cx="21" cy="25.5" r="1.2" fill="#09B83E" />
      <Circle cx="27" cy="25.5" r="1.2" fill="#09B83E" />
    </Svg>
  );
}
