import React from 'react';
import style from './style';
import { Image, Pressable, View } from 'react-native';
import PropTypes from 'prop-types';
import Header from '../Header/Header';
import Badge from '../Badge/Badge';

const SingleDonationItem = props => {
  return (
    <Pressable
      onPress={() => {
        props.onPress(props.donationItemId);
      }}
    >
      <View>
        <View style={style.badge}>
          <Badge title={props.badgeTitle} />
        </View>
        <Image
          resizeMethod="cover"
          source={{ uri: props.uri }}
          style={style.image}
        />
      </View>
      <View style={style.donationInformation}>
        <Header
          title={props.donationTitle}
          type={3}
          color={'#0A043C'}
          numberOfLines={1}
        />
      </View>
      <View style={style.price}>
        <Header
          title={'$' + props.price.toFixed(2)}
          type={3}
          color={'#156CF7'}
        />
      </View>
    </Pressable>
  );
};

SingleDonationItem.defaultProps = {
  onPress: () => {},
};

SingleDonationItem.propTypes = {
  uri: PropTypes.string.isRequired,
  badgeTitle: PropTypes.string.isRequired,
  donationTitle: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  onPress: PropTypes.func.isRequired,
  donationItemId: PropTypes.number.isRequired,
};

export default SingleDonationItem;
