import React, { useRef, useState } from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import style from './style';
import { event } from 'react-native/types_generated/Libraries/Animated/AnimatedExports';
import { horizontalScale } from '../../../assets/styles/scaling';

const Badge = props => {
  const [width, setWidth] = useState(0);
  const textRef = useRef(null);
  const paddingHorizontal = 10;
  const tabWidth = {
    width: horizontalScale(width + paddingHorizontal * 2),
  };

  return (
    <View style={[style.bagde, tabWidth]}>
      <Text
        onTextLayout={event => {
          setWidth(event.nativeEvent.lines[0].width);
        }}
        ref={textRef}
        style={style.title}
      >
        {props.title}
      </Text>
    </View>
  );
};

Badge.propTypes = {
  title: PropTypes.string.isrequired,
};

export default Badge;
