import { deleteDoc, doc, setDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Modal, Platform, Text, TouchableOpacity, View } from "react-native";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../hooks/useAuth";

// Types
interface Reaction {
  key: string;
  emoji: string;
  label: string;
}

interface ReactionCounts {
  [key: string]: number;
}

interface UserReaction {
  reactionType: string | null;
  timestamp: Date;
}

interface ReactionButtonProps {
  newsId: string;
  initialReactionCounts: ReactionCounts;
}

// Available reactions
const REACTIONS: Reaction[] = [
  { key: "like", emoji: "👍", label: "Like" },
  { key: "love", emoji: "❤️", label: "Love" },
  { key: "wow", emoji: "😲", label: "Wow" },
  { key: "sad", emoji: "😢", label: "Sad" },
  { key: "angry", emoji: "😤", label: "Angry" },
];

const ReactionButton: React.FC<ReactionButtonProps> = ({
  newsId,
  initialReactionCounts,
}) => {
  const { currentUser } = useAuth();
  const [reactionCounts, setReactionCounts] = useState<ReactionCounts>(
    initialReactionCounts
  );
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get user's reaction path
  const getUserReactionPath = () => {
    if (!currentUser) return null;
    return `news/${newsId}/reactions/${currentUser.uid}`;
  };

  // Handle reaction selection
  const handleReactionSelect = async (reactionType: string) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const reactionPath = getUserReactionPath();
      if (!reactionPath) return;

      const reactionRef = doc(db, reactionPath);

      // Update local state optimistically
      setReactionCounts((prev) => {
        // Remove previous reaction
        if (userReaction) {
          prev[userReaction] = Math.max(0, (prev[userReaction] || 1) - 1);
        }
        // Add new reaction
        prev[reactionType] = (prev[reactionType] || 0) + 1;
        return { ...prev };
      });

      // Update user reaction state
      setUserReaction(reactionType);

      // Update Firestore
      await setDoc(reactionRef, {
        reactionType,
        timestamp: new Date(),
        userId: currentUser.uid,
        userName: currentUser.name,
        userPhoto: currentUser.photoURL,
      });
    } catch (error) {
      console.error("Error updating reaction:", error);
      // Revert on error
      setReactionCounts(initialReactionCounts);
      setUserReaction(null);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  // Remove reaction
  const removeReaction = async () => {
    if (!currentUser || !userReaction) return;

    setLoading(true);
    try {
      const reactionPath = getUserReactionPath();
      if (!reactionPath) return;

      const reactionRef = doc(db, reactionPath);

      // Update local state
      setReactionCounts((prev) => {
        prev[userReaction] = Math.max(0, (prev[userReaction] || 1) - 1);
        return { ...prev };
      });
      setUserReaction(null);

      // Remove from Firestore
      await deleteDoc(reactionRef);
    } catch (error) {
      console.error("Error removing reaction:", error);
      // Revert on error
      setReactionCounts(initialReactionCounts);
    } finally {
      setLoading(false);
      setModalVisible(false);
    }
  };

  // Get total reactions
  const getTotalReactions = () => {
    return Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
  };

  // Get current reaction display
  const getCurrentReaction = () => {
    if (userReaction) {
      const reaction = REACTIONS.find((r) => r.key === userReaction);
      return reaction ? reaction.emoji : "";
    }

    // Show most popular reaction
    const sorted = Object.entries(reactionCounts)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length > 0) {
      const [type] = sorted[0];
      const reaction = REACTIONS.find((r) => r.key === type);
      return reaction ? reaction.emoji : "";
    }

    return "";
  };

  return (
    <View className="flex-row items-center">
      {/* Reaction Button */}
      <TouchableOpacity
        className="flex-row items-center p-2 rounded-full bg-gray-100"
        onPress={() => setModalVisible(true)}
        disabled={loading}
      >
        {getCurrentReaction() && (
          <Text className="text-lg mr-1">{getCurrentReaction()}</Text>
        )}
        <Text className="text-sm text-gray-600 font-medium">
          {getTotalReactions()}
        </Text>
      </TouchableOpacity>

      {/* Reactions Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 justify-center items-center bg-black/30"
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View
            className={`w-4/5 p-3 rounded-2xl bg-white shadow-lg ${
              Platform.OS === "ios" ? "shadow-black/20" : ""
            }`}
          >
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-bold text-gray-800">React</Text>
              <TouchableOpacity
                onPress={removeReaction}
                disabled={loading || !userReaction}
                className={`px-3 py-1 rounded-full ${
                  userReaction ? "bg-red-100" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-sm ${
                    userReaction ? "text-red-600" : "text-gray-400"
                  }`}
                >
                  Remove
                </Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row justify-around">
              {REACTIONS.map((reaction) => (
                <TouchableOpacity
                  key={reaction.key}
                  className="items-center p-2"
                  onPress={() => handleReactionSelect(reaction.key)}
                  disabled={loading}
                >
                  <Text className="text-2xl mb-1">{reaction.emoji}</Text>
                  <Text className="text-xs text-gray-600">
                    {reaction.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default ReactionButton;
