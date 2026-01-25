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
import DocumentHeader from '../components/DocumentHeader';
import InfoField from '../components/InfoField';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { DUMMY_GPLX } from '../data/dummyData';

export default function GPLXDetailScreen({ navigation }) {
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

        <View style={styles.photoSection}>
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>👤</Text>
            <Text style={styles.photoLabel}>Ảnh chân dung</Text>
          </View>
        </View>

        <View style={styles.detailsCard}>
          <InfoField label="Số giấy phép" value={DUMMY_GPLX.licenseNumber} />
          <InfoField label="Họ và tên" value={DUMMY_GPLX.fullName} />
          <InfoField label="Ngày sinh" value={DUMMY_GPLX.dob} />
          <InfoField label="Hạng" value={DUMMY_GPLX.class} />
          <InfoField label="Ngày cấp" value={DUMMY_GPLX.issueDate} />
          <InfoField label="Có giá trị đến" value={DUMMY_GPLX.expiryDate} />
          <InfoField label="Nơi cấp" value={DUMMY_GPLX.placeOfIssue} />
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
  }
});