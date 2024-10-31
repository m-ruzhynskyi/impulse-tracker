import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyAGJCh2l6Dt9rcqpzRe3027pF1kD4r7jUE",
  authDomain: "work-2ca8d.firebaseapp.com",
  projectId: "work-2ca8d",
  storageBucket: "work-2ca8d.appspot.com",
  messagingSenderId: "1031605588142",
  appId: "1:1031605588142:web:41c1d257cbe188e7229d3f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export {auth, db}