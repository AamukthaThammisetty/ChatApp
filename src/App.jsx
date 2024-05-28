import React from 'react'
import { useEffect } from 'react';
import { auth } from './lib/firebase';
import { doc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Login from './components/login/login';
import List from './components/list/List'
import Chat from './components/chat/Chat'
import {useUserStore }from './lib/userStore';
import { useChatStore } from './lib/chatStore';
import Notification from './components/notification/Notification';
function App() {
  const {currentUser,isLoading,fetchUserInfo}=useUserStore();
  const {chatId}=useChatStore();
  useEffect(()=>{
    const unSub=onAuthStateChanged(auth,(user)=>{
      fetchUserInfo(user?.uid);
    });
    return ()=>{
      unSub();
    }
  },[fetchUserInfo]);

  if(isLoading) return <div className='loading'>Loading...</div>
  return (
    <div className='container'>
      {
        currentUser?(
          <>
            <List/>
           {chatId && <Chat/>}
          </>
      ):(<Login/>)
      }
      <Notification/>
      
    </div>
  )
}

export default App
