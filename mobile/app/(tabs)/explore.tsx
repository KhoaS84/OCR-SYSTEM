import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { getUserProfile, updateUserProfile } from '@/services/user-service';
import { uploadCCCD, getDocuments } from '@/services/document-service';
import { processOCR, processFullCCCD } from '@/services/ocr-service';
import { getCitizens, searchCitizens, createCitizen } from '@/services/citizen-service';

export default function ExploreScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const showResult = (title: string, data: any) => {
    const resultText = `${title}\n\n${JSON.stringify(data, null, 2)}`;
    setResult(resultText);
  };

  const testAPI = async (
    testName: string,
    testFn: () => Promise<any>
  ) => {
    try {
      setLoading(true);
      setResult('Đang xử lý...');
      const response = await testFn();
      showResult(`✅ ${testName}`, response);
    } catch (error) {
      showResult(
        `❌ ${testName} - Lỗi`,
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mock API Testing</Text>
        <Text style={styles.subtitle}>Test các mock services</Text>
      </View>

      {/* User Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👤 User Services</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => testAPI('Get User Profile', getUserProfile)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            testAPI('Update Profile', () =>
              updateUserProfile({
                fullName: 'Nguyễn Văn B',
                phoneNumber: '0987654321',
              })
            )
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Update Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Document Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📄 Document Services</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            testAPI('Upload CCCD', () =>
              uploadCCCD({
                frontImage: 'base64_front_image_data',
                backImage: 'base64_back_image_data',
              })
            )
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Upload CCCD</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => testAPI('Get Documents', getDocuments)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get Documents</Text>
        </TouchableOpacity>
      </View>

      {/* OCR Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔍 OCR Services</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            testAPI('Process OCR Front', () =>
              processOCR({
                imageUrl: 'https://example.com/cccd-front.jpg',
                documentType: 'cccd_front',
              })
            )
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>OCR - Mặt trước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            testAPI('Process Full CCCD', () =>
              processFullCCCD(
                'https://example.com/cccd-front.jpg',
                'https://example.com/cccd-back.jpg'
              )
            )
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>OCR - Cả 2 mặt</Text>
        </TouchableOpacity>
      </View>

      {/* Citizen Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏛️ Citizen Services</Text>
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => testAPI('Get Citizens', getCitizens)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Get All Citizens</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            testAPI('Search Citizens', () =>
              searchCitizens({
                query: 'NGUYỄN',
                field: 'name',
              })
            )
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Search Citizens</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() =>
            testAPI('Create Citizen', () =>
              createCitizen({
                citizenId: '001234567899',
                name: 'LÊ VĂN C',
                dateOfBirth: '10/10/1995',
                sex: 'Nam',
                nationality: 'Việt Nam',
                placeOfOrigin: 'TP. Hồ Chí Minh, Việt Nam',
                placeOfResidence: 'Số 789, Đường GHI, Quận 7, TP. HCM',
                documentNumber: '001234567899',
                issueDate: '10/10/2021',
                expiryDate: '10/10/2036',
              })
            )
          }
          disabled={loading}
        >
          <Text style={styles.buttonText}>Create Citizen</Text>
        </TouchableOpacity>
      </View>

      {/* Result Display */}
      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả:</Text>
          <ScrollView style={styles.resultScroll}>
            <Text style={styles.resultText}>{result}</Text>
          </ScrollView>
        </View>
      )}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#C41E3A" />
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tất cả các API trên đang chạy ở chế độ mock
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#C41E3A',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  button: {
    backgroundColor: '#C41E3A',
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  resultContainer: {
    backgroundColor: 'white',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    maxHeight: 300,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  resultScroll: {
    maxHeight: 250,
  },
  resultText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
