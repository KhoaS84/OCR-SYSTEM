import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function CustomInput({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry,
  keyboardType = 'default',
  multiline = false
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.inputMultiline]}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor={COLORS.gray[400]}
        multiline={multiline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: COLORS.black
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top'
  }
});