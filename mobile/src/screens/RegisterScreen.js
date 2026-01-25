import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    // Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Thành công', 'Đăng ký tài khoản thành công!', [
        { text: 'OK', onPress: () => navigation.replace('Home') }
      ]);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đăng Ký Tài Khoản</Text>
          <Text style={styles.headerSubtitle}>
            Tạo tài khoản để quản lý giấy tờ của bạn
          </Text>
        </View>

        <View style={styles.formContainer}>
          <CustomInput
            label="Họ và tên *"
            placeholder="Nhập họ và tên"
            value={formData.fullName}
            onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          />
          
          <CustomInput
            label="Email *"
            placeholder="example@email.com"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
          />
          
          <CustomInput
            label="Số điện thoại *"
            placeholder="0912345678"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
          
          <CustomInput
            label="Mật khẩu *"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChangeText={(text) => setFormData({ ...formData, password: text })}
            secureTextEntry
          />
          
          <CustomInput
            label="Xác nhận mật khẩu *"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
            secureTextEntry
          />

          <CustomButton
            title="Đăng Ký"
            onPress={handleRegister}
            loading={loading}
          />

          <TouchableOpacity 
            style={styles.linkContainer}
            onPress={() => Alert.alert('Thông báo', 'Chức năng đăng nhập đang phát triển')}
          >
            <Text style={styles.linkText}>Đã có tài khoản? Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  header: {
    padding: 20,
    paddingTop: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.gray[500]
  },
  formContainer: {
    padding: 20
  },
  linkContainer: {
    alignItems: 'center',
    marginTop: 12
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 14
  }
});