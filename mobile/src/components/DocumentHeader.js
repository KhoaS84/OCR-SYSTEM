import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';

export default function DocumentHeader({ title, icon }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingTop: 10
  },
  icon: {
    fontSize: 32,
    marginRight: 12
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black
  }
});