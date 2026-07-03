import SectionHeader from '@components/GlobalUI/SectionHeader';
import RecipeCard from '@components/Recipe/RecipeCard';
import { Colors } from '@constants/Colors';
import { useNavigation } from '@react-navigation/native';
import {
  useAskAiAssistantMutation,
  useGetFavoritesQuery,
  useGetTrendingRecipesQuery,
  useToggleFavoriteMutation,
} from '@redux/api/Recipes';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from './styles';

const FEATURED_RECIPES = [
  {
    id: '1',
    title: 'Creamy Avocado Toast',
    author: 'Chef Mario',
    time: '15 min',
    rating: 4.8,
    category: 'Breakfast',
  },
  {
    id: '2',
    title: 'Spicy Thai Basil Beef',
    author: 'Suda S.',
    time: '25 min',
    rating: 4.9,
    category: 'Lunch',
  },
];

const HomeScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeRecIndex, setActiveRecIndex] = React.useState(0);
  const { data: trendingData, isLoading: isTrendingLoading } =
    useGetTrendingRecipesQuery();
  const { data: favoritesData } = useGetFavoritesQuery();
  const [askAi, { isLoading: isAiTyping }] = useAskAiAssistantMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const [aiChatVisible, setAiChatVisible] = React.useState(false);
  const [messages, setMessages] = React.useState([]);
  const [chatInput, setChatInput] = React.useState('');
  const chatScrollRef = React.useRef(null);

  // Initialize greeting message
  React.useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: `👋 Chào bạn! Mình là *Chef AI* - trợ lý nấu ăn ảo của bạn.\n\nHôm nay bạn muốn nấu món gì? Bạn cần mình gợi ý thực đơn, hay xử lý các sự cố trong bếp? Hãy chọn các gợi ý nhanh phía dưới hoặc hỏi tự do nhé! 👨‍🍳`,
          sender: 'ai'
        }
      ]);
    }
  }, [messages.length]);

  // Scroll to bottom when messages or typing status updates
  React.useEffect(() => {
    if (chatScrollRef.current) {
      setTimeout(() => {
        chatScrollRef.current.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isAiTyping]);


  const favoriteIds = React.useMemo(() => {
    return (favoritesData?.Data || []).map(f => f.id);
  }, [favoritesData]);

  const handleToggleFavorite = async id => {
    try {
      await toggleFavorite(id).unwrap();
    } catch (err) {
      console.log('Toggle favorite failed', err);
    }
  };

  const recipes = trendingData?.Data || FEATURED_RECIPES;

  const { carouselRecipes, gridRecipes } = React.useMemo(() => {
    if (!recipes || recipes.length === 0)
      return { carouselRecipes: [], gridRecipes: [] };

    // Shuffle or just pick different ranges to avoid duplication
    const shuffled = [...recipes].sort(() => 0.5 - Math.random());

    // If total recipe count is small (<= 5), allow them to overlap in both sections so the home screen isn't empty.
    const filteredForGrid = recipes.length > 5
      ? recipes.filter(r => !shuffled.slice(0, 3).some(c => c.id === r.id))
      : recipes;

    return {
      carouselRecipes: shuffled.slice(0, 5),
      gridRecipes: filteredForGrid.slice(0, 10),
    };
  }, [recipes]);

  const onRecommendationScroll = event => {
    const slideSize = event.nativeEvent.layoutMeasurement.width;
    const index = event.nativeEvent.contentOffset.x / slideSize;
    setActiveRecIndex(Math.round(index));
  };

  const handleSendAiMessage = async (customText) => {
    const textToSend = customText || chatInput;
    if (!textToSend.trim() || isAiTyping) return;

    const userMsg = {
      id: String(Date.now()),
      text: textToSend.trim(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setChatInput('');

    try {
      const promptData = {
        message: textToSend.trim(),
        // recipeContext: recipe ? {
        //   title: recipe.title,
        //   ingredients: ingredients.map(i => i.name).join(', ')
        // } : null
      };

      const result = await askAi(promptData).unwrap();

      const aiMsg = {
        id: String(Date.now() + 1),
        text: result.Data,
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg = {
        id: String(Date.now() + 1),
        text: "💥 *Lỗi:* Không thể kết nối với Chef AI. Bạn vui lòng kiểm tra kết nối mạng hoặc thử lại sau nhé!",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const renderFormattedText = (text, isUser) => {
    const parts = text.split(/(\*\*|__|\*|_)/g);
    let isBold = false;
    let isItalic = false;

    return (
      <Text style={[styles.aiMessageText, isUser ? styles.aiMessageTextUser : styles.aiMessageTextAi]}>
        {parts.map((part, index) => {
          if (part === '**' || part === '__') {
            isBold = !isBold;
            return null;
          }
          if (part === '*' || part === '_') {
            isItalic = !isItalic;
            return null;
          }
          return (
            <Text
              key={index}
              style={{
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
              }}
            >
              {part}
            </Text>
          );
        })}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{t('hi_there')}, 👋</Text>
          <Text style={styles.headerTitle}>{t('what_to_cook_today')}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setAiChatVisible(true)}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.notificationButton}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={Colors.text}
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity> */}
        </View>

      </View>

      <ScrollView
        // showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Bar */}
        {/* <View style={styles.searchContainer}>
          <SearchBar
            placeholder={t('search_recipes_placeholder')}
            rightAction={
              <Ionicons name="options-outline" size={20} color={Colors.white} />
            }
            onRightActionPress={() => {}}
          />
        </View> */}

        {/* Recommendation Carousel */}
        {carouselRecipes && carouselRecipes.length > 0 && (
          <View style={styles.recommendationWrapper}>
            <FlatList
              data={carouselRecipes}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={onRecommendationScroll}
              scrollEventThrottle={16}
              keyExtractor={item => `rec-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.recommendationCard}
                  onPress={() =>
                    navigation.navigate('RecipeDetail', { recipeId: item.id })
                  }
                >
                  <View style={styles.recommendationContent}>
                    <View style={styles.recommendationHeader}>
                      <Text style={styles.recommendationTag}>
                        {t('weekly_pick', 'Gợi ý cho bạn')}
                      </Text>
                      <Ionicons
                        name="bonfire-sharp"
                        size={24}
                        color={Colors.primary}
                      />
                    </View>
                    <Text style={styles.recommendationTitle} numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View style={styles.recommendationMeta}>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="time-outline"
                          size={16}
                          color={Colors.textLight}
                        />
                        <Text style={styles.recipeMetaText}>
                          {item.time || '30 min'}
                        </Text>
                      </View>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="star"
                          size={16}
                          color="#FFD700"
                          style={{ marginRight: 2 }}
                        />
                        <Text style={styles.recipeMetaText}>
                          {item.rating || '4.5'}
                        </Text>
                      </View>
                      <View style={styles.recipeMetaItem}>
                        <Ionicons
                          name="people-outline"
                          size={16}
                          color={Colors.textLight}
                        />
                        <Text style={styles.recipeMetaText}>
                          {item.servings || '2 người'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            {/* Pagination Dots */}
            <View style={styles.paginationDots}>
              {carouselRecipes.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    activeRecIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
        {/* Featured Section */}
        <SectionHeader
          title={t('featured_recipes')}
          onActionPress={() => navigation.navigate('AllRecipes')}
        />
        {isTrendingLoading ? (
          <View style={{ marginVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator color={Colors.primary} size="large" />
            <Text style={{ marginTop: 10, color: Colors.textLight }}>
              {t('loading_recipes', 'Đang tìm kiếm món ngon...')}
            </Text>
          </View>
        ) : recipes.length === 0 ? (
          <View
            style={{
              marginVertical: 60,
              alignItems: 'center',
              paddingHorizontal: 40,
            }}
          >
            <Ionicons
              name="restaurant-outline"
              size={60}
              color={Colors.primary}
              style={{ opacity: 0.5 }}
            />
            <Text
              style={{
                marginTop: 20,
                fontSize: 18,
                fontWeight: '600',
                color: Colors.text,
                textAlign: 'center',
              }}
            >
              {t('preparing_recipes_title', 'Đang chuẩn bị thực đơn...')}
            </Text>
            <Text
              style={{
                marginTop: 10,
                fontSize: 14,
                color: Colors.textLight,
                textAlign: 'center',
              }}
            >
              {t(
                'preparing_recipes_desc',
                'Chờ một chút nhé, chúng mình đang cập nhật những công thức nấu ăn mới nhất cho bạn.',
              )}
            </Text>
            <ActivityIndicator
              color={Colors.primary}
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <View style={styles.featuredGrid}>
            {gridRecipes.map(item => (
              <View key={String(item.id)} style={styles.recipeCardWrapper}>
                <RecipeCard
                  item={item}
                  isFavorited={favoriteIds.includes(item.id)}
                  onFavoritePress={handleToggleFavorite}
                  onPress={() =>
                    navigation.navigate('RecipeDetail', { recipeId: item.id })
                  }
                />
              </View>
            ))}
          </View>
        )}

        {/* Bottom padding for floating tab bar */}
        <View style={{ height: 100 }} />
        {/* Chef AI Culinary Assistant Modal */}
        <Modal
          visible={aiChatVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setAiChatVisible(false)}
        >
          <View style={styles.aiModalContainer}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.aiModalContent}
            >
              {/* Modal Header */}
              <View style={styles.aiModalHeader}>
                <View style={styles.aiModalTitleRow}>
                  <Ionicons name="sparkles" size={20} color={Colors.primary} />
                  <Text style={styles.aiModalTitle}>Chef AI Assistant</Text>
                  <Text style={styles.aiModalSubtitle}>Trợ lý bếp</Text>
                </View>
                <TouchableOpacity onPress={() => setAiChatVisible(false)}>
                  <Ionicons name="close" size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>

              {/* Chat Messages */}
              <ScrollView
                ref={chatScrollRef}
                style={styles.aiMessageList}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {messages.map(msg => (
                  <View
                    key={msg.id}
                    style={[
                      styles.aiBubble,
                      msg.sender === 'user' ? styles.aiBubbleUser : styles.aiBubbleAi
                    ]}
                  >
                    {renderFormattedText(msg.text, msg.sender === 'user')}
                  </View>
                ))}

                {isAiTyping && (
                  <View style={styles.aiTypingBubble}>
                    <ActivityIndicator size="small" color={Colors.textLight} />
                    <Text style={styles.aiTypingText}>Chef AI đang suy nghĩ...</Text>
                  </View>
                )}
              </ScrollView>

              {/* Quick Emergency Pills */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#F1F3F5' }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 15, paddingVertical: 10 }}
                >
                  <TouchableOpacity
                    style={styles.aiQuickPill}
                    onPress={() => handleSendAiMessage("Món này bị mặn chữa thế nào?")}
                  >
                    <Text style={{ fontSize: 13 }}>🧂</Text>
                    <Text style={styles.aiQuickPillText}>Cứu món mặn</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.aiQuickPill}
                    onPress={() => handleSendAiMessage("Món bị quá cay thì chữa sao?")}
                  >
                    <Text style={{ fontSize: 13 }}>🌶️</Text>
                    <Text style={styles.aiQuickPillText}>Giảm vị cay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.aiQuickPill}
                    onPress={() => handleSendAiMessage("Đồ ăn bị cháy khét xử lý thế nào?")}
                  >
                    <Text style={{ fontSize: 13 }}>🔥</Text>
                    <Text style={styles.aiQuickPillText}>Xử lý cháy khét</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.aiQuickPill}
                    onPress={() => handleSendAiMessage("Có nguyên liệu nào thay thế bột năng không?")}
                  >
                    <Text style={{ fontSize: 13 }}>🌽</Text>
                    <Text style={styles.aiQuickPillText}>Thay bột năng</Text>
                  </TouchableOpacity>
                </ScrollView>
              </View>

              {/* Message Input */}
              <View style={styles.aiInputContainer}>
                <TextInput
                  style={styles.aiInput}
                  placeholder="Hỏi Chef AI nêm nếm, thay thế..."
                  value={chatInput}
                  onChangeText={setChatInput}
                  multiline
                />
                <TouchableOpacity
                  style={[styles.aiSendButton, !chatInput.trim() && styles.aiSendButtonDisabled]}
                  onPress={() => handleSendAiMessage()}
                  disabled={!chatInput.trim() || isAiTyping}
                >
                  <Ionicons name="send" size={18} color={Colors.white} />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </ScrollView>

    </View>
  );
};

export default HomeScreen;
