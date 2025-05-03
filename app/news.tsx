import CommentSection from "@/components/CommentSection";
import ReactionButton from "@/components/ReactionButton";
import { useData } from "@/hooks/useData";
import {
  FontAwesome,
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Share,
  Dimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Category Badge component - same as in HomeScreen for consistency
const CategoryBadge = ({ category, color = "#3B82F6" }) => (
  <View className="px-2 py-1 rounded-full" style={{ backgroundColor: color }}>
    <Text className="text-white text-xs font-medium">{category}</Text>
  </View>
);

// Function to determine color based on news category - same as in HomeScreen
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
    case "breaking":
      return "#EF4444"; // Red
    default:
      return "#3B82F6"; // Blue
  }
};

// Author Card component
const AuthorCard = ({ author }) => {
  return (
    <View className="flex-row items-center mt-4 mb-6 bg-gray-800 p-3 rounded-xl">
      <Image
        source={{ uri: author.avatarUrl || "https://via.placeholder.com/60" }}
        className="w-12 h-12 rounded-full mr-3"
      />
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text className="text-white font-bold">{author.name}</Text>
          {author.verified && (
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#3B82F6"
              style={{ marginLeft: 4 }}
            />
          )}
        </View>
        <Text className="text-gray-400 text-xs">{author.role}</Text>
        <Text className="text-gray-300 text-xs mt-1">{author.bio}</Text>
      </View>
      <TouchableOpacity
        className="bg-blue-600 px-3 py-1 rounded-full"
        activeOpacity={0.7}
      >
        <Text className="text-white text-xs">Follow</Text>
      </TouchableOpacity>
    </View>
  );
};

