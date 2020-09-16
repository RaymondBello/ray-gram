# Ray-gram

![Build Status](https://img.shields.io/github/last-commit/RaymondBello/ray-gram) ![Build Status](https://img.shields.io/github/issues-raw/RaymondBello/ray-gram) ![Build Status](https://img.shields.io/github/contributors/RaymondBello/ray-gram?color) 
![Build Status](https://img.shields.io/github/languages/top/RaymondBello/ray-gram) ![Build Status](https://img.shields.io/github/languages/count/RaymondBello/ray-gram) 
![Build Status](https://img.shields.io/github/repo-size/RaymondBello/ray-gram?color=red) 

This is a web-based photo library app created using React, derived from the idea of the Instagram profile page. Created to showcase various artworks and fashion shoots. The layout and styled elements can also be easily customized.

<img src="/Videos/ray-gram.gif?raw=true" width="700px">

# Table of contents
* [General Info](#general-info)
* [How It's Made](#how-its-made)
* [Sources](#sources)


# General Info
The purpose of this project was to design a web-based app which allowed for the uploading and viewing of images by anyone to the photo-library database. 
The front-end is designed using **React** and **Framer Motion** for all the subtle animations (eg. progress bar and the modal used to view a picture). 
For the back-end I used 2 firebase services. **Firebase Storage** to store the all uploaded images and **Firebase Firestore** database to keep track of image URL's and to give use real-time image data.

# How It's Made
I broke down the project into several parts to simplify the design process as well, and make it relatively easy for any to create their own version using this template. The parts are as follows:
* [Project Structure](#project-structure)
* [Firebase Setup](#firebase-setup)
* [Upload Form](#upload-form)
* [Firebase storage hook](#firebase-storage-hook)
* [Progress Bar](#progress-bar)
* [Firestore hook and showing images](#firestore-hook-and-showing-images)
* [Creating the modal](#creating-the-modal)
* [Upcoming Features](#upcoming-features)
## Project Structure
Inside the source folder we have ```index.js``` the file that kickstarts the react application. ```App.js``` which is the root component. And all we're essentially doing is nesting custom components inside of the main app. All the components are placed in ```src/comps```. The title component is the first component to be rendered by the React app. This is the header part of the webpage (```src/comps/Title.js```).
```javascript
const Title = () => {
  return (
    <div className="title">
      <h1>Ray-gram</h1>
      <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
    </div>
  )
}
```
## Firebase Setup
Firstly we need to create a [firebase project](https://firebase.google.com/).
We will be making use of the Storage and Firestore in our project. The next thing is to add firebase to your front-end app. During registeration be sure to copy the contents of your web app's firebase configuration.
The firebase config is stored in ```src/firebase/config.js```
```javascript
var firebaseConfig = {
  apiKey: "AIzaSyDLmnoBvnjOQ-AaJgDw1DnVBiTETbcp8LI",
  authDomain: "yout-firebase-authentication-domain",
  databaseURL: "your-database-URL",
  projectId: "your-project-id",
  storageBucket: "your-storagebucket-URL",
  messagingSenderId: "485942827092",
  appId: "1:43289323:web:323g23v23"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Constants that'll be used throught the project
const projectStorage = firebase.storage();
const projectFirestore = firebase.firestore();
const timestamp = firebase.firestore.FieldValue.serverTimestamp;

export { projectStorage, projectFirestore, timestamp };
```
## Upload Form
In the update form, we return a JSX tag. This will allow users to select images to upload to the photo library. To do this, an OnChange handler is added to the input.
```javascript
const UploadForm = () => {

  // The file and error are both stored in a local piece of state
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  // An array of allowed types which can be uploaded to the database
  const types = ['image/png', 'image/jpeg'];

  const handleChange = (e) => {
  
    // Get the first file selected by the user
    let selected = e.target.files[0];

    // Check to ensure the selected file is in the allowed imgae types 
    if (selected && types.includes(selected.type)) {
      setFile(selected);
      setError('');
    } 
    // An error is shown to tell the user to select a proper image file
    else {
      setFile(null);
      setError('Please select an image file (png or jpg)');
    }
  };

  return (
    <form>
      <label>
        <input type="file" onChange={handleChange} />
        <span>+</span>
      </label>
      <div className="output">
        { error && <div className="error">{ error }</div>}
        { file && <div>{ file.name }</div> }
        { file && <ProgressBar file={file} setFile={setFile} /> }
      </div>
    </form>
  );
}
```
## Firebase storage hook
A custom hook is used to handle file upload and firebase storage in ```src/hooks/useFirestore.js```.
```javascript
import { projectStorage, projectFirestore, timestamp } from '../firebase/config';

const useStorage = (file) => {

  // Created states for the upload
  const [progress, setProgress] = useState(0); 
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);

  // This runs every time the dependency {file} changes
  useEffect(() => {
  
    // references where the files should be saved
    const storageRef = projectStorage.ref(file.name);
    const collectionRef = projectFirestore.collection('images');
    
    
    storageRef.put(file).on('state_changed', (snap) => {
      // These values will be used in the progress bar animation
      let percentage = (snap.bytesTransferred / snap.totalBytes) * 100;
      setProgress(percentage);
    }, (err) => {
      setError(err);
    }, async () => {
      const url = await storageRef.getDownloadURL();
      const createdAt = timestamp();
      await collectionRef.add({ url, createdAt });
      setUrl(url);
    });
  }, [file]);

  return { progress, url, error };
}
```
<img src="/Videos/ray-gram.gif?raw=true" width="700px">

## Progress Bar
To improve user experience, feedback has to be provided to the user when the webapp is uploading the file to the database in the background. This is done by animating the progress bar using the ```progress``` value returned by the useEffect hook.

```javascript
import useStorage from '../hooks/useStorage';
import { motion } from 'framer-motion';

const ProgressBar = ({ file, setFile }) => {

  // This fires the useEffect hook in "../hooks/useStorage" 
  /* The value {progress} changes as the file is being uploaded, this is what is used by framer to animate the progress bar */
  const { progress, url } = useStorage(file);

  useEffect(() => {
    if (url) {
      setFile(null);
    }
  }, [url, setFile]);

  return (
    <motion.div className="progress-bar"
      initial={{ width: 0 }}
      animate={{ width: progress + '%' }} 
    ></motion.div>
  );
} 
```
## Firestore hook and showing images
Here we set-up a connection between our app and our and Firestore so we can actively listen for document being added to the collection.
Here we use another custom hook ```useFirestore``` to obtain firestore data from a collection.
```javascript
import { projectFirestore } from '../firebase/config';

const useFirestore = (collection) => {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    const unsub = projectFirestore.collection(collection)
      .orderBy('createdAt', 'desc')
      .onSnapshot(snap => {
        let documents = [];
        snap.forEach(doc => {
          documents.push({...doc.data(), id: doc.id});
        });
        setDocs(documents);
      });

    return () => unsub();
    // this is a cleanup function that react will run when
    // a component using the hook unmounts
  }, [collection]);

  return { docs };
}
```
We can then retreive those documents and cycle through in a react component and output an image for each of them using the URL property, we can also order them by date using the CreatedAt property as well.
This is done by the ```ImageGrid``` component in ```src/comps/ImageGrid.js```
```html
import useFirestore from '../hooks/useFirestore';
import { motion } from 'framer-motion';

const ImageGrid = ({ setSelectedImg }) => {
  const { docs } = useFirestore('images');

  return (
    <div className="img-grid">
      {docs && docs.map(doc => (
        <motion.div className="img-wrap" key={doc.id} 
          layout
          whileHover={{ opacity: 1 }}s
          onClick={() => setSelectedImg(doc.url)}
        >
          <motion.img src={doc.url} alt="uploaded pic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />
        </motion.div>
      ))}
    </div>
  )
}
```
<img src="/Videos/ray-gram.gif?raw=true" width="700px">

## Creating the modal
This is the view we get when an item is selected. Framer motion is used here to create an animated transition from a small view to an enlarged view as well as a backdrop when viewing the enlarged image
```javascript
import { motion } from 'framer-motion';

const Modal = ({ setSelectedImg, selectedImg }) => {
    
  const handleClick = (e) => {
    if (e.target.classList.contains('backdrop')) {
      setSelectedImg(null);
    }
  }

  return (
    <motion.div className="backdrop" onClick={handleClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.img src={selectedImg} alt="enlarged pic" 
        initial={{ y: "-100vh" }}
        animate={{ y: 0 }}
      />
    </motion.div>
  )
}
```
## Upcoming Features
These are some features that are currently being added:
* Delete images from the modal view
* Add upvotes and downvotes for each image
* Add a shareable link for other platforms (eg. Twitter,Facebook and Reddit)

# Sources
*"If I have seen further than others, it is by standing upon the shoulders of giants."*
* Myself and the cool people on stack overflow.
