
import AppNavigator from "./android/navigation/AppNavigator";
import firebase from '@react-native-firebase/app';
import React, { useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider } from './android/contexts/authContext'







export default function App() {


  useEffect(() => {
    console.log('Firebase apps:', firebase.apps);
  }, []);


  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}
