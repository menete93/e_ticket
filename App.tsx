
import AppNavigator from "./android/navigation/AppNavigator";
import firebase from '@react-native-firebase/app';
import React, { useEffect } from 'react';





export default function App() {


  useEffect(() => {
    console.log('Firebase apps:', firebase.apps);
  }, []);



  return <AppNavigator />;
}
