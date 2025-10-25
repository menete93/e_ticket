import React from 'react';
import { Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { scaleFontSize } from '../../../assets/styles/scaling';
import PropTypes from 'prop-types';
import style from './style';

const BackButton = ({ onPress }) => {
  return (
    <Pressable onPress={onPress} style={style.container}>
      <Icon name="arrow-left" size={scaleFontSize(22)} style={style.icon} />
    </Pressable>
  );
};

BackButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default BackButton;
