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
  Platform,
  Image
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    
    try {
      // Backend dùng email làm username
      await authAPI.login(email, password);
      navigation.replace('Home');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Sai email hoặc mật khẩu';
      Alert.alert('Đăng nhập thất bại', errorMsg);
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>🪪</Text>
            </View>
            <Text style={styles.appName}>VNeID</Text>
            <Text style={styles.appTagline}>Định danh điện tử quốc gia</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Đăng nhập</Text>
            <Text style={styles.formSubtitle}>
              Vui lòng nhập thông tin để tiếp tục
            </Text>

            <View style={styles.inputContainer}>
              <CustomInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                icon="📧"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <CustomInput
                placeholder="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                icon="🔒"
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity 
                style={styles.forgotButton}
                onPress={() => Alert.alert('Quên mật khẩu', 'Chức năng đang phát triển')}
              >
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>

            <CustomButton
              title={loading ? "Đang đăng nhập..." : "Đăng nhập"}
              onPress={handleLogin}
              disabled={loading}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.registerText}>
                Chưa có tài khoản? <Text style={styles.registerTextBold}>Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerIcon}>🔒</Text>
            <Text style={styles.footerText}>
              Thông tin được mã hóa và bảo mật
            </Text>
            <Text style={styles.footerSubtext}>
              Powered by Bộ Công An
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  logoIcon: {
    fontSize: 50
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4
  },
  appTagline: {
    fontSize: 14,
    color: COLORS.gray[500],
    textAlign: 'center'
  },
  formSection: {
    flex: 1
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginBottom: 24
  },
  inputContainer: {
    marginBottom: 24
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8
  },
  forgotText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600'
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24
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
  registerButton: {
    alignItems: 'center',
    paddingVertical: 12
  },
  registerText: {
    fontSize: 14,
    color: COLORS.gray[600]
  },
  registerTextBold: {
    color: COLORS.primary,
    fontWeight: 'bold'
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100]
  },
  footerIcon: {
    fontSize: 20,
    marginBottom: 8
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 4
  },
  footerSubtext: {
    fontSize: 11,
    color: COLORS.gray[400]
  }
});
