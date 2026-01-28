import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { authAPI } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Validation
    if (!formData.email || !formData.password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    
    try {
      await authAPI.register({
        email: formData.email,
        password: formData.password
      });
      
      Alert.alert(
        'Thành công', 
        'Đăng ký tài khoản thành công! Vui lòng đăng nhập bằng email của bạn.', 
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Có lỗi xảy ra. Vui lòng thử lại.';
      Alert.alert('Đăng ký thất bại', errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>← Quay lại</Text>
            </TouchableOpacity>
            
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🪪</Text>
            </View>
            
            <Text style={styles.headerTitle}>Đăng Ký Tài Khoản</Text>
            <Text style={styles.headerSubtitle}>
              Tạo tài khoản để quản lý giấy tờ của bạn
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <CustomInput
              placeholder="Email *"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              icon="📧"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            
            <CustomInput
              placeholder="Mật khẩu *"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              icon="🔒"
              secureTextEntry
              editable={!loading}
            />
            
            <CustomInput
              placeholder="Xác nhận mật khẩu *"
              value={formData.confirmPassword}
              onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
              icon="🔒"
              secureTextEntry
              editable={!loading}
            />

            <View style={styles.noteContainer}>
              <Text style={styles.noteText}>
                • Email sẽ được dùng để đăng nhập
              </Text>
              <Text style={styles.noteText}>
                • Mật khẩu phải có ít nhất 6 ký tự
              </Text>
            </View>

            <CustomButton
              title={loading ? "Đang đăng ký..." : "Đăng Ký"}
              onPress={handleRegister}
              disabled={loading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginText}>
                Đã có tài khoản? <Text style={styles.loginTextBold}>Đăng nhập ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerIcon}>🔒</Text>
            <Text style={styles.footerText}>
              Thông tin của bạn được bảo mật tuyệt đối
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  keyboardView: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24
  },
  header: {
    padding: 24,
    paddingTop: 16
  },
  backButton: {
    marginBottom: 16
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600'
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  logoIcon: {
    fontSize: 40
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray[500]
  },
  formContainer: {
    paddingHorizontal: 24
  },
  noteContainer: {
    backgroundColor: COLORS.gray[100],
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  },
  noteText: {
    fontSize: 12,
    color: COLORS.gray[600],
    marginBottom: 4
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.gray[200]
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: COLORS.gray[400]
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 12
  },
  loginText: {
    fontSize: 14,
    color: COLORS.gray[600]
  },
  loginTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
    paddingTop: 20,
    paddingHorizontal: 24
  },
  footerIcon: {
    fontSize: 20,
    marginBottom: 8
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray[500],
    textAlign: 'center'
  }
});