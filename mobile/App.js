import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Alert, LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

// Bắt tất cả các lỗi không được handle
const errorHandler = (error, isFatal) => {
  console.error('🚨 Global error handler caught error!');
  console.error('🚨 Error:', error);
  console.error('🚨 Error name:', error?.name);
  console.error('🚨 Error message:', error?.message);
  console.error('🚨 Is fatal:', isFatal);
  console.error('🚨 Error stack:', error?.stack);
  
  if (isFatal) {
    Alert.alert(
      'Lỗi nghiêm trọng',
      `Ứng dụng gặp lỗi:\n${error?.name || 'Unknown'}: ${error?.message || 'Unknown error'}\n\nVui lòng khởi động lại ứng dụng.`,
      [{ text: 'OK' }]
    );
  } else {
    // Log non-fatal errors
    console.warn('⚠️ Non-fatal error:', error?.message);
  }
};

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'Require cycle:',
]);

// Catch unhandled promise rejections
const handleUnhandledRejection = (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event);
  console.error('🚨 Reason:', event.reason);
};

export default function App() {
  useEffect(() => {
    // Set global error handler
    if (ErrorUtils) {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        errorHandler(error, isFatal);
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }

    // Handle unhandled promise rejections
    const rejectionHandler = (event) => handleUnhandledRejection(event);
    
    // Note: React Native doesn't support addEventListener for unhandledrejection
    // but we can log it
    console.log('✅ Error handlers initialized');

    return () => {
      if (ErrorUtils) {
        ErrorUtils.setGlobalHandler(originalHandler);
      }
    };
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});