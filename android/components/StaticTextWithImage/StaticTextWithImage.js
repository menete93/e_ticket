import React from 'react';
import { View, Text, Image } from 'react-native';
import style from './style';

export default function StaticTextWithImage({ text, SvgIcon, imageSource }) {
  return (
    <View style={style.container}>
      {/* Renderiza SVG se passar SvgIcon */}
      {SvgIcon ? (
        <View style={style.iconWrapper}>
          {SvgIcon ? (
            <SvgIcon width={80} height={80} />
          ) : (
            <Image source={imageSource} style={style.image} />
          )}
        </View>
      ) : (
        <Image source={imageSource} style={style.image} />
      )}

      <View style={style.textWrapper}>
        <Text style={style.text}>{text}</Text>
      </View>
    </View>
  );
}
