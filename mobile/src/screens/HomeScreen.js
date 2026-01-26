import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DocumentCard from '../components/DocumentCard';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { usersAPI, documentsAPI, citizensAPI } from '../services/api';

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasCCCD, setHasCCCD] = useState(false);
  const [citizenId, setCitizenId] = useState(null);

  // Load data khi màn hình được focus (quay lại từ màn hình khác)
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 HomeScreen focused, reloading data...');
      loadUserData();
    }, [])
  );

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await usersAPI.getMe();
      setUser(userData);
      
      // Load documents
      const docsData = await documentsAPI.getAll();
      console.log('📋 HomeScreen - Documents loaded:', docsData);
      setDocuments(docsData);

      // Lấy citizen_id từ document đầu tiên (tất cả documents của user đều có cùng citizen_id)
      if (docsData && docsData.length > 0) {
        const firstCitizenId = docsData[0].citizen_id;
        console.log('👤 HomeScreen - Citizen ID:', firstCitizenId);
        setCitizenId(firstCitizenId);
      }

      // Kiểm tra xem user đã có CCCD chưa
      const cccdExists = docsData?.some(doc => doc.type === 'CCCD');
      console.log('🔍 HomeScreen - Has CCCD?', cccdExists, 'Documents:', docsData?.length);
      console.log('🔍 HomeScreen - Document types:', docsData?.map(d => d.type));
      setHasCCCD(cccdExists);

      // Nếu chưa có CCCD, yêu cầu quét
      if (!cccdExists) {
        console.log('⚠️ No CCCD found, will show alert');
        setTimeout(() => {
          Alert.alert(
            'Yêu cầu quét CCCD',
            'Bạn cần quét Căn cước công dân để sử dụng ứng dụng',
            [
              {
                text: 'Quét ngay',
                onPress: () => navigation.navigate('ScanResult', { docType: 'CCCD', required: true })
              }
            ],
            { cancelable: false }
          );
        }, 500);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    // Kiểm tra nếu chưa có CCCD, bắt buộc phải quét CCCD trước
    if (!hasCCCD) {
      Alert.alert(
        'Yêu cầu quét CCCD',
        'Bạn cần quét Căn cước công dân trước khi quét giấy tờ khác',
        [
          {
            text: 'Quét CCCD',
            onPress: () => navigation.navigate('ScanResult', { docType: 'CCCD', required: true })
          }
        ]
      );
      return;
    }

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
        { text: 'CCCD', onPress: () => navigation.navigate('ScanResult', { docType: 'CCCD' }) },
        { text: 'GPLX', onPress: () => navigation.navigate('ScanResult', { docType: 'GPLX' }) },
        { text: 'BHYT', onPress: () => navigation.navigate('ScanResult', { docType: 'BHYT' }) },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.homeHeader}>
          <View>
            <Text style={styles.welcomeText}>Xin chào,</Text>
            <Text style={styles.userName}>{user?.full_name || user?.username || 'User'}</Text>
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
          
          {!hasCCCD && (
            <View style={styles.warningCard}>
              <Text style={styles.warningIcon}>⚠️</Text>
              <Text style={styles.warningText}>
                Bạn cần quét CCCD để sử dụng đầy đủ chức năng
              </Text>
            </View>
          )}
          
          <DocumentCard
            title="Căn cước công dân"
            icon="🪪"
            color={COLORS.primary}
            onPress={() => {
              // Tìm document CCCD và lấy citizen_id của nó
              const cccdDoc = documents?.find(doc => doc.type === 'CCCD');
              if (cccdDoc) {
                navigation.navigate('CCCDDetail', { citizenId: cccdDoc.citizen_id });
              } else {
                navigation.navigate('ScanResult', { docType: 'CCCD', required: true });
              }
            }}
          />
          
          <DocumentCard
            title="Giấy phép lái xe"
            icon="🚗"
            color={COLORS.secondary}
            onPress={() => {
              if (!hasCCCD) {
                Alert.alert('Thông báo', 'Vui lòng quét CCCD trước');
              } else {
                // Tìm document GPLX và lấy citizen_id của nó
                const gplxDoc = documents?.find(doc => doc.type === 'GPLX');
                if (gplxDoc) {
                  navigation.navigate('GPLXDetail', { citizenId: gplxDoc.citizen_id });
                } else {
                  navigation.navigate('ScanResult', { docType: 'GPLX' });
                }
              }
            }}
          />
          
          <DocumentCard
            title="Bảo hiểm y tế"
            icon="🏥"
            color={COLORS.warning}
            onPress={() => {
              if (!hasCCCD) {
                Alert.alert('Thông báo', 'Vui lòng quét CCCD trước');
              } else {
                // Tìm document BHYT và lấy citizen_id của nó
                const bhytDoc = documents?.find(doc => doc.type === 'BHYT');
                if (bhytDoc) {
                  navigation.navigate('BHYTDetail', { citizenId: bhytDoc.citizen_id });
                } else {
                  navigation.navigate('ScanResult', { docType: 'BHYT' });
                }
              }
            }}
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray[500]
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE69C'
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#856404',
    fontWeight: '500'
  }
});
