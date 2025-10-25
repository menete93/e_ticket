import React from 'react';
// import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import globalStyle from '../../../assets/styles/globalStyle';
import { ScrollView } from 'react-native-gesture-handler';
import { Image, Text, View } from 'react-native';
import style from './style';
// import { useNavigation } from '@react-navigation/native';
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
// import { RootStackParamList } from '../../navigation/Routes'; // ajuste o caminho conforme seu projeto

// type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Profile = () => {
  // const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={[globalStyle.backgroundWhite, globalStyle.flex]}>
      <ScrollView contentContainerStyle={globalStyle.flexGrow}>
        <View style={style.profileImageContainer}>
          <View style={style.profileImageContent}>
            <Image
              style={style.profileImage}
              source={require('../../../assets/images/dafault_profile.jpg')}
            />
          </View>
        </View>
        <Text style={style.name}>Emamnuel Robertsen</Text>
        <View style={style.statContainer}>
          <View>
            <Text style={style.statAmount}>45</Text>
            <Text style={style.statType}>Following</Text>
          </View>
          <View style={style.statBorder} />
          <View>
            <Text style={style.statAmount}>30M</Text>
            <Text style={style.statType}>Followers</Text>
          </View>
          <View style={style.statBorder} />
          <View>
            <Text style={style.statAmount}>100</Text>
            <Text style={style.statType}>Posts</Text>
          </View>
        </View>
        <View style={{ flex: 1 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
