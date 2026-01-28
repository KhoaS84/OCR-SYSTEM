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
  ActivityIndicator
} from 'react-native';
import DocumentHeader from '../components/DocumentHeader';
import InfoField from '../components/InfoField';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { citizensAPI, documentsAPI, authAPI } from '../services/api';

export default function CCCDDetailScreen({ navigation, route }) {
  const [cccdData, setCccdData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCCCDData();
  }, []);

  // Helper functions để format data từ backend
  const formatDateToVietnamese = (isoDate) => {
    if (!isoDate) return 'N/A';
    try {
      // YYYY-MM-DD -> DD/MM/YYYY
      const parts = isoDate.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
      }
      return isoDate;
    } catch (e) {
      return isoDate;
    }
  };

  const formatGenderToVietnamese = (gender) => {
    if (!gender) return 'N/A';
    if (gender === 'MALE') return 'Nam';
    if (gender === 'FEMALE') return 'Nữ';
    return gender;
  };

  const loadCCCDData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading CCCD data...');
      
      // Lấy CCCD đầu tiên từ danh sách (hoặc từ params nếu có)
      const citizenId = route.params?.citizenId;
      console.log('🔍 Citizen ID from params:', citizenId);
      
      if (citizenId) {
        console.log('🔍 Fetching CCCD document by citizen ID:', citizenId);
        
        try {
          // Thử lấy Documents + CCCD trước
          const cccdDocument = await documentsAPI.getCCCDByCitizen(citizenId);
          console.log('✅ Got CCCD document:', JSON.stringify(cccdDocument, null, 2));
          console.log('✅ CCCD fields:', {
            so_cccd: cccdDocument.so_cccd,
            origin_place: cccdDocument.origin_place,
            current_place: cccdDocument.current_place,
            citizen_name: cccdDocument.citizen_name,
            citizen_dob: cccdDocument.citizen_dob
          });
          setCccdData(cccdDocument);
        } catch (docError) {
          console.warn('⚠️ No CCCD document found:', docError.message);
          console.warn('⚠️ Error response:', docError.response?.data);
          console.warn('⚠️ Falling back to citizen data');
          // Fallback: Nếu chưa có Documents, lấy citizen data
          const data = await citizensAPI.getById(citizenId);
          console.log('✅ Got citizen data (fallback):', data);
          setCccdData(data);
        }
      } else {
        console.log('🔍 No citizen ID, fetching all citizens...');
        // Lấy citizen đầu tiên
        const citizens = await citizensAPI.getAll();
        console.log('✅ Got citizens list:', citizens);
        console.log('✅ Citizens count:', citizens?.length);
        
        if (citizens && citizens.length > 0) {
          console.log('✅ Using first citizen:', citizens[0]);
          const firstCitizen = citizens[0];
          
          // Thử lấy CCCD document nếu có
          try {
            const cccdDocument = await documentsAPI.getCCCDByCitizen(firstCitizen.id);
            console.log('✅ Got CCCD document for first citizen:', cccdDocument);
            setCccdData(cccdDocument);
          } catch (docError) {
            console.warn('⚠️ No CCCD document for first citizen, using citizen data');
            setCccdData(firstCitizen);
          }
        } else {
          console.log('⚠️ No citizens found');
        }
      }
    } catch (error) {
      console.error('❌ Error loading CCCD:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Lỗi', 'Không thể tải thông tin CCCD: ' + error.message);
    } finally {
      setLoading(false);
    }
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

  if (!cccdData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin CCCD</Text>
          <CustomButton 
            title="Quay lại" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
        </View>

        <DocumentHeader title="Căn Cước Công Dân" icon="🪪" />

        <View style={styles.cccdCard}>
          {/* Header thẻ CCCD */}
          <View style={styles.cccdHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.countryText}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
              <Text style={styles.mottoText}>Độc lập - Tự do - Hạnh phúc</Text>
            </View>
            <View style={styles.qrCode}>
              <Text style={styles.qrText}>📱</Text>
            </View>
          </View>

          {/* Title CCCD */}
          <View style={styles.cccdTitleSection}>
            <Text style={styles.cccdTitle}>CĂN CƯỚC CÔNG DÂN</Text>
            <Text style={styles.cccdSubtitle}>Citizen Identity Card</Text>
          </View>

          {/* Nội dung chính */}
          <View style={styles.cccdContent}>
            {/* Cột trái - Ảnh và thông tin cơ bản */}
            <View style={styles.leftColumn}>
              <View style={styles.photoBox}>
                <Text style={styles.photoIcon}>👤</Text>
              </View>
              <View style={styles.expirySection}>
                <Text style={styles.expiryLabel}>Số CCCD / ID No.:</Text>
                <Text style={styles.expiryValue}>{cccdData.so_cccd || 'N/A'}</Text>
              </View>
            </View>

            {/* Cột phải - Thông tin chi tiết */}
            <View style={styles.rightColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Họ và tên / Full name:</Text>
                <Text style={styles.infoValueBold}>{cccdData.citizen_name || cccdData.name || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRowDouble}>
                <View style={styles.infoRowHalf}>
                  <Text style={styles.infoLabel}>Ngày sinh / Date of birth:</Text>
                  <Text style={styles.infoValue}>{formatDateToVietnamese(cccdData.citizen_dob || cccdData.date_of_birth)}</Text>
                </View>
                <View style={styles.infoRowHalf}>
                  <Text style={styles.infoLabel}>Giới tính / Sex:</Text>
                  <Text style={styles.infoValue}>{formatGenderToVietnamese(cccdData.citizen_gender || cccdData.gender)}</Text>
                </View>
              </View>

              <View style={styles.infoRowDouble}>
                <View style={styles.infoRowHalf}>
                  <Text style={styles.infoLabel}>Quốc tịch / Nationality:</Text>
                  <Text style={styles.infoValue}>{cccdData.citizen_nationality || cccdData.nationality || 'Việt Nam'}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quê quán / Origin place:</Text>
                <Text style={styles.infoValue}>{cccdData.origin_place || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nơi thường trú / Current place:</Text>
                <Text style={styles.infoValue}>{cccdData.current_place || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRowDouble}>
                <View style={styles.infoRowHalf}>
                  <Text style={styles.infoLabel}>Ngày cấp / Issue date:</Text>
                  <Text style={styles.infoValue}>{formatDateToVietnamese(cccdData.issue_date) || 'N/A'}</Text>
                </View>
                <View style={styles.infoRowHalf}>
                  <Text style={styles.infoLabel}>Có giá trị đến / Expire date:</Text>
                  <Text style={styles.infoValue}>{formatDateToVietnamese(cccdData.expire_date) || 'N/A'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Nút hành động */}
        <View style={styles.detailsCard}>
          <View style={styles.actionButtons}>
            <CustomButton 
              title="Xem QR Code" 
              onPress={() => navigation.navigate('QRCode')} 
            />
            <CustomButton 
              title="Chỉnh sửa" 
              variant="secondary" 
              onPress={() => Alert.alert('Chỉnh sửa', 'Chức năng đang phát triển')} 
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
  header: {
    padding: 20,
    paddingTop: 10
  },
  backButton: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 10
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray[500]
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    marginBottom: 20,
    textAlign: 'center'
  },
  cccdCard: {
    backgroundColor: '#e8f4f8',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#4a90a4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  cccdHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#4a90a4',
  },
  headerLeft: {
    flex: 1,
  },
  countryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1e3a8a',
    letterSpacing: 0.5,
  },
  mottoText: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#1e3a8a',
    marginTop: 2,
  },
  qrCode: {
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrText: {
    fontSize: 24,
  },
  cccdTitleSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  cccdTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    letterSpacing: 1,
  },
  cccdSubtitle: {
    fontSize: 11,
    color: '#1e3a8a',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cccdContent: {
    flexDirection: 'row',
  },
  leftColumn: {
    width: 110,
    marginRight: 12,
  },
  photoBox: {
    width: 100,
    height: 130,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4a90a4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  photoIcon: {
    fontSize: 48,
  },
  expirySection: {
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 6,
  },
  expiryLabel: {
    fontSize: 9,
    color: '#1e3a8a',
    fontStyle: 'italic',
  },
  expiryValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
  },
  rightColumn: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoRowDouble: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoRowHalf: {
    flex: 1,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 9,
    color: '#1e3a8a',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 11,
    color: '#000',
    fontWeight: '500',
  },
  infoValueBold: {
    fontSize: 13,
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  photoSection: {
    alignItems: 'center',
    padding: 20
  },
  photoPlaceholder: {
    width: 150,
    height: 180,
    backgroundColor: COLORS.gray[200],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[300]
  },
  photoIcon: {
    fontSize: 64
  },
  photoLabel: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 8
  },
  detailsCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray[500]
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error || COLORS.gray[500],
    marginBottom: 20,
    textAlign: 'center'
  }
});