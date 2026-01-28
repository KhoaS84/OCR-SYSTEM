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
  multiline = false,
  icon,
  autoCapitalize = 'sentences',
  editable = true
}) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[
            styles.input, 
            multiline && styles.inputMultiline,
            icon && styles.inputWithIcon,
            !editable && styles.inputDisabled
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={COLORS.gray[400]}
          multiline={multiline}
          autoCapitalize={autoCapitalize}
          editable={editable}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray[300],
    borderRadius: 12,
    paddingHorizontal: 12
  },
  icon: {
    fontSize: 20,
    marginRight: 8
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: COLORS.black
  },
  inputWithIcon: {
    paddingLeft: 0
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top'
  },
  inputDisabled: {
    backgroundColor: COLORS.gray[100],
    color: COLORS.gray[500]
  }
});