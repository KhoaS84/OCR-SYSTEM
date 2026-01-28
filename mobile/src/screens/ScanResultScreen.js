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
import { ocrAPI, citizensAPI, authAPI, documentsAPI } from '../services/api';

export default function ScanResultScreen({ navigation, route }) {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedData, setExtractedData] = useState({});
  const docType = route.params?.docType || 'CCCD';

  // For CCCD dual-sided scanning
  const [currentSide, setCurrentSide] = useState('front'); // 'front' or 'back'
  const [frontData, setFrontData] = useState({});
  const [backData, setBackData] = useState({});
  // Dùng ref để lưu frontUri, tránh bất đồng bộ state
  const frontUriRef = useRef(null);

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

      if (docType === 'CCCD') {
        if (side === 'front') {
          frontUriRef.current = imageUri;
          console.log('✅ Front side saved, waiting for back side');
          setLoading(false);
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
          return;
        } else if (side === 'back') {
          // Chỉ upload khi chắc chắn đã có cả 2 ảnh
          if (!frontUriRef.current) {
            setLoading(false);
            Alert.alert('Thiếu ảnh mặt trước', 'Vui lòng quét lại mặt trước CCCD!');
            return;
          }
          // Tiến hành upload
          console.log('📤 Uploading images...');
          let documentId;
          const uploadResult = await documentsAPI.uploadCCCD(frontUriRef.current, imageUri);
          console.log('✅ CCCD uploaded:', uploadResult);
          documentId = uploadResult.id;
          // Reset ref sau khi upload xong
          frontUriRef.current = null;
          
          // Gọi OCR process
          console.log('🔄 Processing OCR for document:', documentId);
          const processResult = await ocrAPI.processDocument(documentId);
          console.log('✅ OCR job created:', processResult);
          const jobId = processResult.id;
          
          // Poll status cho đến khi completed
          console.log('⏳ Polling OCR status for job:', jobId);
          let status = 'PENDING';
          let attempts = 0;
          const maxAttempts = 30;
          
          while (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            const statusResult = await ocrAPI.getJobStatus(jobId);
            status = statusResult.status;
            console.log(`📊 OCR Status (${attempts}/${maxAttempts}):`, status);
            
            if (status === 'failed' || status === 'FAILED') {
              throw new Error('OCR processing failed');
            }
            if (status === 'done' || status === 'DONE') {
              console.log('✅ OCR processing completed!');
              break;
            }
          }
          
          if (status !== 'done' && status !== 'DONE') {
            throw new Error('OCR processing timeout');
          }
          
          // Lấy kết quả OCR
          console.log('📥 Getting OCR results...');
          const result = await ocrAPI.getResults(documentId);
          console.log('✅ OCR result received:', JSON.stringify(result, null, 2));
          
          // Parse OCR results
          const extractedData = {};
          if (Array.isArray(result)) {
            result.forEach(item => {
              const fieldName = item.field_name || 'unknown';
              const fieldValue = item.raw_text || '';
              
              const cccdFieldMapping = {
                'name': 'Họ và tên',
                'id': 'Số CCCD',
                'id_number': 'Số CCCD',
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
              
              const displayName = cccdFieldMapping[fieldName] || fieldName;
              extractedData[displayName] = fieldValue;
            });
          }
          
          console.log('✅ Parsed extracted data:', extractedData);
          
          const scanResultData = {
            documentType: docType,
            documentId: documentId,
            confidence: result.length > 0 ? Math.round((result[0].confidence_score || 0) * 100) : 0,
            extractedData: extractedData,
            raw: result,
          };
          
          setScanResult(scanResultData);
          setExtractedData(extractedData);
          setLoading(false);
          return;
        }
      }

      // Nếu là BHYT hoặc loại giấy tờ khác
      if (docType === 'BHYT') {
        console.log('📤 Uploading images...');
          let documentId; // Declare documentId here to avoid ReferenceError
        const uploadResult = await documentsAPI.uploadBHYT(imageUri);
        console.log('✅ BHYT uploaded:', uploadResult);
        documentId = uploadResult.id;
        // ...phần xử lý OCR giữ nguyên...
        // Gọi OCR process
        console.log('🔄 Processing OCR for document:', documentId);
        const processResult = await ocrAPI.processDocument(documentId);
        console.log('✅ OCR job created:', processResult);
        const jobId = processResult.id; // Backend trả về job object với field "id"
        // Poll status cho đến khi completed
        console.log('⏳ Polling OCR status for job:', jobId);
        let status = 'PENDING';
        let attempts = 0;
        const maxAttempts = 30; // 30 giây
        while (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây
          attempts++;
          const statusResult = await ocrAPI.getJobStatus(jobId);
          status = statusResult.status;
          console.log(`📊 OCR Status (${attempts}/${maxAttempts}):`, status);
          if (status === 'failed' || status === 'FAILED') {
            throw new Error('OCR processing failed');
          }
          if (status === 'done' || status === 'DONE') {
            console.log('✅ OCR processing completed!');
            break;
          }
        }
        if (status !== 'done' && status !== 'DONE') {
          throw new Error('OCR processing timeout');
        }
        // Lấy kết quả OCR
        console.log('📥 Getting OCR results...');
        const result = await ocrAPI.getResults(documentId);
        console.log('✅ OCR result received:', JSON.stringify(result, null, 2));
        // Parse OCR results - backend trả về array [{field_name, raw_text, confidence_score}]
        const extractedData = {};
        if (Array.isArray(result)) {
          result.forEach(item => {
            const fieldName = item.field_name || 'unknown';
            const fieldValue = item.raw_text || '';
            // Map field names cho BHYT
            const bhytFieldMapping = {
              'bhyt': 'Loại giấy tờ',
              'id': 'Số BHYT',
              'name': 'Họ và tên',
              'dob': 'Ngày sinh',
              'gender': 'Giới tính',
              'ihos': 'Bệnh viện',
              'hospital': 'Bệnh viện',
              'iplace': 'Nơi đăng ký KCB',
              'insurance_place': 'Nơi đăng ký KCB',
              'issue_date': 'Ngày cấp',
              'expire_date': 'Có giá trị đến',
            };
            const displayName = bhytFieldMapping[fieldName] || fieldName;
            extractedData[displayName] = fieldValue;
          });
        }
        console.log('✅ Parsed extracted data:', extractedData);
        // Tạo scanResult với document ID
        const scanResultData = {
          documentType: docType,
          documentId: documentId, // Lưu document ID để dùng khi save
          confidence: result.length > 0 ? Math.round((result[0].confidence_score || 0) * 100) : 0,
          extractedData: extractedData,
          raw: result,
        };
        setScanResult(scanResultData);
        setExtractedData(extractedData);
        setLoading(false);
        return;
      }
      
      // Gọi OCR process
      console.log('🔄 Processing OCR for document:', documentId);
      const processResult = await ocrAPI.processDocument(documentId);
      console.log('✅ OCR job created:', processResult);
      const jobId = processResult.id; // Backend trả về job object với field "id"
      
      // Poll status cho đến khi completed
      console.log('⏳ Polling OCR status for job:', jobId);
      let status = 'PENDING';
      let attempts = 0;
      const maxAttempts = 30; // 30 giây
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Chờ 1 giây
        attempts++;
        
        const statusResult = await ocrAPI.getJobStatus(jobId);
        status = statusResult.status;
        console.log(`📊 OCR Status (${attempts}/${maxAttempts}):`, status);
        
        if (status === 'failed' || status === 'FAILED') {
          throw new Error('OCR processing failed');
        }
        
        if (status === 'done' || status === 'DONE') {
          console.log('✅ OCR processing completed!');
          break;
        }
      }
      
      if (status !== 'done' && status !== 'DONE') {
        throw new Error('OCR processing timeout');
      }
      
      // Lấy kết quả OCR
      console.log('📥 Getting OCR results...');
      const result = await ocrAPI.getResults(documentId);
      console.log('✅ OCR result received:', JSON.stringify(result, null, 2));
      
      // Parse OCR results - backend trả về array [{field_name, raw_text, confidence_score}]
      const extractedData = {};
      if (Array.isArray(result)) {
        result.forEach(item => {
          const fieldName = item.field_name || 'unknown';
          const fieldValue = item.raw_text || '';
          
          // Map field names sang tiếng Việt cho CCCD
          const cccdFieldMapping = {
            'name': 'Họ và tên',
            'id': 'Số CCCD',
            'id_number': 'Số CCCD',
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

          // Map field names cho BHYT
          const bhytFieldMapping = {
            'bhyt': 'Loại giấy tờ',
            'id': 'Số BHYT',
            'name': 'Họ và tên',
            'dob': 'Ngày sinh',
            'gender': 'Giới tính',
            'ihos': 'Bệnh viện',
            'hospital': 'Bệnh viện',
            'iplace': 'Nơi đăng ký KCB',
            'insurance_place': 'Nơi đăng ký KCB',
            'issue_date': 'Ngày cấp',
            'expire_date': 'Có giá trị đến',
          };
          
          // Chọn mapping dựa trên docType
          let fieldMapping = cccdFieldMapping;
          if (docType === 'BHYT') fieldMapping = bhytFieldMapping;
          
          const displayName = fieldMapping[fieldName] || fieldName;
          extractedData[displayName] = fieldValue;
        });
      }
      
      console.log('✅ Parsed extracted data:', extractedData);
      
      // Tạo scanResult với document ID
      const scanResultData = {
        documentType: docType,
        documentId: documentId, // Lưu document ID để dùng khi save
        confidence: result.length > 0 ? Math.round((result[0].confidence_score || 0) * 100) : 0,
        extractedData: extractedData,
        raw: result,
        isPartial: false,
        hasBothSides: docType === 'CCCD'
      };
      
      setScanResult(scanResultData);
      setExtractedData(extractedData);
      console.log('✅ Scan completed successfully');
      console.log('✅ Setting extractedData to state:', extractedData);
      
      // Show success message
      setTimeout(() => {
        Alert.alert(
          'Hoàn thành! ✓',
          `Đã quét ${docType} thành công. Vui lòng kiểm tra thông tin và nhấn "Lưu thông tin".`,
          [{ text: 'OK' }]
        );
      }, 500);
      
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
    console.log('💾 ScanResult:', scanResult);
    
    if (!extractedData || Object.keys(extractedData).length === 0) {
      console.log('❌ No data to save');
      Alert.alert('Lỗi', 'Không có dữ liệu để lưu');
      return;
    }
    
    if (!scanResult || !scanResult.documentId) {
      Alert.alert('Lỗi', 'Thiếu thông tin document. Vui lòng quét lại.');
      return;
    }

    try {
      setLoading(true);
      
      if (docType === 'CCCD') {
        // Save CCCD data to database
        console.log('💾 Saving CCCD data...');
        
        // Helper function to parse dates from Vietnamese format
        const parseVietnameseDate = (dateStr) => {
          if (!dateStr) return null;
          // Format: "DD/MM/YYYY" hoặc "DD-MM-YYYY"
          const parts = dateStr.split(/[\/\-]/);
          if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
          return null;
        };
        
        const cccdData = {
          document_id: scanResult.documentId,
          so_cccd: extractedData['Số CCCD'] || extractedData['id'] || extractedData['id_'] || '',
          origin_place: [
            extractedData['Quê quán (1)'] || '',
            extractedData['Quê quán (2)'] || ''
          ].filter(p => p).join(', ') || 'N/A',
          current_place: [
            extractedData['Nơi thường trú (1)'] || '',
            extractedData['Nơi thường trú (2)'] || ''
          ].filter(p => p).join(', ') || 'N/A',
          citizen_name: extractedData['Họ và tênn'] || extractedData['Họ và tên'] || 
                       scanResult.extractedData?.['Họ và tên'] || 
                       (scanResult.raw?.find(r => r.field_name === 'name')?.raw_text) || '',
          citizen_dob: extractedData['Ngày sinh'] || extractedData['dob'] || 
                      scanResult.extractedData?.['Ngày sinh'] ||
                      (scanResult.raw?.find(r => r.field_name === 'dob')?.raw_text) || '',
          citizen_gender: extractedData['Giới tính'] || extractedData['gender'] ||
                         scanResult.extractedData?.['Giới tính'] ||
                         (scanResult.raw?.find(r => r.field_name === 'gender')?.raw_text) || '',
          issue_date: extractedData['issue_date'] || extractedData['Ngày cấp'] ||
                     scanResult.extractedData?.['issue_date'] ||
                     (scanResult.raw?.find(r => r.field_name === 'issue_date')?.raw_text) || '',
          expire_date: extractedData['Có giá trị đến'] || extractedData['expire_date'] ||
                      scanResult.extractedData?.['Có giá trị đến'] ||
                      (scanResult.raw?.find(r => r.field_name === 'expire_date')?.raw_text) || '',
        };
        
        console.log('💾 CCCD data prepared:', JSON.stringify(cccdData, null, 2));        console.log('🔍 Debug - extractedData name fields:', {
          'Họ và tênn': extractedData['Họ và tênn'],
          'Họ và tên': extractedData['Họ và tên'],
          'scanResult.extractedData name': scanResult.extractedData?.['Họ và tên'],
          'raw name': scanResult.raw?.find(r => r.field_name === 'name')?.raw_text,
          'Giới tính': extractedData['Giới tính'],
          'raw gender': scanResult.raw?.find(r => r.field_name === 'gender')?.raw_text
        });        
        try {
          const result = await documentsAPI.saveCCCDData(cccdData);
          console.log('✅ CCCD data saved to database:', result);
        } catch (saveError) {
          console.error('❌ Error saving CCCD data:', saveError);
          console.error('❌ Error details:', JSON.stringify(saveError, null, 2));
          throw new Error(`Không thể lưu thông tin CCCD: ${saveError.message || 'Unknown error'}`);
        }
      }

      // Save BHYT data to database
      if (docType === 'BHYT') {
        console.log('💾 Saving BHYT data...');
        console.log('🔍 Current extractedData for BHYT:', extractedData);
        
        const bhytData = {
          document_id: scanResult.documentId,
          so_bhyt: extractedData['Số BHYT'] || extractedData['bhyt_number'] || 
                  extractedData['Số CCCD'] || extractedData['id'] ||
                  (scanResult.raw?.find(r => r.field_name === 'id')?.raw_text) || '',
          hospital_code: extractedData['Mã bệnh viện'] || extractedData['hospital_code'] || 
                        extractedData['ihos'] ||
                        (scanResult.raw?.find(r => r.field_name === 'ihos')?.raw_text) || '',
          insurance_area: extractedData['Khu vực'] || extractedData['insurance_area'] || 
                         extractedData['iplace'] ||
                         (scanResult.raw?.find(r => r.field_name === 'iplace')?.raw_text) || '',
          citizen_name: extractedData['Họ và tên'] || extractedData['name'] ||
                       scanResult.extractedData?.['Họ và tên'] ||
                       (scanResult.raw?.find(r => r.field_name === 'name')?.raw_text) || '',
          citizen_dob: extractedData['Ngày sinh'] || extractedData['dob'] ||
                      scanResult.extractedData?.['Ngày sinh'] ||
                      (scanResult.raw?.find(r => r.field_name === 'dob')?.raw_text) || '',
          citizen_gender: extractedData['Giới tính'] || extractedData['gender'] ||
                         scanResult.extractedData?.['Giới tính'] ||
                         (scanResult.raw?.find(r => r.field_name === 'gender')?.raw_text) || '',
          issue_date: extractedData['Ngày cấp'] || extractedData['issue_date'] ||
                     (scanResult.raw?.find(r => r.field_name === 'issue_date')?.raw_text) || '',
          expire_date: extractedData['Có giá trị đến'] || extractedData['expire_date'] ||
                      (scanResult.raw?.find(r => r.field_name === 'expire_date')?.raw_text) || '',
        };
        
        console.log('💾 BHYT data prepared:', JSON.stringify(bhytData, null, 2));
        console.log('🔍 Debug BHYT fields:', {
          'Số BHYT': extractedData['Số BHYT'],
          'bhyt_number': extractedData['bhyt_number'],
          'Mã bệnh viện': extractedData['Mã bệnh viện'],
          'hospital_code': extractedData['hospital_code'],
          'All keys': Object.keys(extractedData)
        });
        
        try {
          const result = await documentsAPI.saveBHYTData(bhytData);
          console.log('✅ BHYT data saved to database:', result);
        } catch (saveError) {
          console.error('❌ Error saving BHYT data:', saveError);
          console.error('❌ Error details:', JSON.stringify(saveError, null, 2));
          throw new Error(`Không thể lưu thông tin BHYT: ${saveError.message || 'Unknown error'}`);
        }
      }
      
      Alert.alert(
        'Hoàn thành! ✓',
        `Đã lưu thông tin ${docType} thành công. Bạn có thể xem chi tiết từ màn hình chính.`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              // Reset và quay về Home với refresh flag
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home', params: { refresh: Date.now() } }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Save error:', error);
      Alert.alert('Lỗi', 'Không thể hoàn tất: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRescan = () => {
    // Reset states
    frontUriRef.current = null;
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
                <Text style={[styles.scanStatus, frontUriRef.current && styles.scanStatusDone]}>
                  {frontUriRef.current ? '✓' : '○'} Mặt trước {frontUriRef.current ? '(Đã quét)' : '(Chưa quét)'}
                </Text>
                <Text style={[styles.scanStatus, scanResult && styles.scanStatusDone]}>
                  {scanResult ? '✓' : '○'} Mặt sau {scanResult ? '(Đã quét)' : '(Chưa quét)'}
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
