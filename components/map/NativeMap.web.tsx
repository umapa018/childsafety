import React from 'react';
import { View } from 'react-native';

export const PROVIDER_GOOGLE = 'google';

export const Marker = (props: any) => {
  return <View {...props}>{props.children}</View>;
};

export const Circle = (props: any) => {
  return <View {...props}>{props.children}</View>;
};

const MapView = (props: any) => {
  return <View {...props}>{props.children}</View>;
};

export default MapView;
