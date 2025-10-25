import React, { useRef, useState } from 'react';
import { TextInput, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import style from './Style';
import { scaleFontSize } from '../../../assets/styles/scaling';
import { PropTypes } from 'prop-types';

const Searh = props => {
  const handleFocus = () => {
    TextInputRef.current.focus();
  };
  const TextInputRef = useRef(null);
  const [search, setSearch] = useState('');
  const handleSarch = searchValue => {
    setSearch(searchValue);
    props.onSearch(searchValue);
  };

  return (
    <Pressable style={style.searchContainer} onPress={handleFocus}>
      <Icon name="search" size={scaleFontSize(22)} color={'#25C0FF'} />
      <TextInput
        placeholder={props.placeholder}
        ref={TextInputRef}
        style={style.searchInput}
        value={search}
        onChangeText={value => handleSarch(value)}
      />
    </Pressable>
  );
};

Searh.defaultProps = {
  onSearch: () => {},
  placeholder: 'search',
};

Searh.PropTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
};

export default Searh;
