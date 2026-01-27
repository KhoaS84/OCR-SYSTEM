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
      console.log('🔍 Loading citizen data for BHYT...');
      
      const citizenId = route.params?.citizenId;
      console.log('🔍 Citizen ID from params:', citizenId);
      
      if (citizenId) {
        console.log('🔍 Fetching citizen by ID:', citizenId);
        const data = await citizensAPI.getById(citizenId);
        console.log('✅ Got citizen data:', data);
        setBhytData(data);
      } else {
        console.log('🔍 No citizen ID, fetching all citizens...');
        const citizens = await citizensAPI.search('');
        console.log('✅ Got citizens list:', citizens);
        
        if (citizens && citizens.length > 0) {
          console.log('✅ Using first citizen:', citizens[0]);
          setBhytData(citizens[0]);
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

        <View style={styles.photoSection}>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>👤</Text>
            <Text style={styles.photoLabel}>Ảnh chân dung</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <InfoField label="ID" value={bhytData.id || 'N/A'} />
          <InfoField label="Họ và tên" value={bhytData.name || 'N/A'} />
          <InfoField label="Ngày sinh" value={formatDateToVietnamese(bhytData.date_of_birth)} />
          <InfoField label="Giới tính" value={formatGenderToVietnamese(bhytData.gender)} />
          <InfoField label="Quốc tịch" value={bhytData.nationality || 'Việt Nam'} />
          <InfoField label="User ID" value={bhytData.user_id || 'N/A'} />
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