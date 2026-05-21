import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Modal,
  Platform,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '@constants/Colors';
import { useTranslation } from 'react-i18next';
import { useGetBadgesQuery } from '@redux/api/Gamification';
import * as Animatable from 'react-native-animatable';
import styles from './styles';

const BadgesScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { data: badgesData, isLoading, error, refetch } = useGetBadgesQuery();
  const badges = badgesData?.Data || [];

  // Filtering tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'earned' | 'locked'

  // Selected badge modal
  const [selectedBadge, setSelectedBadge] = useState(null);

  // Compute statistics
  const earnedCount = badges.filter(b => b.isEarned).length;
  const totalCount = badges.length;

  const filteredBadges = badges.filter(badge => {
    if (activeTab === 'earned') return badge.isEarned;
    if (activeTab === 'locked') return !badge.isEarned;
    return true;
  });

  const getBadgeRequirementText = (badge) => {
    if (badge.conditionType === 'level') {
      return `Đạt Level ${badge.conditionValue}`;
    }
    if (badge.conditionType === 'reviewsWritten') {
      return `Viết ${badge.conditionValue} đánh giá`;
    }
    if (badge.conditionType === 'recipesCompleted') {
      return `Nấu ${badge.conditionValue} món ăn`;
    }
    if (badge.requiredXp > 0) {
      return `Đạt ${badge.requiredXp} XP`;
    }
    return 'Gia nhập ứng dụng';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch (e) {
      return '';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorText}>Đã xảy ra lỗi khi tải danh sách huy hiệu</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('badges_title', 'Huy hiệu & Thành tích')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statsTextContainer}>
            <Text style={styles.statsTitle}>{t('unlocked_badges', 'Đã mở khóa')}</Text>
            <Text style={styles.statsSub}>{t('keep_cooking_badge', 'Tiếp tục nấu ăn và chia sẻ đánh giá để mở khóa thêm huy hiệu!')}</Text>
          </View>
          <View style={styles.statsCircle}>
            <Text style={styles.statsProgressText}>{earnedCount}/{totalCount}</Text>
            <Text style={styles.statsProgressLabel}>{t('badges', 'huy hiệu')}</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'earned' && styles.activeTab]}
            onPress={() => setActiveTab('earned')}
          >
            <Text style={[styles.tabText, activeTab === 'earned' && styles.activeTabText]}>Đã đạt</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'locked' && styles.activeTab]}
            onPress={() => setActiveTab('locked')}
          >
            <Text style={[styles.tabText, activeTab === 'locked' && styles.activeTabText]}>Chưa đạt</Text>
          </TouchableOpacity>
        </View>

        {/* Grid List */}
        <View style={styles.gridContainer}>
          {filteredBadges.length === 0 ? (
            <Text style={styles.emptyText}>{t('no_badges_found', 'Không tìm thấy huy hiệu nào')}</Text>
          ) : (
            filteredBadges.map((badge) => (
              <TouchableOpacity 
                key={badge.id}
                style={[
                  styles.badgeCard,
                  badge.isEarned ? styles.earnedBadgeCard : styles.lockedBadgeCard
                ]}
                onPress={() => setSelectedBadge(badge)}
              >
                <View style={[
                  styles.badgeIconContainer,
                  badge.isEarned ? styles.earnedIconBg : styles.lockedIconBg
                ]}>
                  {badge.isEarned ? (
                    <Text style={styles.badgeIcon}>{badge.iconUrl}</Text>
                  ) : (
                    <View style={styles.lockedIconOverlay}>
                      <Text style={[styles.badgeIcon, { opacity: 0.25 }]}>{badge.iconUrl}</Text>
                      <Ionicons name="lock-closed" size={14} color="#777" style={styles.lockMiniIcon} />
                    </View>
                  )}
                </View>
                <Text style={styles.badgeName} numberOfLines={2}>{badge.name}</Text>
                <Text style={styles.badgeRequirement} numberOfLines={1}>
                  {badge.isEarned ? 'Đã sở hữu ✅' : getBadgeRequirementText(badge)}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Badge Detail Dialog Modal */}
      <Modal visible={selectedBadge !== null} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={400} style={styles.modalContent}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedBadge(null)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>

            {selectedBadge && (
              <View style={styles.detailContainer}>
                <View style={[
                  styles.detailIconBg,
                  selectedBadge.isEarned ? styles.earnedDetailIconBg : styles.lockedDetailIconBg
                ]}>
                  {selectedBadge.isEarned ? (
                    <Text style={styles.detailEmoji}>{selectedBadge.iconUrl}</Text>
                  ) : (
                    <View style={styles.detailLockedWrapper}>
                      <Text style={[styles.detailEmoji, { opacity: 0.25 }]}>{selectedBadge.iconUrl}</Text>
                      <Ionicons name="lock-closed" size={32} color={Colors.textLight} style={styles.detailLockIcon} />
                    </View>
                  )}
                </View>

                <Text style={styles.detailName}>{selectedBadge.name}</Text>
                
                <View style={[
                  styles.statusTag,
                  selectedBadge.isEarned ? styles.earnedStatusTag : styles.lockedStatusTag
                ]}>
                  <Text style={[
                    styles.statusTagText,
                    selectedBadge.isEarned ? styles.earnedStatusTagText : styles.lockedStatusTagText
                  ]}>
                    {selectedBadge.isEarned ? 'Đã đạt được' : 'Chưa mở khóa'}
                  </Text>
                </View>

                <Text style={styles.detailDescription}>{selectedBadge.description}</Text>

                <View style={styles.requirementBox}>
                  <Text style={styles.reqTitle}>Điều kiện mở khóa:</Text>
                  <Text style={styles.reqText}>{getBadgeRequirementText(selectedBadge)}</Text>
                </View>

                {selectedBadge.isEarned && (
                  <Text style={styles.earnedDate}>
                    Ngày đạt được: {formatDate(selectedBadge.earnedAt)}
                  </Text>
                )}

                <TouchableOpacity 
                  style={[styles.actionButton, selectedBadge.isEarned ? styles.earnedActionButton : styles.lockedActionButton]}
                  onPress={() => setSelectedBadge(null)}
                >
                  <Text style={styles.actionButtonText}>Đóng</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default BadgesScreen;
