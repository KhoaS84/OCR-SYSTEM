import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function InfoField({ label, value, editable = false }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, editable && styles.valueEditable]}>
        {value || 'Chưa có thông tin'}
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