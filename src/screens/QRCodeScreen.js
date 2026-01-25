import React from 'react';
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
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { DUMMY_CCCD } from '../data/dummyData';

export default function QRCodeScreen({ navigation }) {
  const handleShare = () => {
    Alert.alert('Chia sẻ', 'Chức năng chia sẻ QR Code đang phát triển');
  };

  const handleDownload = () => {
    Alert.alert('Tải xuống', 'QR Code đã được lưu vào thư viện ảnh');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.qrContainer}>
          <Text style={styles.qrTitle}>QR Code - CCCD</Text>
          <Text style={styles.qrSubtitle}>{DUMMY_CCCD.fullName}</Text>
          
          <View style={styles.qrCodePlaceholder}>
            <Text style={styles.qrCodeIcon}>📱</Text>
            <Text style={styles.qrCodeText}>QR Code</Text>
            <Text style={styles.qrCodeId}>{DUMMY_CCCD.id}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Quét mã QR này để xác thực thông tin căn cước công dân
            </Text>
          </View>

          <View style={styles.actionButtons}>
            <CustomButton title="Chia sẻ QR Code" onPress={handleShare} />
            <CustomButton 
              title="Tải xuống" 
              variant="secondary" 
              onPress={handleDownload} 
            />
          </View>
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
    paddingTop: 10
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  qrTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8
  },
  qrSubtitle: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginBottom: 32
  },
  qrCodePlaceholder: {
    width: 280,
    height: 280,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5
  },
  qrCodeIcon: {
    fontSize: 80,
    marginBottom: 12
  },
  qrCodeText: {
    fontSize: 16,
    color: COLORS.gray[500],
    marginBottom: 8
  },
  qrCodeId: {
    fontSize: 14,
    color: COLORS.gray[400],
    fontFamily: 'monospace'
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center'
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[600],
    lineHeight: 20
  },
  actionButtons: {
    width: '100%'
  }
});