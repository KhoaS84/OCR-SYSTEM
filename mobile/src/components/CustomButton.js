import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { COLORS } from '../constants/colors';

export default function CustomButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false
}) {
  const buttonStyle = [
    styles.button,
    variant === 'secondary' && styles.buttonSecondary,
    disabled && styles.buttonDisabled
  ];

  const textStyle = [
    styles.buttonText,
    variant === 'secondary' && styles.buttonTextSecondary,
    disabled && styles.buttonTextDisabled
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={textStyle}>
          {icon && <Text style={styles.buttonIcon}>{icon} </Text>}
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10
  },
  buttonSecondary: {
    backgroundColor: COLORS.gray[200]
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600'
  },
  buttonTextSecondary: {
    color: COLORS.gray[700]
  },
  buttonTextDisabled: {
    color: COLORS.gray[500]
  },
  buttonIcon: {
    fontSize: 18
  }
});
