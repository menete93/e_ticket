import React from 'react';
import { Pressable, Text } from 'react-native';
import PropTypes from 'prop-types';
import style from './style';
import { isDisabled } from 'react-native/types_generated/Libraries/LogBox/Data/LogBoxData';

const Button = props => {
  return (
    <Pressable
      disabled={props.isDisabled}
      style={[style.Button, props.isDisabled && style.disabled]}
      onPress={() => props.onPress()}
    >
      <Text style={style.title}>{props.title}</Text>
    </Pressable>
  );
};

Button.default = {
  isDisabled: false,
  onPress: () => {},
};

Button.propTypes = {
  title: PropTypes.string.isrequired,
  isDisabled: PropTypes.bool,
  onPress: PropTypes.func,
};

export default Button;
