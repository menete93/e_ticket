import React, { Children, isValidElement, useMemo } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import LinearGradient from 'react-native-linear-gradient';
import styles from './style';

export default function LiquidGlassContainer({
  children,
  required = false,
  styles: customStyles,
}) {
  // 🔥 UseMemo evita recalcular e evita mudar estrutura durante render
  const isEmpty = useMemo(() => {
    let empty = false;

    Children.forEach(children, child => {
      if (isValidElement(child) && child.type === TextInput) {
        const value = child.props.value;
        if (required && (!value || value.trim() === '')) {
          empty = true;
        }
      }
    });

    return empty;
  }, [children, required]);

  return (
    <View
      style={[styles.container, customStyles, isEmpty && styles.errorContainer]}
    >
      <LinearGradient
        colors={['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.02)']}
        style={StyleSheet.absoluteFill}
      />

      <BlurView
        style={StyleSheet.absoluteFill}
        blurType="light"
        blurAmount={20}
        reducedTransparencyFallbackColor="rgba(255,255,255,0.05)"
      />

      <View style={styles.inner}>{children}</View>
    </View>
  );
}
