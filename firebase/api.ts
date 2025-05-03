// import {
//   createUserWithEmailAndPassword,
//   onAuthStateChanged,
//   signInWithEmailAndPassword,
//   signOut,
// } from "firebase/auth";
// import { auth, db } from "./firebaseConfig";
// import { doc, setDoc } from "firebase/firestore";

// export const signup = async (email, password, name, photo, upload) => {
//   try {
//     const userCredential = await createUserWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     console.log(userCredential);
//     const user = userCredential.user;

//     const payload = {
//       name: "",
//       id: "",
//     };

//     await setDoc(doc(db, "users", user.uid), {
//       ...payload,
//       id: user.uid,
//       name,
//     });

//     await upload(photo, user);
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// };

// export const login = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(
//       auth,
//       email,
//       password
//     );
//     console.log(userCredential);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const logout = async () => {
//   try {
//     await signOut(auth);
//   } catch (error) {
//     console.log(error);
//     throw error;
//   }
// };

// export const AuthStateChanged = (setCurrentUser: any) => {
//   const unsubscribe = onAuthStateChanged(auth, (user) => {
//     if (!user) {
//       setCurrentUser(null);
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");
//       console.log("Auth state is changed: LoggedOut");
//       return;
//     }
//     setCurrentUser(user);
//     localStorage.setItem("token", user.accessToken);
//     localStorage.setItem("user", JSON.stringify(user));
//     console.log("Auth state is changed: loggedIn");
//   });

//   return unsubscribe;
// };
