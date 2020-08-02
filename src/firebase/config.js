import * as firebase from 'firebase/app';
import 'firebase/storage';
import 'firebase/firestore';

// Your web app's Firebase configuration
var firebaseConfig = {
    apiKey: "AIzaSyA0RS55MKScIKU4t7fXa6-vB8Z7eKDX4zE",
    authDomain: "ray-gram.firebaseapp.com",
    databaseURL: "https://ray-gram.firebaseio.com",
    projectId: "ray-gram",
    storageBucket: "ray-gram.appspot.com",
    messagingSenderId: "365447052453",
    appId: "1:365447052453:web:52dd9f9bc79221c479214c"
  };
  // Initialize Firebase
firebase.initializeApp(firebaseConfig);
  
const projectStorage = firebase.storage();
const projectFirestore = firebase.firestore();
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export { projectStorage, projectFirestore, timestamp };

