import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  Pressable,
} from "react-native";
import { useAuth } from "../hooks/useAuth";
import { commentType } from "../types";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

type Props = {
  obj: commentType;
  handleClickReply: (obj: commentType) => void;
  replying: boolean;
  selectedComment: commentType | null;
};

const Comment: React.FC<Props> = ({
  obj,
  handleClickReply,
  replying,
  selectedComment,
}) => {
  const { currentUser } = useAuth();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  // Animate comment appearing
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getTimeDifference = (timestamp: Date | null | undefined): string => {
    if (!timestamp) return "";

    const currentDateTime = new Date();
    const timeDifference = Math.abs(
      currentDateTime.getTime() - timestamp.getTime()
    );

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const isReplyingToThis =
    replying && selectedComment?.commentId === obj.commentId;
  const isUserComment = currentUser?.uid === obj.uid;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.98,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  // Get a color based on user's name to make avatar background color consistent
  const getAvatarColor = (name?: string) => {
    if (!name) return "#3B82F6";

    const colors = [
      "#3B82F6", // blue
      "#10B981", // emerald
      "#8B5CF6", // violet
      "#F59E0B", // amber
      "#EC4899", // pink
      "#6366F1", // indigo
      "#EF4444", // red
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Animated.View
      className="flex-row gap-2 py-2 w-full"
      style={{
        opacity,
        transform: [{ translateY }, { scale }],
      }}
    >
      <View className="relative">
        {obj.photoURL ? (
          <Image
            source={{ uri: obj.photoURL }}
            className="w-10 h-10 rounded-full border border-gray-700"
          />
        ) : (
          <View
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: getAvatarColor(obj.person) }}
          >
            <Text className="text-white font-bold text-sm">
              {getInitials(obj.person)}
            </Text>
          </View>
        )}

        {/* Vertical line connecting to replies */}
        {obj.replyArray && obj.replyArray.length > 0 && (
          <View className="absolute top-10 bottom-0 left-5 w-0.5 bg-gray-700 h-full" />
        )}
      </View>

      <View className="flex-1">
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="w-full"
        >
          <View
            className={`px-3 py-2 rounded-2xl w-full ${
              isUserComment ? "bg-blue-900/30" : "bg-gray-800"
            } border border-gray-700`}
          >
            <View className="flex-row items-center justify-between mb-1">
              <View className="flex-row items-center">
                <Text className="text-white font-medium">{obj.person}</Text>
                {isUserComment && (
                  <View className="bg-blue-800 ml-2 px-1.5 py-0.5 rounded-full">
                    <Text className="text-blue-200 text-xs">You</Text>
                  </View>
                )}
              </View>
              <Text className="text-gray-400 text-xs">
                {getTimeDifference(obj.timestamp)}
              </Text>
            </View>
            <Text className="text-gray-200 text-sm">{obj.comment}</Text>
          </View>
        </Pressable>

        <View className="flex-row gap-5 mt-2 ml-2 items-center">
          <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            {obj.likes && obj.likes > 0 ? (
              <>
                <FontAwesome name="heart" size={14} color="#EF4444" />
                <Text className="text-gray-400 text-xs ml-1">{obj.likes}</Text>
              </>
            ) : (
              <>
                <FontAwesome name="heart-o" size={14} color="#9CA3AF" />
                <Text className="text-gray-400 text-xs ml-1">Like</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleClickReply(obj)}
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isReplyingToThis ? "chatbubble" : "chatbubble-outline"}
              size={14}
              color={isReplyingToThis ? "#3B82F6" : "#9CA3AF"}
            />
            <Text
              className={`text-xs ml-1 ${
                isReplyingToThis ? "text-blue-400" : "text-gray-400"
              }`}
            >
              {isReplyingToThis ? "Replying" : "Reply"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-row items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={14} color="#9CA3AF" />
            <Text className="text-gray-400 text-xs ml-1">Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};

export default Comment;
