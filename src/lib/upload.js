import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const upload=async(file)=>{
  const  date= new Date();
  const storage = getStorage();
const storageRef = ref(storage, 'images/${date+file.name}');
  return new Promise((resolve,reject)=>{
const uploadTask = uploadBytesResumable(storageRef, file);

uploadTask.on('state_changed', 
  (snapshot) => {
    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
   
  }, 
  (error) => {
    reject("somthing went wrong");
  }, 
  () => {
   
    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
      resolve(downloadURL);
    });
  }
);
  });


}
export default upload;
