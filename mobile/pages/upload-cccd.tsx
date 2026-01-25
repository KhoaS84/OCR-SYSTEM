import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { uploadCCCD } from '../services/document-service';
import { processFullCCCD } from '../services/ocr-service';

export default function UploadCCCDScreen() {
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền truy cập',
        'Ứng dụng cần quyền truy cập thư viện ảnh để tải lên CCCD'
      );
      return false;
    }
    return true;
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Cần quyền truy cập',
        'Ứng dụng cần quyền truy cập camera để chụp ảnh CCCD'
      );
      return false;
    }
    return true;
  };

  const pickImage = async (side: 'front' | 'back') => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    Alert.alert(
      'Chọn ảnh CCCD',
      `Chọn ảnh mặt ${side === 'front' ? 'trước' : 'sau'} CCCD`,
      [
        {
          text: 'Chụp ảnh',
          onPress: () => takePhoto(side),
        },
        {
          text: 'Chọn từ thư viện',
          onPress: () => selectFromLibrary(side),
        },
        {
          text: 'Hủy',
          style: 'cancel',
        },
      ]
    );
  };

  const takePhoto = async (side: 'front' | 'back') => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (side === 'front') {
        setFrontImage(result.assets[0].uri);
      } else {
        setBackImage(result.assets[0].uri);
      }
    }
  };

  const selectFromLibrary = async (side: 'front' | 'back') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      if (side === 'front') {
        setFrontImage(result.assets[0].uri);
      } else {
        setBackImage(result.assets[0].uri);
      }
    }
  };

  const handleUpload = async () => {
    if (!frontImage || !backImage) {
      Alert.alert(
        'Thiếu ảnh',
        'Vui lòng chọn cả ảnh mặt trước và mặt sau của CCCD'
      );
      return;
    }

    try {
      setIsProcessing(true);

      // Upload CCCD
      const uploadResponse = await uploadCCCD({
        frontImage,
        backImage,
      });

      if (uploadResponse.success) {
        // Process OCR
        const ocrResponse = await processFullCCCD(frontImage, backImage);

        if (ocrResponse.success) {
          Alert.alert(
            'Thành công',
            'Upload và xử lý CCCD thành công!\n\n' +
            `Họ tên: ${ocrResponse.combinedData?.name}\n` +
            `Số CCCD: ${ocrResponse.combinedData?.citizenId}\n` +
            `Ngày sinh: ${ocrResponse.combinedData?.dateOfBirth}`,
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(tabs)'),
              },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert(
        'Lỗi',
        error instanceof Error ? error.message : 'Có lỗi xảy ra khi xử lý'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleRemoveImage = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(null);
    } else {
      setBackImage(null);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload CCCD</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instructionText}>
          Vui lòng chụp hoặc chọn ảnh mặt trước và mặt sau của CCCD
        </Text>

        {/* Front Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Mặt trước CCCD</Text>
          {frontImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: frontImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage('front')}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={() => pickImage('front')}
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Chụp/Chọn ảnh mặt trước</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Back Image */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Mặt sau CCCD</Text>
          {backImage ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: backImage }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveImage('back')}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadPlaceholder}
              onPress={() => pickImage('back')}
            >
              <Text style={styles.uploadIcon}>📷</Text>
              <Text style={styles.uploadText}>Chụp/Chọn ảnh mặt sau</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          style={[
            styles.uploadButton,
            (!frontImage || !backImage || isProcessing) &&
            styles.uploadButtonDisabled,
          ]}
          onPress={handleUpload}
          disabled={!frontImage || !backImage || isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.uploadButtonText}>Upload và Xử lý</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={isProcessing}
        >
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
      </View>

      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="#C41E3A" />
          <Text style={styles.processingText}>
            Đang upload và xử lý CCCD...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#C41E3A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  imageSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  uploadPlaceholder: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#C41E3A',
    borderStyle: 'dashed',
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  uploadIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  uploadText: {
    fontSize: 16,
    color: '#C41E3A',
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  removeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(196, 30, 58, 0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  uploadButton: {
    backgroundColor: '#C41E3A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  uploadButtonDisabled: {
    backgroundColor: '#ccc',
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
  },
});
