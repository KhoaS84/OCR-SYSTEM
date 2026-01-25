import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform
} from 'react-native';
import DocumentCard from '../components/DocumentCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { DUMMY_USER } from '../data/dummyData';

export default function HomeScreen({ navigation }) {

  const handleScan = () => {
    // ✅ FIX: Expo Web không dùng Alert để navigate
    if (Platform.OS === 'web') {
      navigation.navigate('ScanResult');
      return;
    }

    // ✅ Mobile vẫn giữ Alert như cũ
    Alert.alert(
      'Quét giấy tờ',
      'Chọn loại giấy tờ bạn muốn quét:',
      [
        { text: 'CCCD', onPress: () => navigation.navigate('ScanResult') },
        { text: 'GPLX', onPress: () => navigation.navigate('ScanResult') },
        { text: 'BHYT', onPress: () => navigation.navigate('ScanResult') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{DUMMY_USER.name}</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => Alert.alert('Hồ sơ', 'Chức năng đang phát triển')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.scanSection}>
          <CustomButton
            title="Quét Giấy Tờ Mới"
            icon="📷"
            onPress={handleScan}
          />
        </View>

        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>Giấy tờ của tôi</Text>
          
          <DocumentCard
            title="Căn cước công dân"
            icon="🪪"
            color={COLORS.primary}
            onPress={() => navigation.navigate('CCCDDetail')}
          />
          
          <DocumentCard
            title="Giấy phép lái xe"
            icon="🚗"
            color={COLORS.secondary}
            onPress={() => navigation.navigate('GPLXDetail')}
          />
          
          <DocumentCard
            title="Bảo hiểm y tế"
            icon="🏥"
            color={COLORS.warning}
            onPress={() => navigation.navigate('BHYTDetail')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Tất cả thông tin được mã hóa và bảo mật
          </Text>
          <Text style={styles.footerIcon}>🔒</Text>
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
  homeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.gray[500]
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.gray[200],
    justifyContent: 'center',
    alignItems: 'center'
  },
  profileIcon: {
    fontSize: 24
  },
  scanSection: {
    padding: 20,
    paddingTop: 10
  },
  documentsSection: {
    padding: 20,
    paddingTop: 0
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 16
  },
  footer: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 10
  },
  footerText: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginBottom: 8
  },
  footerIcon: {
    fontSize: 16
  }
});
