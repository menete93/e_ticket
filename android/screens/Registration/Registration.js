import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import globalStyle from '../../../assets/styles/globalStyle';
import Input from '../../components/Input/Input';
import style from './style';
import Header from '../../components/Header/Header';
import Button from '../../components/Button/Button';
import BackButton from '../../components/BackButton/BackButton';
import createUser from '../../api/user';
import { Routes } from '../../../Navigation/Routes';

const Registration = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  return (
    <SafeAreaView style={[globalStyle.backgroundWhite, globalStyle.flex]}>
      <View style={style.backbutton}>
        <BackButton onPress={() => navigation.navigate(Routes.Login)} />
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={style.container}
      >
        <View style={globalStyle.marginBottom24}>
          <Header title={'Hello and Wellcome !'} type={1} />
        </View>

        <View>
          <Input
            // secureTextEntry={true}
            label={'First & Last Name'}
            placeholder={'Enter your full name'}
            onChangeText={value => setFullName(value)}
          />
          <Input
            label="Email"
            placeholder="exmple@doantion.com"
            secureTextEntry={true}
            keyboardType="email-address"
            onChangeText={value => setEmail(value)}
          />
          <Input
            label="Password"
            placeholder="*********"
            secureTextEntry={true}
            keyboardType="default"
            onChangeText={value => setPassword(value)}
          />
        </View>
        {error.length > 0 && <Text style={style.error}>{error}</Text>}
        {error.length > 0 && <Text style={style.success}>{success}</Text>}
        <View style={globalStyle.marginBottom24}>
          <Button
            isDisabled={
              fullName.length <= 2 || email.length <= 5 || password.length <= 8
            }
            title={'Registration'}
            onPress={async () => {
              let user = await createUser(fullName, email, password);
              if (user.error) {
                setError(user.error);
              } else {
                setError('');
                setSuccess('You have successfully registered');
                setTimeout(() => navigation.goBack(), 3000);
              }
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Registration;
