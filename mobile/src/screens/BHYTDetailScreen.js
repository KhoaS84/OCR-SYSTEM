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
import { documentsAPI } from '../services/api';

export default function BHYTDetailScreen({ navigation, route }) {
  const [bhytData, setBhytData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBHYTData();
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

  const loadBHYTData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading BHYT data...');
      
      const citizenId = route.params?.citizenId;
      console.log('🔍 Citizen ID from params:', citizenId);
      
      if (citizenId) {
        console.log('🔍 Fetching BHYT by citizen ID:', citizenId);
        const data = await documentsAPI.getBHYTByCitizen(citizenId);
        console.log('✅ Got BHYT data:', data);
        setBhytData(data);
      } else {
        console.log('⚠️ No citizen ID provided');
        Alert.alert('Lỗi', 'Không có thông tin công dân');
      }
    } catch (error) {
      console.error('❌ Error loading BHYT data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bhytData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Quay lại</Text>
            </TouchableOpacity>
          </View>

          <DocumentHeader title="Bảo Hiểm Y Tế" icon="🏥" />

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>Chưa có dữ liệu thẻ BHYT</Text>
            <Text style={styles.emptySubtext}>Vui lòng quét thẻ bảo hiểm y tế của bạn</Text>
            <CustomButton 
              title="Quét thẻ BHYT" 
              onPress={() => navigation.navigate('ScanResult', { docType: 'BHYT' })} 
            />
          </View>
        </ScrollView>
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

        <DocumentHeader title="Bảo Hiểm Y Tế" icon="🏥" />

        {/* BHYT Card - Giống như thẻ thật */}
        <View style={styles.bhytCard}>
          {/* Header của thẻ */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderTitle}>BẢO HIỂM XÃ HỘI VIỆT NAM</Text>
            <Text style={styles.cardHeaderSubtitle}>THẺ BẢO HIỂM Y TẾ</Text>
          </View>

          {/* Photo và thông tin chính */}
          <View style={styles.cardMainSection}>
            <View style={styles.photoSection}>
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoIcon}>👤</Text>
              </View>
            </View>

            <View style={styles.cardInfoSection}>
              <InfoField 
                label="Số BHYT" 
                value={bhytData.so_bhyt || 'N/A'} 
                style={styles.primaryField}
              />
              <InfoField 
                label="Họ và tên" 
                value={bhytData.citizen_name || 'N/A'} 
              />
              <InfoField 
                label="Ngày sinh" 
                value={formatDateToVietnamese(bhytData.citizen_dob)} 
              />
              <InfoField 
                label="Giới tính" 
                value={formatGenderToVietnamese(bhytData.citizen_gender)} 
              />
              <InfoField 
                label="Nơi ĐK KCB" 
                value={bhytData.hospital_code || 'N/A'} 
              />
            </View>
          </View>

          {/* Thông tin bổ sung */}
          <View style={styles.cardAdditionalInfo}>
            <InfoField 
              label="Giá trị sử dụng" 
              value={bhytData.issue_date ? `Từ ngày ${formatDateToVietnamese(bhytData.issue_date)}` : 'N/A'} 
            />
            <InfoField 
              label="Hết hạn" 
              value={formatDateToVietnamese(bhytData.expire_date)} 
            />
            <InfoField 
              label="Nơi cấp thẻ BHYT" 
              value={bhytData.insurance_area || 'N/A'} 
            />
          </View>
        </View>

        <View style={styles.actionButtons}>
          <CustomButton 
            title="Chỉnh sửa" 
            variant="secondary" 
            onPress={() => Alert.alert('Chỉnh sửa', 'Chức năng đang phát triển')} 
          />
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
  
  // BHYT Card styles - Giống thẻ thật
  bhytCard: {
    backgroundColor: COLORS.white,
    margin: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.gray[200]
  },
  cardHeader: {
    backgroundColor: '#1E40AF', // Màu xanh dương như thẻ BHYT thật
    padding: 16,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center'
  },
  cardHeaderTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  cardHeaderSubtitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center'
  },
  cardMainSection: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[200]
  },
  photoSection: {
    marginRight: 16
  },
  photoPlaceholder: {
    width: 100,
    height: 120,
    backgroundColor: COLORS.gray[200],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray[300]
  },
  photoIcon: {
    fontSize: 48
  },
  cardInfoSection: {
    flex: 1
  },
  primaryField: {
    backgroundColor: '#FEF3C7', // Highlight số BHYT
    padding: 8,
    borderRadius: 6,
    marginBottom: 8
  },
  cardAdditionalInfo: {
    padding: 16,
    backgroundColor: '#F9FAFB'
  },
  
  actionButtons: {
    padding: 20,
    paddingTop: 0
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray[700],
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray[500],
    marginBottom: 24,
    textAlign: 'center'
  }
});