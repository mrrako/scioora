import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  updateDoc,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';

const authService = {
  login: async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      const userData = {
        uid: userCredential.user.uid,
        _id: userCredential.user.uid,
        email: userCredential.user.email,
        ...userDoc.data()
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, data: userData };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  register: async (userData) => {
    try {
      const { email, password, username, fullName } = userData;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateFirebaseProfile(userCredential.user, {
        displayName: username
      });

      const newUser = {
        uid: userCredential.user.uid,
        _id: userCredential.user.uid,
        email,
        username,
        fullName,
        bio: '',
        avatar: '',
        followers: [],
        following: [],
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      
      localStorage.setItem('user', JSON.stringify(newUser));
      return { success: true, data: newUser };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  logout: async () => {
    await signOut(auth);
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  updateProfile: async (profileData) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error("Not authenticated");

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, profileData);

      const updatedUser = { ...currentUser, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return { success: true, data: updatedUser };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getUserProfile: async (username) => {
    try {
      // Find user by username
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      let foundUser = null;
      
      querySnapshot.forEach((doc) => {
        if (doc.data().username === username) {
          foundUser = doc.data();
        }
      });
      
      if (!foundUser) throw new Error("User not found");
      return { success: true, data: { ...foundUser, _id: foundUser.uid } };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getAllUsers: async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ ...doc.data(), _id: doc.id });
      });
      return { success: true, data: users };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  followUser: async (targetUserId) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error("Not authenticated");
      if (currentUser.uid === targetUserId) throw new Error("You cannot follow yourself");

      const currentUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      await updateDoc(currentUserRef, {
        following: arrayUnion(targetUserId)
      });

      await updateDoc(targetUserRef, {
        followers: arrayUnion(currentUser.uid)
      });

      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  unfollowUser: async (targetUserId) => {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) throw new Error("Not authenticated");
      if (currentUser.uid === targetUserId) throw new Error("You cannot follow yourself");

      const currentUserRef = doc(db, 'users', currentUser.uid);
      const targetUserRef = doc(db, 'users', targetUserId);

      await updateDoc(currentUserRef, {
        following: arrayRemove(targetUserId)
      });

      await updateDoc(targetUserRef, {
        followers: arrayRemove(currentUser.uid)
      });

      return { success: true };
    } catch (error) {
      throw new Error(error.message);
    }
  }
};

export default authService;
