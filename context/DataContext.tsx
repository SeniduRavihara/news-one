import { createContext, useEffect, useState } from "react";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

import {
  dataContextType,
  newsDocType,
  newsListType,
  newsObjType,
  reactionDocType,
} from "../types";
import {
  INITIAL_CONTEXT,
  INITIAL_NEWS_LIST,
  INITIAL_NEWS_OBJECT,
} from "../constants";

export const DataContext = createContext<dataContextType>(INITIAL_CONTEXT);

function DataContextProvider({ children }: { children: React.ReactNode }) {
  const [newsList, setNewsList] = useState<newsListType>(INITIAL_NEWS_LIST);
  const [lastNews, setLastNews] = useState<newsObjType>(INITIAL_NEWS_OBJECT);
  const [selectedNews, setSelectedNews] =
    useState<newsObjType>(INITIAL_NEWS_OBJECT);
  const [loading, setLoading] = useState<boolean>(false);
  const [firstLoading, setFirstLoading] = useState<boolean>(false);
  const [lastFetchedNews, setLastFetchedNews] =
    useState<newsObjType>(INITIAL_NEWS_OBJECT);

  // ----------------------------------------------------

  useEffect(() => {
    console.log(newsList);

    if (newsList.length > 0) {
      setLastNews(newsList[0]);
    }
  }, [newsList]);

  useEffect(() => {
    const firstLoadHandle = async () => {
      if (newsList.length === 1) {
        setNewsList([]);
        setFirstLoading(true);
        await fetchData();
        setFirstLoading(false);
      }
    };

    firstLoadHandle();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const collectionRef = collection(db, "news");
    const q = lastNews
      ? query(
          collectionRef,
          orderBy("publishedTime", "desc"),
          startAfter(lastFetchedNews.publishedTime ?? ""),
          limit(8)
        )
      : collectionRef;

    const queryNewsSnapshot = await getDocs(q);

    const newNewsArrWithReactions: newsListType = await Promise.all(
      queryNewsSnapshot.docs.map(async (newsDoc) => {
        const reactionCollectionRef = collection(
          db,
          "news",
          newsDoc.id,
          "reactions"
        );

        const queryReactionSnapshot = await getDocs(reactionCollectionRef);

        const reactionArray = queryReactionSnapshot.docs.map((reactionDoc) => {
          const reactionData = reactionDoc.data() as reactionDocType;
          return {
            ...reactionData,
            key: reactionDoc.id,
          };
        });

        const newsData = newsDoc.data() as newsDocType;
        // const newsTimestamp = newsData.publishedTime?.toDate();

        return {
          reactionArray,
          ...newsData,
          newsId: newsDoc.id,
        };
      })
    );

    // console.log(newNewsArrWithReactions);
    

    // const newNewsArr = queryNewsSnapshot.docs.map((doc) => {
    //   const data = doc.data() as newsObjType; // Explicitly cast to newsObjType
    //   return {
    //     ...data,
    //     newsId: doc.id,
    //   };
    // });

    setNewsList((prevNewsList) => [
      ...prevNewsList,
      ...newNewsArrWithReactions,
    ]);

    if (newNewsArrWithReactions.length > 0) {
      setLastFetchedNews(
        newNewsArrWithReactions[newNewsArrWithReactions.length - 1]
      );
    }

    setLoading(false);
  };

  const value = {
    newsList,
    lastNews,
    selectedNews,
    setSelectedNews,
    loading,
    fetchData,
    firstLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
export default DataContextProvider;
