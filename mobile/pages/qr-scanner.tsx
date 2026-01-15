import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Request camera permission on mount
    if (!permission?.granted) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (scanned || isProcessing) return;
    
    setScanned(true);
    setIsProcessing(true);

    // Xử lý dữ liệu QR code từ CCCD
    console.log(`QR Code type: ${type}, data: ${data}`);

    // Giả lập xử lý xác thực CCCD
    setTimeout(() => {
      Alert.alert(
        'Xác thực thành công',
        'Thông tin CCCD đã được xác thực',
        [
          {
            text: 'OK',
            onPress: () => {
              // Chuyển đến màn hình chính
              router.replace('/(tabs)');
            },
          },
        ]
      );
      setIsProcessing(false);
    }, 1500);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleRescan = () => {
    setScanned(false);
    setIsProcessing(false);
  };

  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#C41E3A" />
      </View>
    );
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Cần quyền truy cập Camera</Text>
          <Text style={styles.permissionMessage}>
            Ứng dụng cần quyền truy cập camera để quét mã QR trên CCCD của bạn
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Cấp quyền</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
              <Text style={styles.backButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Quét mã QR CCCD</Text>
            <View style={styles.backButton} />
          </View>

          {/* Scanning area */}
          <View style={styles.scanArea}>
            <View style={styles.scanFrame}>
              {/* Corner decorations */}
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            <Text style={styles.instructionText}>
              Đặt mã QR trong khung để quét
            </Text>

            {isProcessing && (
              <View style={styles.processingContainer}>
                <ActivityIndicator size="large" color="white" />
                <Text style={styles.processingText}>Đang xử lý...</Text>
              </View>
            )}
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomActions}>
            {scanned && !isProcessing && (
              <TouchableOpacity
                style={styles.rescanButton}
                onPress={handleRescan}
              >
                <Text style={styles.rescanButtonText}>Quét lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    fontSize: 18,
    fontWeight: '600',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#C41E3A',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    marginTop: 30,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  processingContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  processingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  bottomActions: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  rescanButton: {
    backgroundColor: '#C41E3A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  rescanButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f5f5f5',
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: '#C41E3A',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
