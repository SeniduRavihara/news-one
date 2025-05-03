import {  Timestamp } from "firebase/firestore";

export type newsObjType = {
  commentCount: number;
  likeCount: number;
  loveCount: number;
  sadCount: number;
  angryCount: number;
  wowCount: number;
  
  news: string;
  publishedTime: Timestamp | null;
  title: string;
  imageUrl: string | null;
  newsId: string;
  reactionArray?: null | Array<reactionDocType>;
};

export type newsDocType = {
  commentCount: number;
  likeCount: number;
  loveCount: number;
  sadCount: number;
  angryCount: number;
  wowCount: number;
  news: string;
  publishedTime: Timestamp | null;
  title: string;
  imageUrl: string | null;
  newsId: string;
};

export type newsListType = Array<newsObjType>;

// export type reactionType = {
//   count: number;
//   persons: Array<string>;
//   key: "string"
// };

// ----------------------------------------------

export type dataContextType = {
  newsList: newsListType;
  lastNews: newsObjType;
  selectedNews: newsObjType;
  setSelectedNews: React.Dispatch<React.SetStateAction<newsObjType>>;
  fetchData: () => void;
  firstLoading: boolean;
  loading: boolean;
};

// ---------------------------------

export type authContextType = {
  currentUser: currentUserType | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<currentUserType | null>>;
  googleSignIn: () => void;
  logout: () => void;
};

export type currentUserType = null | {
  uid: string;
  email: string | null;
  name: string | null;
  photoURL: string | null;
  likedPostsId?: Array<string> | undefined;
  unlikedPostsId?: Array<string> | undefined;
};

// ----------------------------------

export type commentType = {
  comment: string;
  likes: number;
  person: string | null;
  timestamp: Date | undefined;
  commentId: string;
  photoURL: string | null;
  uid: string;
  replyArray?: null | Array<replyType>;
};

export type replyType = {
  comment: string;
  likes: number;
  person: string | null;
  timestamp: Date | undefined;
  replyId: string;
  replyTo: string;
  photoURL: string | null;
  uid: string;
};

export type commentListType = Array<commentType>;


// ------------------------------------------

export type commentDocType = {
  comment: string;
  likes: number;
  person: string;
  photoURL: string;
  timestamp: Timestamp;
  uid: string;
};

export type replyDocType = {
  comment: string;
  likes: number;
  person: string;
  photoURL: string;
  replyTo: string;
  timestamp: Timestamp;
  uid: string;
};

export type reactionDocType = {
  count: number,
  persons: Array<string>
  key: string,
  imoji: string
};