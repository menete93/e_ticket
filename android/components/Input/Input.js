import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import style from './style';

const Input = props => {
  const [value, setValue] = useState('');
  return (
    <View>
      <Text style={style.label}>{props.label} </Text>
      <TextInput
        placeholder={props.placeholder ? props.placeholder : null}
        style={style.input}
        value={value}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        onChangeText={val => {
          setValue(val);
          props.onChangeText(val);
        }}
      />
    </View>
  );
};

Input.defaultProps = {
  onChangeText: () => {},
  keyboardType: 'default',
  secureTextEntry: false,
};

Input.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  onChangeText: PropTypes.func.isRequired,
  keyboardType: PropTypes.string,
  secureTextEntry: PropTypes.bool,
};

export default Input;