// Related News Card component
const RelatedNewsCard = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="mr-4 w-64 rounded-xl overflow-hidden bg-gray-800"
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.imageUrl || "/defaultNews.jpg" }}
        className="w-full h-32"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text className="text-white text-sm font-medium mb-2 line-clamp-2">
          {item.title}
        </Text>
        <View className="flex-row justify-between items-center">
          <Text className="text-gray-400 text-xs">
            {item.timeAgo || "5m ago"}
          </Text>
          <CategoryBadge
            category={item.category || "News"}
            color={getCategoryColor(item.category)}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const NewsPage = () => {
  const { selectedNews, newsList } = useData();
  const navigation = useNavigation();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Add sample data for demo purposes
  const enhancedNews = selectedNews
    ? {
        ...selectedNews,
        category: selectedNews.category || "Breaking",
        author: {
          name: "Jamie Williams",
          role: "Senior Editor",
          bio: "Covering global technology and politics since 2020",
          avatarUrl: "https://via.placeholder.com/60",
          verified: true,
        },
        publishedAt: "May 3, 2025",
        readTime: "4 min read",
        source: selectedNews.source || "Global News Network",
      }
    : null;

  // Create sample related news from the newsList
  const relatedNews = newsList?.slice(0, 5).map((news, index) => ({
    ...news,
    category: ["Technology", "Breaking", "Politics", "Business", "Sports"][
      index % 5
    ],
    timeAgo: [`${index % 60}m ago`, "1h ago", "2h ago", "Today"][
      Math.floor(Math.random() * 4)
    ],
  }));

  useEffect(() => {
    StatusBar.setBarStyle("light-content");
    return () => {
      StatusBar.setBarStyle("default");
    };
  }, []);

  if (!selectedNews?.newsId) {
    navigation.navigate("Home" as never);
    return null;
  }

  const handleBack = () => {
    navigation.goBack();
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${selectedNews.title}`,
        url: `https://news-app.example/article/${selectedNews.newsId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleBookmark = () => {
    setIsBookmarked((prev) => !prev);
    // Additional logic to save to storage or API
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 250],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  return (
    <View className="flex-1 bg-gray-900">
      {/* Floating Header that appears on scroll */}
      <Animated.View
        className="absolute top-0 left-0 right-0 z-10 bg-gray-900/80 backdrop-blur-lg flex-row justify-between items-center px-4 py-3"
        style={{
          opacity: headerOpacity,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 5,
          zIndex: 10,
        }}
      >
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white font-bold flex-1 ml-4 text-base line-clamp-1">
          {selectedNews.title}
        </Text>
        <View className="flex-row">
          <TouchableOpacity onPress={handleBookmark} className="ml-4">
            <Ionicons
              name={isBookmarked ? "bookmark" : "bookmark-outline"}
              size={24}
              color={isBookmarked ? "#3B82F6" : "#fff"}
            />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        className="flex-1"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image with Gradient Overlay */}
        <View className="relative">
          <Image
            source={{ uri: selectedNews.imageUrl || "/defaultNews.jpg" }}
            className="w-full h-72"
            resizeMode="cover"
          />

          <LinearGradient
            colors={["rgba(17, 24, 39, 0)", "rgba(17, 24, 39, 1)"]}
            className="absolute bottom-0 left-0 right-0 h-40"
          />

          {/* Back button */}
          <TouchableOpacity
            onPress={handleBack}
            className="absolute top-4 left-4 bg-black/40 rounded-full p-2"
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Action buttons */}
          <View className="absolute top-4 right-4 flex-row">
            <TouchableOpacity
              className="bg-black/40 rounded-full p-2 mr-2"
              onPress={handleBookmark}
            >
              <Ionicons
                name={isBookmarked ? "bookmark" : "bookmark-outline"}
                size={24}
                color={isBookmarked ? "#3B82F6" : "#fff"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-black/40 rounded-full p-2"
              onPress={handleShare}
            >
              <Ionicons name="share-social-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Category Badge */}
          <View className="absolute bottom-20 left-4">
            <CategoryBadge
              category={enhancedNews.category}
              color={getCategoryColor(enhancedNews.category)}
            />
          </View>
        </View>

        {/* Content Container */}
        <View className="px-4 pt-4 -mt-16">
          {/* Title and Meta Info */}
          <Text className="text-2xl font-bold text-white mb-3">
            {selectedNews.title}
          </Text>

          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <Text className="text-gray-400 text-xs">
                {enhancedNews.source}
              </Text>
              <View className="w-1 h-1 rounded-full bg-gray-500 mx-2" />
              <Text className="text-gray-400 text-xs">
                {enhancedNews.publishedAt}
              </Text>
              <View className="w-1 h-1 rounded-full bg-gray-500 mx-2" />
              <Text className="text-gray-400 text-xs">
                {enhancedNews.readTime}
              </Text>
            </View>
          </View>

          {/* Reaction Buttons with enhanced styling */}
          <View className="bg-gray-800 rounded-xl p-3 mb-6">
            <ReactionButton
              newsId={selectedNews.newsId}
              initialReactionCounts={{
                like: selectedNews.likeCount || 0,
                love: selectedNews.loveCount || 0,
                wow: selectedNews.wowCount || 0,
                sad: selectedNews.sadCount || 0,
                angry: selectedNews.angryCount || 0,
              }}
            />
          </View>

          {/* Author information */}
          <AuthorCard author={enhancedNews.author} />

          {/* Article content */}
          <View className="mb-8">
            <Text className="text-gray-200 text-base leading-6 mb-4">
              {selectedNews.news}
            </Text>

            {/* If we have paragraphs, we'd map them here */}
            {selectedNews.paragraphs?.map((paragraph, index) => (
              <Text
                key={index}
                className="text-gray-200 text-base leading-6 mb-4"
              >
                {paragraph}
              </Text>
            ))}
          </View>

          {/* Tags section */}
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-3">Tags</Text>
            <View className="flex-row flex-wrap">
              {["News", enhancedNews.category, "Global", "Trending"].map(
                (tag, index) => (
                  <TouchableOpacity
                    key={index}
                    className="bg-gray-800 px-3 py-1 rounded-full mr-2 mb-2"
                  >
                    <Text className="text-gray-300">#{tag}</Text>
                  </TouchableOpacity>
                )
              )}
            </View>
          </View>

          {/* Related Articles */}
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-3">
              Related News
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="pb-4 -mx-4 px-4"
            >
              {relatedNews?.map((item) => (
                <RelatedNewsCard
                  key={item.newsId}
                  item={item}
                  onPress={() => {
                    // Navigate to the same page but with different news
                    const selectedNews = newsList.find(
                      (news) => news.newsId === item.newsId
                    );
                    if (selectedNews) {
                      navigation.navigate("news"); // Trigger a re-render with the new selected news
                    }
                  }}
                />
              ))}
            </ScrollView>
          </View>

          {/* Comments Section */}
          <View className="mb-8">
            <Text className="text-white font-bold text-lg mb-3">Comments</Text>
            <View className="bg-gray-800 rounded-xl p-4">
              <CommentSection />
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default NewsPage;
