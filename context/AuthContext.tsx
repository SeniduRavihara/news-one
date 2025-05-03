import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { createContext, useEffect, useState } from "react";
import { auth, db, provider } from "../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import { authContextType, currentUserType } from "../types";
import { INITIAL_AUTH_CONTEXT } from "../constants";

export const AuthContext = createContext<authContextType>(INITIAL_AUTH_CONTEXT);

function AuthContextProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<currentUserType | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setCurrentUserId(null);
        console.log("Auth state is changed: LoggedOut");
        return;
      }

      setCurrentUserId(user.uid);

      console.log("Auth state is changed: loggedIn");
    });

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentUserId) {
      const documentRef = doc(db, "users", currentUserId);

      const unsubscribe = onSnapshot(documentRef, (documentSnapshot) => {
        if (documentSnapshot.exists()) {
          const userData = documentSnapshot.data() as currentUserType; // Type cast the data
          setCurrentUser(userData);
        } else {
          console.log("Document does not exist.");
        }
      });
      return unsubscribe;
    } else {
      console.log("currentUser is not available.");
    }
  }, [currentUserId]);

  const googleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const userData = {
          name: user.displayName || "",
          email: user.email || "",
          uid: user.uid,
          photoURL: user.photoURL || "",
          likedPostsId: [""],
        };

        await setDoc(userDocRef, userData);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        logout,
        currentUser,
        setCurrentUser,
        googleSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export default AuthContextProvider;
