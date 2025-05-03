import { Timestamp } from "firebase/firestore";

export const INITIAL_NEWS_OBJECT = {
  commentCount: 0,
  likesCount: 0,
  news: "",
  publishedTime: null,
  title: "",
  imageUrl: "",
  newsId: "",
  reactionArray: null,
};

export const INITIAL_NEWS_LIST = [INITIAL_NEWS_OBJECT];

export const INITIAL_CONTEXT = {
  newsList: [INITIAL_NEWS_OBJECT],
  lastNews: INITIAL_NEWS_OBJECT,
  selectedNews: INITIAL_NEWS_OBJECT,
  setSelectedNews: () => {},
  loading: false,
  fetchData: () => {},
  firstLoading: false,
};

// ---------------------------------

export const INITIAL_CURRENT_USER = {
  uid: "",
  email: "",
  name: "",
  photoURL: "",
};

export const INITIAL_AUTH_CONTEXT = {
  currentUser: INITIAL_CURRENT_USER,
  setCurrentUser: () => {},
  googleSignIn: () => {},
  logout: () => {},
};

// -----------------------------------

export const INITIAL_COMMENT = {
  comment: "test",
  likes: 0,
  person: "",
  timestamp: Timestamp.now(),
  commentId: "",
  photoURL: "",
  uid: ""
};

export const INITIAL_COMMENT_LIST = [
  {
    comment: "",
    likes: 0,
    person: "",
    timestamp: Timestamp.now().toDate(),
    commentId: "",
    photoURL: "",
    uid: "",
    replyArray: [],
  },
];
