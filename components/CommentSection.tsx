import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from "react-native";
import { commentListType, commentType } from "../types";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useData } from "../hooks/useData";
import { useAuth } from "../hooks/useAuth";
import Comment from "./Comment";
import Reply from "./Reply";
import { INITIAL_COMMENT_LIST } from "../constants";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";

const CommentSection = () => {
  const [commentList, setCommentList] =
    useState<commentListType>(INITIAL_COMMENT_LIST);
  const [replying, setReplying] = useState(false);
  const [selectedComment, setSelectedComment] = useState<commentType | null>(
    null
  );
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentCount, setCommentCount] = useState(0);
  const [animateInput, setAnimateInput] = useState(false);

  const inputRef = useRef<TextInput>(null);
  const buttonScale = useRef(new Animated.Value(1)).current;
  const inputScaleX = useRef(new Animated.Value(1)).current;

  const { selectedNews } = useData();
  const { currentUser, googleSignIn } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [selectedNews?.newsId]);

  useEffect(() => {
    if (commentList) {
      const totalComments = commentList.reduce(
        (acc, comment) => acc + (comment.replyArray?.length || 0) + 1,
        0
      );
      setCommentCount(totalComments);
    }
  }, [commentList]);

  // Button animation when pressing send
  const animateSendButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Input animation when focusing
  const animateTextInput = (focus: boolean) => {
    setAnimateInput(focus);
    Animated.spring(inputScaleX, {
      toValue: focus ? 1.02 : 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const fetchComments = async () => {
    if (!selectedNews?.newsId) return;

    setLoading(true);
    setError(null);
    try {
      const commentsCollectionRef = collection(
        db,
        "news",
        selectedNews.newsId,
        "comments"
      );
      const commentsQuery = query(
        commentsCollectionRef,
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(commentsQuery);

      const commentsWithReply = await Promise.all(
        querySnapshot.docs.map(async (commentDoc) => {
          const repliesRef = collection(
            db,
            "news",
            selectedNews.newsId,
            "comments",
            commentDoc.id,
            "reply"
          );
          const repliesQuery = query(repliesRef, orderBy("timestamp", "asc"));
          const repliesSnap = await getDocs(repliesQuery);

          const replyArray = repliesSnap.docs.map((doc) => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
            replyId: doc.id,
          }));

          return {
            ...commentDoc.data(),
            timestamp: commentDoc.data().timestamp?.toDate(),
            commentId: commentDoc.id,
            replyArray,
          };
        })
      );

      setCommentList(commentsWithReply);
    } catch (err) {
      console.error("Error fetching comments", err);
      setError("Failed to load comments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const postComment = async (text: string) => {
    if (!currentUser) return googleSignIn();
    if (!selectedNews?.newsId) return;

    setLoading(true);
    try {
      const ref = collection(db, "news", selectedNews.newsId, "comments");
      await addDoc(ref, {
        comment: text,
        person: currentUser.name,
        photoURL: currentUser.photoURL,
        uid: currentUser.uid,
        timestamp: Timestamp.now(),
        likes: 0,
      });
      fetchComments();
    } catch (err) {
      console.error("Error posting comment", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const postReply = async (text: string) => {
    if (!currentUser || !selectedComment) return googleSignIn();
    if (!selectedNews?.newsId) return;

    setLoading(true);
    try {
      const ref = collection(
        db,
        "news",
        selectedNews.newsId,
        "comments",
        selectedComment.commentId,
        "reply"
      );
      await addDoc(ref, {
        comment: text,
        person: currentUser.name,
        photoURL: currentUser.photoURL,
        uid: currentUser.uid,
        replyTo: selectedComment.uid,
        timestamp: Timestamp.now(),
        likes: 0,
      });
      fetchComments();
    } catch (err) {
      console.error("Error posting reply", err);
      setError("Failed to post reply. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!comment.trim()) return;

    animateSendButton();
    replying ? postReply(comment) : postComment(comment);
    setComment("");
    setReplying(false);
    setSelectedComment(null);
  };

  const handleClickReply = (commentObj: commentType) => {
    setReplying(true);
    setSelectedComment(commentObj);
    inputRef.current?.focus();
  };

  const retryFetchComments = () => {
    if (error) {
      fetchComments();
    }
  };

  const getCommentSummary = () => {
    if (commentCount === 0) return "No comments yet";
    if (commentCount === 1) return "1 comment";
    return `${commentCount} comments`;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Comment header */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <FontAwesome name="comments" size={20} color="#3B82F6" />
          <Text className="text-white text-base font-bold ml-2">
            {getCommentSummary()}
          </Text>
        </View>
        <TouchableOpacity
          onPress={retryFetchComments}
          className="flex-row items-center"
          disabled={loading || !error}
        >
          <Ionicons name="refresh" size={18} color="#3B82F6" />
          <Text className="text-blue-400 text-sm ml-1">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Error state */}
      {error && (
        <TouchableOpacity
          className="bg-gray-800 rounded-lg p-3 mb-4 flex-row items-center"
          onPress={retryFetchComments}
        >
          <Ionicons name="warning" size={22} color="#EF4444" />
          <Text className="text-red-400 ml-2 flex-1">{error}</Text>
          <Ionicons name="refresh" size={18} color="#EF4444" />
        </TouchableOpacity>
      )}

      {/* Empty state */}
      {!loading && commentList.length === 0 && !error && (
        <View className="items-center justify-center py-8 mb-4 bg-gray-800/50 rounded-xl">
          <MaterialCommunityIcons
            name="comment-text-outline"
            size={40}
            color="#6B7280"
          />
          <Text className="text-gray-400 mt-2 text-center">
            Be the first to comment on this article
          </Text>
          <TouchableOpacity
            className="mt-4 bg-blue-600 px-4 py-2 rounded-full"
            onPress={() => inputRef.current?.focus()}
          >
            <Text className="text-white font-medium">Add Comment</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state */}
      {loading && commentList.length === 0 && (
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-blue-400 font-medium text-base mt-3">
            Loading comments...
          </Text>
        </View>
      )}

      {/* Comment list */}
      <ScrollView
        className="flex-1 mb-20"
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {commentList.map((commObj, index) => (
          <View key={index} className="mb-3">
            <Comment
              obj={commObj}
              handleClickReply={handleClickReply}
              replying={replying}
              selectedComment={selectedComment}
            />
            {commObj.replyArray && commObj.replyArray.length > 0 && (
              <View className="ml-8 pl-4 border-l-2 border-gray-700">
                {commObj.replyArray.map((rep, idx) => (
                  <Reply key={idx} obj={rep} />
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Comment input section */}
      <View className="absolute bottom-0 left-0 w-full bg-gray-800/95 backdrop-blur-lg p-3 border-t border-gray-700">
        {replying && selectedComment && (
          <View className="flex-row items-center justify-between mb-2 px-2 bg-blue-900/50 p-2 rounded-lg">
            <View className="flex-row items-center">
              <Ionicons name="return-up-back" size={18} color="#60A5FA" />
              <Text className="text-gray-300 ml-1">
                Replying to{" "}
                <Text className="text-blue-400 font-medium">
                  {selectedComment.person}
                </Text>
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                setReplying(false);
                setSelectedComment(null);
              }}
              className="bg-gray-700 px-2 py-1 rounded-full"
            >
              <Text className="text-gray-300 text-xs">Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        <View className="flex-row items-center gap-2">
          {currentUser?.photoURL ? (
            <Image
              source={{ uri: currentUser.photoURL }}
              className="w-9 h-9 rounded-full border-2 border-gray-700"
            />
          ) : (
            <View className="w-9 h-9 rounded-full bg-gray-700 items-center justify-center">
              <Ionicons name="person" size={20} color="#9CA3AF" />
            </View>
          )}

          <Animated.View
            className="flex-1"
            style={{
              transform: [{ scaleX: inputScaleX }],
              borderColor: animateInput ? "#3B82F6" : "#374151",
              borderWidth: 1,
              borderRadius: 20,
              backgroundColor: "#1F2937",
            }}
          >
            <TextInput
              className="px-4 py-2 text-white"
              placeholder="Write a comment..."
              placeholderTextColor="#9CA3AF"
              ref={inputRef}
              value={comment}
              onChangeText={setComment}
              onSubmitEditing={handleSubmit}
              onFocus={() => animateTextInput(true)}
              onBlur={() => animateTextInput(false)}
              multiline
            />
          </Animated.View>

          <Animated.View
            style={{
              transform: [{ scale: buttonScale }],
            }}
          >
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!comment.trim()}
              className={`p-2 rounded-full ${
                comment.trim() ? "bg-blue-600" : "bg-gray-700"
              }`}
            >
              <Ionicons
                name="send"
                size={24}
                color={comment.trim() ? "#FFFFFF" : "#6B7280"}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CommentSection;
