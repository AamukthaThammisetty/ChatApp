import React from 'react'
import "./adduser.css"
import { arrayUnion } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { serverTimestamp } from 'firebase/firestore';
import { doc } from 'firebase/firestore';
import { setDoc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import {  getDocs } from 'firebase/firestore';
import { useState } from 'react';
import { getDoc } from 'firebase/firestore';
import { collection ,query,where} from 'firebase/firestore'; 

import { useUserStore } from '../../../../lib/userStore';
function Adduser() {
  const [user,setUser]=useState(null);
  const{currentUser}=useUserStore();
  const handleSearch= async(e)=>{
    e.preventDefault();
    const formData=new FormData(e.target);
    const username=formData.get("username");
    try{
      const userRef=collection(db,"users");
      const q=query(userRef,where("username","==",username));
      const querySnapShot=await getDocs(q)
      if(!querySnapShot.empty){
        setUser(querySnapShot.docs[0].data());
      }
    }catch(err){
      console.log(err);
    }
  }
  
  const handleAdd=async()=>{
    const chatRef=collection(db,"chats");
    const userChatsRef=collection(db,"userchats");
    try{
      const newChatRef=doc(chatRef)
        await setDoc(newChatRef,{
          createdAt:serverTimestamp(),
          messages:[],
        })
        
        await updateDoc(doc(userChatsRef,user.id),{
          chats:arrayUnion({
            chatId:newChatRef.id,
            lastMessage:"",
            receiverId:currentUser.id,
            updatedAt:Date.now()
          })
        })

        await updateDoc(doc(userChatsRef,currentUser.id),{
          chats:arrayUnion({
            chatId:newChatRef.id,
            lastMessage:"",
            receiverId:user.id,
            updatedAt:Date.now()
          })
        })

    }catch(err){
      console.log(err);
    }
  }
  return (
    <div className='addUser'>
      <form onSubmit={handleSearch}>
        <input type="text"placeholder='Username' name="username" />
        <button>Search</button>
      </form>
      {user && <div className='user'>
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt=""/>
            <span>{user.username}</span>
            <button onClick={handleAdd}>Add User</button>
          </div>
      </div>}
    </div>
  )
}

export default Adduser
