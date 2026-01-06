import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { ConfirmationDialog } from '../components/ui/confirmation-dialog';
import { registerUser } from '../services/auth-service';
import { authStyles } from '../styles/auth-styles';
import { RegisterFormData } from '../types/auth';
import { validateRegisterForm } from '../utils/validation';

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCCCDDialog, setShowCCCDDialog] = useState(false);

  const updateField = (field: keyof RegisterFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleRegister = async () => {
    // Validate form
    const validationErrors = validateRegisterForm(formData);
    
    if (validationErrors.length > 0) {
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((error) => {
        errorMap[error.field] = error.message;
      });
      setErrors(errorMap);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await registerUser({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.requiresCCCDVerification) {
        setShowCCCDDialog(true);
      } else {
        Alert.alert('Thành công', 'Đăng ký tài khoản thành công!');
      }
    } catch (error) {
      Alert.alert('Lỗi', error instanceof Error ? error.message : 'Đã có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCCCDConfirm = () => {
    setShowCCCDDialog(false);
    router.push('/qr-scanner');
  };

  const handleCCCDCancel = () => {
    setShowCCCDDialog(false);
    router.replace('/(tabs)');
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <KeyboardAvoidingView
      style={authStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={authStyles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={authStyles.header}>
          <View style={authStyles.decorativeCircle} />
          <Text style={authStyles.title}>Đăng ký VNeID</Text>
        </View>

        <View style={authStyles.form}>
          {/* Username Field */}
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Tài khoản</Text>
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputIcon}>👤</Text>
              <TextInput
                style={authStyles.input}
                placeholder="Username"
                value={formData.username}
                onChangeText={(text) => updateField('username', text)}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {errors.username && (
              <Text style={authStyles.errorText}>{errors.username}</Text>
            )}
          </View>

          {/* Email Field */}
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Email</Text>
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputIcon}>📧</Text>
              <TextInput
                style={authStyles.input}
                placeholder="Example@gmail.com"
                value={formData.email}
                onChangeText={(text) => updateField('email', text)}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            {errors.email && (
              <Text style={authStyles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password Field */}
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Mật khẩu</Text>
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputIcon}>🔒</Text>
              <TextInput
                style={authStyles.input}
                placeholder="******"
                value={formData.password}
                onChangeText={(text) => updateField('password', text)}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            {errors.password && (
              <Text style={authStyles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Confirm Password Field */}
          <View style={authStyles.inputGroup}>
            <Text style={authStyles.label}>Xác nhận mật khẩu</Text>
            <View style={authStyles.inputContainer}>
              <Text style={authStyles.inputIcon}>🔒</Text>
              <TextInput
                style={authStyles.input}
                placeholder="******"
                value={formData.confirmPassword}
                onChangeText={(text) => updateField('confirmPassword', text)}
                secureTextEntry
                editable={!isLoading}
              />
            </View>
            {errors.confirmPassword && (
              <Text style={authStyles.errorText}>{errors.confirmPassword}</Text>
            )}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[authStyles.primaryButton, isLoading && authStyles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={authStyles.primaryButtonText}>Đăng ký</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={authStyles.linkContainer}>
            <Text style={authStyles.linkText}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
              <Text style={authStyles.link}>Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* CCCD Verification Dialog */}
      <ConfirmationDialog
        visible={showCCCDDialog}
        title="Xác thực Căn Cước Công Dân"
        message="Bạn cần xác thực tài khoản bằng CCCD"
        onConfirm={handleCCCDConfirm}
        onCancel={handleCCCDCancel}
        confirmText="OK"
        cancelText="CANCEL"
      />
    </KeyboardAvoidingView>
  );
}
