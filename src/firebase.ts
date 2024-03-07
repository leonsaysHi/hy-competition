// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDb-7CU3jLOTQqeymAUlZYgD4n-hJLJK_4",
  authDomain: "cityhoops-basketball.firebaseapp.com",
  projectId: "cityhoops-basketball",
  storageBucket: "cityhoops-basketball.appspot.com",
  messagingSenderId: "762961716792",
  appId: "1:762961716792:web:2e3e752f3f75ebfb9f28cd",
  measurementId: "G-XRBNCENVWV"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);