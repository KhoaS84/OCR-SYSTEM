import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function InfoField({ label, value, editable = false }) {
  // Convert value to string to prevent render errors
  const displayValue = value != null 
    ? (typeof value === 'object' ? JSON.stringify(value) : String(value))
    : 'Chưa có thông tin';
    
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, editable && styles.valueEditable]}>
        {displayValue}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100]
  },
  label: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 4,
    fontWeight: '500'
  },
  value: {
    fontSize: 16,
    color: COLORS.black,
    fontWeight: '400'
  },
  valueEditable: {
    color: COLORS.primary
  }
});