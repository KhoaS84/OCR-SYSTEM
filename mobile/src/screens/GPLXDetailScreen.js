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
import { citizensAPI } from '../services/api';

export default function GPLXDetailScreen({ navigation, route }) {
  const [gplxData, setGplxData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGPLXData();
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

  const loadGPLXData = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading citizen data for GPLX...');
      
      const citizenId = route.params?.citizenId;
      console.log('🔍 Citizen ID from params:', citizenId);
      
      if (citizenId) {
        console.log('🔍 Fetching citizen by ID:', citizenId);
        const data = await citizensAPI.getById(citizenId);
        console.log('✅ Got citizen data:', data);
        setGplxData(data);
      } else {
        console.log('🔍 No citizen ID, fetching all citizens...');
        const citizens = await citizensAPI.search('');
        console.log('✅ Got citizens list:', citizens);
        
        if (citizens && citizens.length > 0) {
          console.log('✅ Using first citizen:', citizens[0]);
          setGplxData(citizens[0]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading citizen data:', error);
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

  if (!gplxData) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
        <ScrollView style={styles.scrollView}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.backButton}>← Quay lại</Text>
            </TouchableOpacity>
          </View>

          <DocumentHeader title="Giấy Phép Lái Xe" icon="🚗" />

          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyText}>Chưa có dữ liệu GPLX</Text>
            <Text style={styles.emptySubtext}>Vui lòng quét giấy phép lái xe của bạn</Text>
            <CustomButton 
              title="Quét GPLX" 
              onPress={() => navigation.navigate('ScanResult', { docType: 'GPLX' })} 
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

        <DocumentHeader title="Giấy Phép Lái Xe" icon="🚗" />

        <View style={styles.gplxCard}>
          {/* Header thẻ GPLX */}
          <View style={styles.gplxHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.ministryText}>BỘ GTVT MOT</Text>
            </View>
            <View style={styles.headerCenter}>
              <Text style={styles.countryText}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</Text>
              <Text style={styles.mottoText}>Độc lập - Tự do - Hạnh phúc</Text>
            </View>
          </View>

          {/* Title GPLX */}
          <View style={styles.gplxTitleSection}>
            <Text style={styles.gplxTitle}>GIẤY PHÉP LÁI XE</Text>
            <Text style={styles.gplxSubtitle}>DRIVER'S LICENSE</Text>
            <Text style={styles.licenseNumber}>Số/No: {gplxData.license_number || 'N/A'}</Text>
          </View>

          {/* Nội dung chính */}
          <View style={styles.gplxContent}>
            {/* Cột trái - Ảnh */}
            <View style={styles.leftColumn}>
              <View style={styles.photoBox}>
                <Text style={styles.photoIcon}>👤</Text>
              </View>
            </View>

            {/* Cột phải - Thông tin chi tiết */}
            <View style={styles.rightColumn}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Họ tên/Full name:</Text>
                <Text style={styles.infoValueBold}>{gplxData.name || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày sinh/Date of Birth:</Text>
                <Text style={styles.infoValue}>{gplxData.dob || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Quốc tịch/Nationality:</Text>
                <Text style={styles.infoValue}>{gplxData.nationality || 'VIỆT NAM'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nơi cư trú/Address:</Text>
                <Text style={styles.infoValue}>{gplxData.origin_place || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Nơi cấp/Place of issue:</Text>
                <Text style={styles.infoValue}>{gplxData.place_of_issue || 'N/A'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Ngày cấp/Date of issue:</Text>
                <Text style={styles.infoValue}>{gplxData.issue_date || 'N/A'}</Text>
              </View>
            </View>
          </View>

          {/* Phần dưới - Hạng và hết hạn */}
          <View style={styles.gplxFooter}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerLabel}>Hạng/Class:</Text>
              <Text style={styles.footerValueBold}>{gplxData.license_class || 'N/A'}</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.footerLabel}>Có giá trị đến/Expires:</Text>
              <Text style={styles.footerValue}>{gplxData.expiry_date || 'Không thời hạn'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <View style={styles.actionButtons}>
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
  },
  gplxCard: {
    backgroundColor: '#fff8dc',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#d4af37',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  gplxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  headerLeft: {
    width: 80,
  },
  ministryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8b0000',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  countryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8b0000',
    textAlign: 'center',
  },
  mottoText: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#8b0000',
    marginTop: 2,
  },
  gplxTitleSection: {
    alignItems: 'center',
    marginBottom: 12,
  },
  gplxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626',
    letterSpacing: 0.5,
  },
  gplxSubtitle: {
    fontSize: 10,
    color: '#8b0000',
    fontStyle: 'italic',
    marginTop: 2,
  },
  licenseNumber: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
  },
  gplxContent: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  leftColumn: {
    width: 90,
    marginRight: 12,
  },
  photoBox: {
    width: 80,
    height: 100,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d4af37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    fontSize: 40,
  },
  rightColumn: {
    flex: 1,
  },
  infoRow: {
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 8,
    color: '#8b0000',
    fontStyle: 'italic',
    marginBottom: 1,
  },
  infoValue: {
    fontSize: 10,
    color: '#000',
    fontWeight: '500',
  },
  infoValueBold: {
    fontSize: 11,
    color: '#000',
    fontWeight: 'bold',
  },
  gplxFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#d4af37',
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 9,
    color: '#8b0000',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  footerValue: {
    fontSize: 10,
    color: '#000',
    fontWeight: '500',
  },
  footerValueBold: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
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
    paddingTop: 0
  }
});