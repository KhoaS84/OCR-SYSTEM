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
import InfoField from '../components/InfoField';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { DUMMY_SCAN_RESULT } from '../data/dummyData';

export default function ScanResultScreen({ navigation }) {
  const [scanResult] = useState(DUMMY_SCAN_RESULT);

  const handleSave = () => {
    Alert.alert('Thành công', 'Đã lưu thông tin giấy tờ!', [
      { text: 'OK', onPress: () => navigation.navigate('Home') }
    ]);
  };

  const handleRescan = () => {
    Alert.alert('Quét lại', 'Chức năng quét đang được phát triển');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Quay lại</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Kết Quả Quét</Text>
        </View>

        <View style={styles.scanResultContainer}>
          <View style={styles.scanTypeCard}>
            <Text style={styles.scanTypeIcon}>📄</Text>
            <Text style={styles.scanTypeText}>
              Loại giấy tờ: {scanResult.documentType}
            </Text>
            <Text style={styles.scanConfidence}>
              Độ chính xác: {scanResult.confidence}%
            </Text>
          </View>

          <View style={styles.extractedDataCard}>
            <Text style={styles.sectionTitle}>Thông tin trích xuất</Text>
            <Text style={styles.editHint}>
              * Nhấn vào các trường để chỉnh sửa nếu cần
            </Text>
            {Object.entries(scanResult.extractedData).map(([key, value], index) => (
              <InfoField key={index} label={key} value={value} editable />
            ))}
          </View>

          <View style={styles.actionButtons}>
            <CustomButton title="Lưu thông tin" onPress={handleSave} />
            <CustomButton 
              title="Quét lại" 
              variant="secondary" 
              onPress={handleRescan} 
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.black
  },
  scanResultContainer: {
    padding: 20,
    paddingTop: 0
  },
  scanTypeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  scanTypeIcon: {
    fontSize: 48,
    marginBottom: 12
  },
  scanTypeText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8
  },
  scanConfidence: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '600'
  },
  extractedDataCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 8
  },
  editHint: {
    fontSize: 12,
    color: COLORS.gray[500],
    fontStyle: 'italic',
    marginBottom: 12
  },
  actionButtons: {
    paddingTop: 0
  }
});