import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getUserProfile } from '@/services/user-service';
import { getDocuments } from '@/services/document-service';
import { getCitizens } from '@/services/citizen-service';
import { UserProfile } from '@/types/user';

export default function HomeScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [citizensCount, setCitizensCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user profile
      const profileResponse = await getUserProfile();
      if (profileResponse.success && profileResponse.user) {
        setUserProfile(profileResponse.user);
      }

      // Load documents count
      const docsResponse = await getDocuments();
      if (docsResponse.success) {
        setDocumentsCount(docsResponse.documents.length);
      }

      // Load citizens count
      const citizensResponse = await getCitizens();
      if (citizensResponse.success) {
        setCitizensCount(citizensResponse.total);
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.push('/login');
  };

  const handleNavigateToUploadCCCD = () => {
    router.push('/upload-cccd');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C41E3A" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#C41E3A', dark: '#8B1428' }}
      headerImage={
        <View style={styles.headerImageContainer}>
          {userProfile?.avatar ? (
            <Image
              source={{ uri: userProfile.avatar }}
              style={styles.avatarLarge}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {userProfile?.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </View>
      }>
      {/* User Info Section */}
      <ThemedView style={styles.profileCard}>
        <ThemedText type="title" style={styles.welcomeText}>
          Xin chào, {userProfile?.fullName || userProfile?.username}!
        </ThemedText>
        <ThemedText style={styles.emailText}>{userProfile?.email}</ThemedText>
        
        <View style={styles.statusContainer}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusIcon}>
              {userProfile?.cccdVerified ? '✓' : '⚠'}
            </Text>
            <Text style={styles.statusText}>
              {userProfile?.cccdVerified ? 'Đã xác thực CCCD' : 'Chưa xác thực CCCD'}
            </Text>
          </View>
        </View>
      </ThemedView>

      {/* Stats Cards */}
      <ThemedView style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{documentsCount}</Text>
          <Text style={styles.statLabel}>Tài liệu</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{citizensCount}</Text>
          <Text style={styles.statLabel}>Công dân</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {userProfile?.isVerified ? '✓' : '✗'}
          </Text>
          <Text style={styles.statLabel}>Xác thực</Text>
        </View>
      </ThemedView>

      {/* CCCD Info */}
      {userProfile?.citizenData && (
        <ThemedView style={styles.cccdCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Thông tin CCCD
          </ThemedText>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số CCCD:</Text>
            <Text style={styles.infoValue}>{userProfile.citizenData.citizenId}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ tên:</Text>
            <Text style={styles.infoValue}>{userProfile.citizenData.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>{userProfile.citizenData.dateOfBirth}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>{userProfile.citizenData.sex}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày hết hạn:</Text>
            <Text style={styles.infoValue}>{userProfile.citizenData.expiryDate}</Text>
          </View>
        </ThemedView>
      )}

      {/* Quick Actions */}
      <ThemedView style={styles.actionsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Thao tác nhanh
        </ThemedText>
        
        {!userProfile?.cccdVerified && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleNavigateToUploadCCCD}
          >
            <Text style={styles.actionIcon}>📷</Text>
            <Text style={styles.actionText}>Upload CCCD</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.actionButtonSecondary}
          onPress={loadData}
        >
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionTextSecondary}>Làm mới dữ liệu</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Footer Info */}
      <ThemedView style={styles.footerContainer}>
        <ThemedText style={styles.footerText}>
          VNeID - Hệ thống định danh quốc gia
        </ThemedText>
        <ThemedText style={styles.footerSubtext}>
          Phiên bản 1.0.0 (Mock Mode)
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerImageContainer: {
    height: 178,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  profileCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emailText: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C41E3A',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(196, 30, 58, 0.05)',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#C41E3A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  cccdCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  actionsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C41E3A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(196, 30, 58, 0.1)',
    padding: 16,
    borderRadius: 12,
  },
  actionTextSecondary: {
    color: '#C41E3A',
    fontSize: 16,
    fontWeight: '600',
  },
  footerContainer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    opacity: 0.5,
  },
});
