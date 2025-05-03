import Headerbar from "@/components/Headerbar";
import ImageWithFallback from "@/components/ImageWithFallback";
import { useData } from "@/hooks/useData";
import { useNavigation } from "expo-router";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useState, useRef, useEffect } from "react";
import { BlurView } from "expo-blur";

// Custom Badge component for category tags
const CategoryBadge = ({ category, color = "#3B82F6" }) => (
  <View className={`px-2 py-1 rounded-full`} style={{ backgroundColor: color }}>
    <Text className="text-white text-xs font-medium">{category}</Text>
  </View>
);

// News card with hover effect
const NewsCard = ({ news, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View
        className="flex-row items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gray-800"
        style={{ transform: [{ scale: scaleAnim }] }}
      >
        <View className="relative">
          <ImageWithFallback
            src={news.imageUrl}
            fallbackSrc="/defaultNews.jpg"
            className="w-28 h-16 rounded-xl"
          />
          {news.isBreaking && (
            <View className="absolute top-0 left-0 bg-red-500 px-1 rounded-tl-xl rounded-br-xl">
              <Text className="text-white text-xs font-bold">BREAKING</Text>
            </View>
          )}
        </View>
        <View className="flex-1 space-y-1">
          <Text className="text-white text-sm font-medium line-clamp-2">
            {news.title}
          </Text>
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs">
              {news.source || "News Source"} • {news.timeAgo || "5m ago"}
            </Text>
            <CategoryBadge
              category={news.category || "News"}
              color={getCategoryColor(news.category)}
            />
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Function to determine color based on news category
const getCategoryColor = (category) => {
  switch (category?.toLowerCase()) {
    case "technology":
      return "#6366F1"; // Indigo
    case "sports":
      return "#10B981"; // Emerald
    case "politics":
      return "#F59E0B"; // Amber
    case "entertainment":
      return "#EC4899"; // Pink
    case "health":
      return "#14B8A6"; // Teal
    case "business":
      return "#8B5CF6"; // Violet
    case "science":
      return "#06B6D4"; // Cyan
    default:
      return "#3B82F6"; // Blue
  }
};

// Featured news carousel component
const FeaturedNews = ({ news, onPress }) => {
  return (
    <TouchableOpacity
      className="relative rounded-2xl overflow-hidden mb-5"
      onPress={onPress}
      activeOpacity={0.9}
    >
      <ImageWithFallback
        src={news.imageUrl}
        fallbackSrc="/defaultNews.jpg"
        className="w-full h-64 rounded-2xl"
      />

      {/* Semi-transparent gradient overlay */}
      <View className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />

      {/* Content overlay */}
      <View className="absolute bottom-0 left-0 right-0 p-4">
        {news.isBreaking && (
          <View className="flex-row items-center mb-2">
            <View className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            <Text className="text-red-500 font-bold">BREAKING NEWS</Text>
          </View>
        )}

        <Text className="text-white text-xl font-bold mb-2 shadow-lg">
          {news.title}
        </Text>

        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <MaterialCommunityIcons
              name="clock-time-four-outline"
              size={14}
              color="#CBD5E1"
            />
            <Text className="text-gray-300 text-xs ml-1">
              {news.timeAgo || "5m ago"}
            </Text>
          </View>

          <CategoryBadge
            category={news.category || "Featured"}
            color={getCategoryColor(news.category)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function HomeScreen() {
  const {
    newsList,
    lastNews,
    setSelectedNews,
    fetchData,
    firstLoading,
    loading,
    error,
    hasMore,
  } = useData();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("For You");
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  // Sample tabs for the category filter
  const tabs = ["For You", "Breaking", "Technology", "Business", "Sports"];

  // Animate loading spinner
  useEffect(() => {
    if (loading) {
      Animated.loop(
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      loadingAnimation.setValue(0);
    }
  }, [loading]);

  const handleNewsClick = (newsId) => {
    const selectedNews = newsList.find((news) => news.newsId === newsId);
    if (selectedNews) {
      setSelectedNews(selectedNews);
      navigation.navigate("news");
    }
  };

  const handleScroll = ({ nativeEvent }) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;

    if (isCloseToBottom && !loading && hasMore) {
      fetchData();
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchData({ reset: true });
    } finally {
      setRefreshing(false);
    }
  };

  const retryFetch = () => {
    if (error) {
      fetchData();
    }
  };

  // Add isBreaking, category, source and timeAgo to news items for demo
  const enhancedNewsList = newsList.map((news, index) => ({
    ...news,
    isBreaking: index % 7 === 0,
    category: tabs[Math.floor(Math.random() * tabs.length)],
    source: ["CNN", "BBC", "Reuters", "AP"][Math.floor(Math.random() * 4)],
    timeAgo: [`${index % 60}m ago`, "1h ago", "2h ago", "Today"][
      Math.floor(Math.random() * 4)
    ],
  }));

  const enhancedLastNews = lastNews
    ? {
        ...lastNews,
        isBreaking: true,
        category: "Breaking",
        source: "CNN",
        timeAgo: "10m ago",
      }
    : null;

  if (firstLoading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="text-gray-300 mt-4">Loading latest news...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-900">
      <Headerbar />

      {error && !refreshing && (
        <TouchableOpacity
          className="absolute top-16 left-0 right-0 z-10 mx-4 bg-red-900/80 p-4 rounded-xl shadow-lg backdrop-blur"
          onPress={retryFetch}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="warning" size={24} color="#FCA5A5" />
            <Text className="text-red-100 font-medium ml-2 flex-1">
              {error.message || "Connection error. Tap to retry."}
            </Text>
            <Ionicons name="refresh" size={20} color="#FCA5A5" />
          </View>
        </TouchableOpacity>
      )}

      {/* Category tabs */}
      {/* <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-4 py-2 border-b border-gray-800"
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            className={`px-4 py-2 mr-2 rounded-full ${
              activeTab === tab ? "bg-blue-600" : "bg-gray-800"
            }`}
          >
            <Text
              className={`${
                activeTab === tab ? "text-white" : "text-gray-400"
              } font-medium`}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> */}

      <ScrollView
        className="flex-1 px-4"
        onScroll={handleScroll}
        scrollEventThrottle={400}
        contentContainerStyle={{
          paddingBottom: 30,
          paddingTop: error ? 80 : 10,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#3B82F6"
            colors={["#3B82F6", "#8B5CF6"]}
            progressBackgroundColor="#1F2937"
          />
        }
      >
        {/* Featured News */}
        {enhancedLastNews && (
          <FeaturedNews
            news={enhancedLastNews}
            onPress={() => handleNewsClick(enhancedLastNews.newsId)}
          />
        )}

        {/* Section Title */}
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-white text-lg font-bold">Latest News</Text>
          <TouchableOpacity>
            <Text className="text-blue-400">See All</Text>
          </TouchableOpacity>
        </View>

        {/* News List */}
        <View className="space-y-1">
          {enhancedNewsList.length > 0 ? (
            enhancedNewsList.map((news) => (
              <NewsCard
                key={news.newsId}
                news={news}
                onPress={() => handleNewsClick(news.newsId)}
              />
            ))
          ) : (
            <View className="py-16 items-center">
              <FontAwesome5 name="newspaper" size={48} color="#4B5563" />
              <Text className="text-gray-400 mt-4 text-center">
                No news articles available at the moment
              </Text>
              <TouchableOpacity
                className="mt-4 bg-blue-600 px-4 py-2 rounded-full"
                onPress={() => fetchData({ reset: true })}
              >
                <Text className="text-white">Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {loading && !refreshing && (
          <Animated.View
            className="mt-6 flex-row justify-center items-center py-4"
            style={{
              opacity: loadingAnimation.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.6, 1, 0.6],
              }),
            }}
          >
            <ActivityIndicator color="#3B82F6" />
            <Text className="ml-2 text-blue-400">Loading more stories...</Text>
          </Animated.View>
        )}

        {!hasMore && enhancedNewsList.length > 0 && (
          <View className="mt-6 py-4 items-center">
            <MaterialCommunityIcons
              name="page-last"
              size={24}
              color="#4B5563"
            />
            <Text className="text-gray-400 mt-2">
              You've caught up on all the latest news
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
