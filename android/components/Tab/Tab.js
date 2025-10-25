import React, { useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import PropTypes from 'prop-types';
import style from './style';
import { horizontalScale } from '../../../assets/styles/scaling';

const Tab = props => {
  const [width, setWidth] = useState(0);
  const textRef = useRef(null);
  // console.log(width);
  const paddingHorizontal = 33;
  const tabWidth = {
    width: horizontalScale(width + paddingHorizontal * 2),
  };

  return (
    <Pressable
      style={[style.tab, props.isInactive && style.inactiveTab]}
      onPress={() => props.onPress(props.tabId)}
    >
      <Text
        onTextLayout={event => {
          setWidth(event.nativeEvent.lines[0].width);
        }}
        ref={textRef}
        style={[style.title, props.isInactive && style.inactiveTitle]}
      >
        {props.title}
      </Text>
    </Pressable>
  );
};

Tab.default = {
  isInactive: false, //valores que se esperam
  onPress: () => {},
};

Tab.propTypes = {
  tabId: PropTypes.number.isrequired,
  title: PropTypes.string.isrequired,
  isInactive: PropTypes.bool, ///condicao ou tipo de dado a ser inserido
  onPress: PropTypes.func,
};

export default Tab;
