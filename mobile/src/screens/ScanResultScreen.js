import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Platform,
  Modal
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { CameraView, useCameraPermissions } from 'expo-camera';
import InfoField from '../components/InfoField';
import CustomButton from '../components/CustomButton';
import { COLORS } from '../constants/colors';
import { ocrAPI, citizensAPI, usersAPI, documentsAPI } from '../services/api';

export default function ScanResultScreen({ navigation, route }) {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const docType = route.params?.docType || 'CCCD';
  
  // For CCCD dual-sided scanning
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [currentSide, setCurrentSide] = useState('front'); // 'front' or 'back'
  const [frontData, setFrontData] = useState({});
  const [backData, setBackData] = useState({});
  
  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [cameraSide, setCameraSide] = useState('front'); // Track which side we're capturing

  useEffect(() => {
    // Request permissions on mount
    if (Platform.OS !== 'web') {
      requestCameraPermission();
    }
  }, []);

  const handlePickImage = async (side = null) => {
    try {
      const targetSide = side || currentSide;
      console.log('🖼️ Step 1: Opening image library for', targetSide, '...');
      const result = await ImagePicker.launchImageLibraryAsync({
        quality: 0.3,
      });

      console.log('🖼️ Step 2: Image picker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log('🖼️ Step 3: Image URI for', targetSide, ':', imageUri);
        
        setTimeout(() => {
          console.log('🖼️ Step 4: Calling processImage for', targetSide);
          processImage(imageUri, targetSide);
        }, 200);
      } else {
        console.log('🖼️ User canceled picker');
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Lỗi', 'Không thể chọn ảnh: ' + (error.message || 'Unknown error'));
    }
  };

  const handleTakePhoto = async (side = null) => {
    try {
      const targetSide = side || currentSide;
      console.log('📸 Opening camera for', targetSide);
      console.log('📸 Camera permission:', cameraPermission);
      
      // Check permission
      if (!cameraPermission || !cameraPermission.granted) {
        console.log('📸 Requesting camera permission...');
        const result = await requestCameraPermission();
        console.log('📸 Permission result:', result);
        
        if (!result || !result.granted) {
          Alert.alert(
            'Cần cấp quyền camera',
            'Vui lòng cấp quyền camera trong cài đặt để chụp ảnh',
            [{ text: 'OK' }]
          );
          return;
        }
      }
      
      console.log('📸 Permission granted, opening camera modal...');
      
      // Open camera modal
      setCameraSide(targetSide);
      setShowCamera(true);
      
      console.log('📸 Camera modal opened for side:', targetSide);
    } catch (error) {
      console.error('❌ Camera error:', error);
      console.error('❌ Error stack:', error.stack);
      Alert.alert('Lỗi Camera', 'Không thể mở camera: ' + error.message);
    }
  };
  
  const takePicture = async () => {
    if (!cameraRef.current) {
      console.error('❌ Camera ref is null');
      Alert.alert('Lỗi', 'Camera chưa sẵn sàng');
      return;
    }
    
    try {
      console.log('📸 Taking picture...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.5,
        base64: false,
        exif: false,
      });
      
      console.log('📸 Photo taken:', photo.uri);
      console.log('📸 Closing camera modal');
      setShowCamera(false);
      
      // Process the image
      console.log('📸 Processing image for side:', cameraSide);
      processImage(photo.uri, cameraSide);
    } catch (error) {
      console.error('❌ Take picture error:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      Alert.alert('Lỗi', 'Không thể chụp ảnh: ' + error.message);
    }
  };

  const processImage = async (imageUri, side = 'front') => {
    console.log('🔄 Starting processImage for:', imageUri, 'side:', side);
    
    try {
      setLoading(true);
      console.log('⏳ Set loading to true');
      
      // Gọi API OCR để extract thông tin
      console.log('📡 Calling ocrAPI.extractText...');
      const result = await ocrAPI.extractText(imageUri);
      
      console.log('✅ OCR result received:', JSON.stringify(result, null, 2));
      
      // Parse detections_with_text thành extractedData
      const extractedData = {};
      if (result.detections_with_text && Array.isArray(result.detections_with_text)) {
        result.detections_with_text.forEach(detection => {
          const fieldName = detection.class_name || 'unknown';
          const fieldValue = detection.text || '';
          
          // Map field names sang tiếng Việt cho CCCD
          const cccdFieldMapping = {
            'name': 'Họ và tên',
            'id': 'Số CCCD',
            'dob': 'Ngày sinh',
            'gender': 'Giới tính',
            'nationality': 'Quốc tịch',
            'origin_place1': 'Quê quán (1)',
            'origin_place2': 'Quê quán (2)',
            'current_place1': 'Nơi thường trú (1)',
            'current_place2': 'Nơi thường trú (2)',
            'expire_date': 'Có giá trị đến',
            'cccd': 'Loại giấy tờ'
          };
          
          // Map field names cho GPLX
          const gplxFieldMapping = {
            'gplx': 'Loại thẻ',
            'id': 'Mã thẻ',
            'name': 'Họ và tên',
            'dob': 'Ngày tháng năm sinh',
            'nationality': 'Quốc tịch',
            'origin_place': 'Nơi cư trú',
            'origin_place1': 'Nơi cư trú',
            'origin_place2': 'Nơi cư trú',
            'address': 'Nơi cư trú',
            'iplace': 'Nơi cấp',
            'place_of_issue': 'Nơi cấp',
            'iday': 'Ngày cấp (ngày)',
            'imonth': 'Ngày cấp (tháng)',
            'iyear': 'Ngày cấp (năm)',
            'issue_date': 'Ngày cấp',
            'level': 'Hạng thẻ',
            'class': 'Hạng thẻ',
            'expire_date': 'Ngày thẻ hết hạn',
            'expiry_date': 'Ngày thẻ hết hạn'
          };
          
          // Chọn mapping dựa trên docType
          const fieldMapping = docType === 'GPLX' ? gplxFieldMapping : cccdFieldMapping;
          
          const displayName = fieldMapping[fieldName] || fieldName;
          extractedData[displayName] = fieldValue;
        });
      }
      
      console.log('✅ Parsed extracted data for', side, ':', extractedData);
      
      // Lưu theo side (front/back) cho CCCD
      if (docType === 'CCCD') {
        if (side === 'front') {
          setFrontImage(imageUri);
          setFrontData(extractedData);
          setCurrentSide('back');
          console.log('✅ Saved front data');
          
          // Set temporary scanResult to show front data
          const tempScanResult = {
            documentType: 'CCCD',
            confidence: Math.round((result.detections_with_text?.[0]?.confidence || 0) * 100),
            extractedData: extractedData,
            raw: result,
            isPartial: true,
            side: 'front'
          };
          setScanResult(tempScanResult);
          setExtractedData(extractedData);
          
          // Cho phép chọn cách quét mặt sau
          setTimeout(() => {
            Alert.alert(
              'Mặt trước đã quét ✓',
              'Vui lòng quét mặt sau của CCCD để hoàn thành',
              [
                { 
                  text: 'Chụp ảnh', 
                  onPress: () => {
                    setTimeout(() => handleTakePhoto('back'), 300);
                  }
                },
                {
                  text: 'Chọn từ thư viện',
                  onPress: () => {
                    setTimeout(() => handlePickImage('back'), 300);
                  }
                }
              ]
            );
          }, 800);
        } else if (side === 'back') {
          console.log('✅ Processing back side...');
          console.log('📋 Current frontData:', frontData);
          console.log('📋 Current extractedData (back):', extractedData);
          
          setBackImage(imageUri);
          setBackData(extractedData);
          
          // Merge front + back data - use callback to get latest frontData
          setFrontData(currentFrontData => {
            console.log('📋 Merging with frontData:', currentFrontData);
            const mergedData = { ...currentFrontData, ...extractedData };
            console.log('✅ Merged front + back data:', mergedData);
            
            const scanResultData = {
              documentType: 'CCCD',
              confidence: Math.round((result.detections_with_text?.[0]?.confidence || 0) * 100),
              extractedData: mergedData,
              raw: result,
              isPartial: false,
              hasBothSides: true
            };
            
            setScanResult(scanResultData);
            setExtractedData(mergedData);
            
            console.log('✅ Both sides scanned successfully');
            console.log('✅ Final merged extractedData:', mergedData);
            console.log('✅ scanResult.isPartial:', scanResultData.isPartial);
            console.log('✅ scanResult.hasBothSides:', scanResultData.hasBothSides);
            
            // Show success message
            setTimeout(() => {
              Alert.alert(
                'Hoàn thành! ✓',
                'Đã quét đầy đủ 2 mặt CCCD. Vui lòng kiểm tra thông tin và nhấn "Lưu thông tin".',
                [{ text: 'OK' }]
              );
            }, 500);
            
            return currentFrontData; // Return unchanged
          });
        }
      } else {
        // For non-CCCD documents, use old flow
        const scanResultData = {
          documentType: docType,
          confidence: Math.round((result.detections_with_text?.[0]?.confidence || 0) * 100),
          extractedData: extractedData,
          raw: result
        };
        
        setScanResult(scanResultData);
        setExtractedData(extractedData);
      }
      
      console.log('✅ State updated successfully');
    } catch (error) {
      console.error('❌ OCR error in processImage:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error stack:', error.stack);
      
      Alert.alert(
        'Lỗi OCR', 
        'Không thể xử lý ảnh. Vui lòng thử lại.\n\n' + 
        (error.message || 'Lỗi không xác định'),
        [{ text: 'OK' }]
      );
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('💾 handleSave called');
    console.log('💾 Document Type:', docType);
    console.log('💾 Current extractedData:', extractedData);
    console.log('💾 Front image:', frontImage);
    console.log('💾 Back image:', backImage);
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
      console.log('❌ No data to save');
      Alert.alert('Lỗi', 'Không có dữ liệu để lưu');
      return;
    }
    
    // Kiểm tra CCCD phải có đủ 2 mặt
    if (docType === 'CCCD' && (!frontImage || !backImage)) {
      Alert.alert(
        'Thiếu dữ liệu',
        'Vui lòng quét cả mặt trước và mặt sau của CCCD',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setLoading(true);
      
      console.log('💾 Preparing data for', docType);
      
      // Lấy thông tin user hiện tại để có user_id
      const currentUser = await usersAPI.getMe();
      console.log('👤 Current user:', currentUser);
      
      if (!currentUser || !currentUser.id) {
        Alert.alert('Lỗi', 'Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        return;
      }
      
      // Helper: Convert date từ DD/MM/YYYY sang YYYY-MM-DD
      const convertDateFormat = (dateStr) => {
        if (!dateStr) return null;
        try {
          // Kiểm tra xem đã đúng format ISO chưa
          if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr;
          
          // Convert DD/MM/YYYY -> YYYY-MM-DD
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          return null;
        } catch (e) {
          console.error('Error converting date:', e);
          return null;
        }
      };
      
      // Helper: Convert gender từ tiếng Việt sang MALE/FEMALE
      const convertGender = (genderStr) => {
        if (!genderStr) return null;
        const normalized = genderStr.toLowerCase().trim();
        if (normalized === 'nam' || normalized === 'male') return 'MALE';
        if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female') return 'FEMALE';
        return null;
      };
      
      // Với schema mới: chỉ lưu vào Citizens với user_id
      // CCCD, GPLX, BHYT đều được lưu vào Citizens trước, sau đó tạo Documents nếu cần
      
      const rawDob = extractedData['Ngày sinh'] || extractedData['Ngày tháng năm sinh'] || extractedData['dob'];
      const rawGender = extractedData['Giới tính'] || extractedData['gender'];
      
      const citizenData = {
        user_id: currentUser.id,
        name: extractedData['Họ và tên'] || extractedData['name'] || '',
        date_of_birth: convertDateFormat(rawDob),
        gender: convertGender(rawGender),
        nationality: extractedData['Quốc tịch'] || extractedData['nationality'] || 'Việt Nam'
      };

      console.log('💾 Raw DOB:', rawDob, '-> Converted:', citizenData.date_of_birth);
      console.log('💾 Raw Gender:', rawGender, '-> Converted:', citizenData.gender);
      console.log('💾 Citizen data to save:', citizenData);
      
      const savedCitizen = await citizensAPI.create(citizenData);
      console.log('✅ Saved citizen:', savedCitizen);
      
      // Nếu là CCCD, tạo thêm Documents + CCCD record
      if (docType === 'CCCD' && savedCitizen && savedCitizen.id) {
        try {
          console.log('💾 Preparing CCCD document data...');
          console.log('💾 All extractedData keys:', Object.keys(extractedData));
          console.log('💾 All extractedData:', extractedData);
          
          // Ghép origin_place từ origin_place1 và origin_place2
          const originPlace1 = extractedData['Quê quán (1)'] || '';
          const originPlace2 = extractedData['Quê quán (2)'] || '';
          const originPlace = [originPlace1, originPlace2].filter(p => p).join(', ');
          
          // Ghép current_place từ current_place1 và current_place2
          const currentPlace1 = extractedData['Nơi thường trú (1)'] || '';
          const currentPlace2 = extractedData['Nơi thường trú (2)'] || '';
          const currentPlace = [currentPlace1, currentPlace2].filter(p => p).join(', ');
          
          // Log để debug
          console.log('💾 Looking for issue_date in keys:', Object.keys(extractedData));
          console.log('💾 Ngày cấp:', extractedData['Ngày cấp']);
          console.log('💾 issue_date:', extractedData['issue_date']);
          console.log('💾 Có giá trị đến:', extractedData['Có giá trị đến']);
          console.log('💾 expire_date:', extractedData['expire_date']);
          
          const issueDate = convertDateFormat(extractedData['Ngày cấp'] || extractedData['issue_date']);
          const expireDate = convertDateFormat(extractedData['Có giá trị đến'] || extractedData['expire_date']);
          
          console.log('💾 Converted issue_date:', issueDate);
          console.log('💾 Converted expire_date:', expireDate);
          
          const cccdData = {
            citizen_id: savedCitizen.id,
            so_cccd: extractedData['Số CCCD'] || extractedData['id'] || '',
            origin_place: originPlace || 'N/A',
            current_place: currentPlace || 'N/A',
            issue_date: issueDate,
            expire_date: expireDate
          };
          
          console.log('💾 CCCD data to save:', JSON.stringify(cccdData, null, 2));
          
          const savedCCCD = await documentsAPI.createCCCD(cccdData);
          console.log('✅ Saved CCCD document:', JSON.stringify(savedCCCD, null, 2));
        } catch (cccdError) {
          console.error('⚠️ Warning: Could not create CCCD document:', cccdError);
          console.error('⚠️ CCCD Error details:', cccdError.message);
          console.error('⚠️ CCCD Error stack:', cccdError.stack);
          Alert.alert('Cảnh báo', 'Đã lưu thông tin cá nhân nhưng không thể lưu thông tin CCCD: ' + cccdError.message);
          // Không fail toàn bộ flow nếu CCCD ko tạo được
        }
      }
      
      // Nếu là GPLX, tạo thêm Documents + GPLX record
      if (docType === 'GPLX' && savedCitizen && savedCitizen.id) {
        try {
          console.log('💾 Preparing GPLX document data...');
          
          const issueDate = convertDateFormat(extractedData['Ngày cấp'] || extractedData['issue_date']);
          const expireDate = convertDateFormat(extractedData['Ngày thẻ hết hạn'] || extractedData['expire_date'] || extractedData['expiry_date']);
          
          const gplxData = {
            citizen_id: savedCitizen.id,
            so_gplx: extractedData['Mã thẻ'] || extractedData['id'] || '',
            hang_gplx: extractedData['Hạng thẻ'] || extractedData['level'] || extractedData['class'] || '',
            noi_cap: extractedData['Nơi cấp'] || extractedData['place_of_issue'] || extractedData['iplace'] || '',
            issue_date: issueDate,
            expire_date: expireDate
          };
          
          console.log('💾 GPLX data to save:', JSON.stringify(gplxData, null, 2));
          
          const savedGPLX = await documentsAPI.createGPLX(gplxData);
          console.log('✅ Saved GPLX document:', JSON.stringify(savedGPLX, null, 2));
        } catch (gplxError) {
          console.error('⚠️ Warning: Could not create GPLX document:', gplxError);
          console.error('⚠️ GPLX Error details:', gplxError.message);
          Alert.alert('Cảnh báo', 'Đã lưu thông tin cá nhân nhưng không thể lưu thông tin GPLX: ' + gplxError.message);
        }
      }
      
      // Nếu là BHYT, tạo thêm Documents + BHYT record
      if (docType === 'BHYT' && savedCitizen && savedCitizen.id) {
        try {
          console.log('💾 Preparing BHYT document data...');
          
          const issueDate = convertDateFormat(extractedData['Ngày cấp'] || extractedData['issue_date']);
          const expireDate = convertDateFormat(extractedData['Giá trị đến'] || extractedData['expire_date']);
          
          const bhytData = {
            citizen_id: savedCitizen.id,
            so_bhyt: extractedData['Số thẻ BHYT'] || extractedData['Số BHYT'] || extractedData['id'] || '',
            hospital_code: extractedData['Mã nơi KCB'] || extractedData['hospital_code'] || 'N/A',
            insurance_area: extractedData['Khu vực'] || extractedData['insurance_area'] || 'N/A',
            issue_date: issueDate,
            expire_date: expireDate
          };
          
          console.log('💾 BHYT data to save:', JSON.stringify(bhytData, null, 2));
          
          const savedBHYT = await documentsAPI.createBHYT(bhytData);
          console.log('✅ Saved BHYT document:', JSON.stringify(savedBHYT, null, 2));
        } catch (bhytError) {
          console.error('⚠️ Warning: Could not create BHYT document:', bhytError);
          console.error('⚠️ BHYT Error details:', bhytError.message);
          Alert.alert('Cảnh báo', 'Đã lưu thông tin cá nhân nhưng không thể lưu thông tin BHYT: ' + bhytError.message);
        }
      }
      
      Alert.alert('Thành công', `Đã lưu thông tin ${docType}!`, [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back với flag refresh để HomeScreen reload data
            navigation.navigate('Home', { refresh: Date.now() });
          }
        }
      ]);
    } catch (error) {
      console.error('❌ Save error:', error);
      Alert.alert('Lỗi', 'Không thể lưu thông tin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    // Reset states
    setFrontImage(null);
    setBackImage(null);
    setFrontData({});
    setBackData({});
    setExtractedData({});
    setScanResult(null);
    setCurrentSide('front');
    
    Alert.alert(
      'Quét lại CCCD',
      'Bạn sẽ quét lại cả 2 mặt của CCCD',
      [
        { text: 'Chọn ảnh', onPress: () => handlePickImage('front') },
        { text: 'Chụp ảnh', onPress: () => handleTakePhoto('front') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const updateField = (key, value) => {
    console.log(`📝 Updating field: ${key} = ${value}`);
    setExtractedData(prev => {
      const updated = {
        ...prev,
        [key]: value
      };
      console.log('📝 Updated extractedData:', updated);
      return updated;
    });
  };

  console.log('🖼️ Render - scanResult:', scanResult);
  console.log('🖼️ Render - loading:', loading);
  console.log('🖼️ Render - extractedData:', extractedData);
  console.log('🖼️ Render - showCamera:', showCamera);
  console.log('🖼️ Render - cameraPermission:', cameraPermission);

  // Camera Modal - Render at top level so it's always available
  const renderCameraModal = () => {
    console.log('🎥 renderCameraModal called - showCamera:', showCamera);
    return (
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
        transparent={false}
      >
        <View style={styles.cameraContainer}>
          {cameraPermission?.granted ? (
          <CameraView
            style={styles.camera}
            ref={cameraRef}
            facing="back"
          >
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraHeader}>
                <Text style={styles.cameraTitle}>
                  {docType === 'CCCD' ? `Quét mặt ${cameraSide === 'front' ? 'TRƯỚC' : 'SAU'}` : `Quét ${docType}`}
                </Text>
                <TouchableOpacity
                  style={styles.cameraCloseButton}
                  onPress={() => {
                    console.log('📸 Closing camera modal');
                    setShowCamera(false);
                  }}
                >
                  <Text style={styles.cameraCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.cameraGuide}>
                <View style={styles.guideFrame} />
                <Text style={styles.guideText}>
                  Đặt giấy tờ vào khung hình
                </Text>
              </View>
              
              <View style={styles.cameraControls}>
                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePicture}
                >
                  <View style={styles.captureButtonInner} />
                </TouchableOpacity>
              </View>
            </View>
          </CameraView>
        ) : (
          <View style={styles.permissionDenied}>
            <Text style={styles.permissionText}>Chưa có quyền camera</Text>
            <CustomButton 
              title="Đóng"
              onPress={() => setShowCamera(false)}
            />
          </View>
        )}
      </View>
    </Modal>
    );
  };

  if (!scanResult && !loading) {
    console.log('🖼️ Showing empty screen');
    return (
      <>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📷</Text>
            <Text style={styles.emptyTitle}>
              {docType === 'CCCD' ? 'Quét CCCD 2 mặt' : 'Chưa có ảnh'}
            </Text>
            <Text style={styles.emptyText}>
              {docType === 'CCCD' 
                ? 'Vui lòng quét mặt trước và mặt sau của CCCD' 
                : 'Chọn ảnh hoặc chụp ảnh giấy tờ để bắt đầu'}
            </Text>
            {docType === 'CCCD' && (
              <Text style={styles.emptyHint}>
                Bước 1: Quét mặt trước{'\n'}
                Bước 2: Quét mặt sau (tự động)
              </Text>
            )}
            <View style={styles.actionButtons}>
              <CustomButton 
                title="Chọn từ thư viện" 
                onPress={() => handlePickImage('front')} 
              />
              <CustomButton 
                title="Chụp ảnh" 
                variant="secondary" 
                onPress={() => handleTakePhoto('front')} 
              />
              <CustomButton 
                title="Quay lại" 
                variant="secondary" 
                onPress={() => navigation.goBack()} 
              />
            </View>
          </View>
        </SafeAreaView>
        {renderCameraModal()}
      </>
    );
  }

  if (loading) {
    return (
      <>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Đang xử lý ảnh...</Text>
          </View>
        </SafeAreaView>
        {renderCameraModal()}
      </>
    );
  }

  return (
    <>
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
              Loại giấy tờ: {scanResult?.documentType || docType}
            </Text>
            {scanResult?.confidence && (
              <Text style={styles.scanConfidence}>
                Độ chính xác: {scanResult.confidence}%
              </Text>
            )}
            {docType === 'CCCD' && (
              <View style={styles.scanStatusRow}>
                <Text style={[styles.scanStatus, frontImage && styles.scanStatusDone]}>
                  {frontImage ? '✓' : '○'} Mặt trước {frontImage ? '(Đã quét)' : '(Chưa quét)'}
                </Text>
                <Text style={[styles.scanStatus, backImage && styles.scanStatusDone]}>
                  {backImage ? '✓' : '○'} Mặt sau {backImage ? '(Đã quét)' : '(Chưa quét)'}
                </Text>
              </View>
            )}
            {docType === 'CCCD' && scanResult?.isPartial && (
              <Text style={styles.warningText}>
                ⚠️ Vui lòng quét mặt sau để hoàn thành
              </Text>
            )}
          </View>

          <View style={styles.extractedDataCard}>
            <Text style={styles.sectionTitle}>Thông tin trích xuất</Text>
            <Text style={styles.editHint}>
              * Nhấn vào các trường để chỉnh sửa nếu cần
            </Text>
            {Object.entries(extractedData).map(([key, value], index) => (
              <InfoField 
                key={index} 
                label={key} 
                value={value || ''} 
                editable 
                onChangeText={(newValue) => updateField(key, newValue)}
              />
            ))}
          </View>

          <View style={styles.actionButtons}>
            <CustomButton 
              title={loading ? "Đang lưu..." : "Lưu thông tin"} 
              onPress={handleSave}
              disabled={loading}
            />
            <CustomButton 
              title="Quét lại" 
              variant="secondary" 
              onPress={handleRescan}
              disabled={loading}
            />
          </View>
        </View>
      </ScrollView>
      
      {/* Camera Modal */}
      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
        transparent={false}
      >
        <View style={styles.cameraContainer}>
          {cameraPermission?.granted ? (
            <CameraView
              style={styles.camera}
              ref={cameraRef}
              facing="back"
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.cameraHeader}>
                  <Text style={styles.cameraTitle}>
                    {docType === 'CCCD' ? `Quét mặt ${cameraSide === 'front' ? 'TRƯỚC' : 'SAU'}` : `Quét ${docType}`}
                  </Text>
                  <TouchableOpacity
                    style={styles.cameraCloseButton}
                    onPress={() => {
                      console.log('📸 Closing camera modal');
                      setShowCamera(false);
                    }}
                  >
                    <Text style={styles.cameraCloseText}>✕</Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.cameraGuide}>
                  <View style={styles.guideFrame} />
                  <Text style={styles.guideText}>
                    Đặt giấy tờ vào khung hình
                  </Text>
                </View>
                
                <View style={styles.cameraControls}>
                  <TouchableOpacity
                    style={styles.captureButton}
                    onPress={takePicture}
                  >
                    <View style={styles.captureButtonInner} />
                  </TouchableOpacity>
                </View>
              </View>
            </CameraView>
          ) : (
            <View style={styles.permissionDenied}>
              <Text style={styles.permissionText}>Chưa có quyền camera</Text>
              <CustomButton 
                title="Đóng"
                onPress={() => setShowCamera(false)}
              />
            </View>
          )}
        </View>
      </Modal>
    </SafeAreaView>
    </>
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
  scanStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    width: '100%'
  },
  scanStatus: {
    fontSize: 12,
    color: COLORS.gray[400],
    fontWeight: '500'
  },
  scanStatusDone: {
    color: COLORS.secondary,
    fontWeight: '700'
  },
  warningText: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fef3c7',
    borderRadius: 6
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
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 10
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray[500],
    textAlign: 'center',
    marginBottom: 10
  },
  emptyHint: {
    fontSize: 14,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
    lineHeight: 22
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
  cameraContainer: {
    flex: 1,
    backgroundColor: COLORS.black
  },
  camera: {
    flex: 1
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20
  },
  cameraTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  cameraCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraCloseText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: 'bold'
  },
  cameraGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  guideFrame: {
    width: '90%',
    height: 240,
    borderWidth: 3,
    borderColor: COLORS.white,
    borderRadius: 12,
    backgroundColor: 'transparent',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4
  },
  guideText: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  cameraControls: {
    paddingBottom: 50,
    alignItems: 'center'
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.white
  },
  permissionDenied: {
    flex: 1,
    backgroundColor: COLORS.black,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  permissionText: {
    fontSize: 18,
    color: COLORS.white,
    marginBottom: 20,
    textAlign: 'center'
  }
});
