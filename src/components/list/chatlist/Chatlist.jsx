import React from 'react'
import { useState } from 'react';
import "./chatlist.css"
import { useUserStore } from '../../../lib/userStore';
import Adduser from './addUser/Adduser';
import { useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { doc,getDoc } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { useChatStore } from '../../../lib/chatStore';
function Chatlist() {
  const [chats,setChats]=useState([]);
  const [addMode,setAddMode]=useState(false);
  const {currentUser}=useUserStore();
  const {chatId,changeChat}=useChatStore();
  useEffect(()=>{
    const unSub=onSnapshot(doc(db,"userchats",currentUser.id),async(res)=>{
      const items=res.data().chats;
      const promises=items.map(async(item)=>{
        const userDocRef=doc(db,"users",item.receiverId);
        const userDocSnap=await getDoc(userDocRef);
        const user=userDocSnap.data()
        return {...item,user};
      })
      const chatData=await Promise.all(promises);
      setChats(chatData.sort((a,b)=>b.updatedAt-a.updatedAt));
    });
    return ()=>{
      unSub();
    }
  },[])
  const handleSelect=async(chat)=>{
    const updatedChats = chats.map((item) => {
      if (item.chatId === chat.chatId) {
        return { ...item, isSeen: true }; // Mark the selected chat as seen
      }
      return item;
    });
  
    // Update the state with the new chats array
    setChats(updatedChats);
  
    // Prepare data for Firestore update
    const userChats = updatedChats.map(({ user, ...rest }) => rest);
    const userChatsRef = doc(db, "userchats", currentUser.id);
  
    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
    } catch (err) {
      console.log(err);
    }
  
    // Update the current chat
    changeChat(chat.chatId, chat.user);
  }
  return (
      <div className='chatlist'>
        <div className="search">
          <div className="searchBar">
            <img src="./search.png" alt=""/>
            <input type="text" placeholder="Search"/>
          </div>
          <img src={addMode ? "./minus.png" :"./plus.png"} alt="" className='add'
          onClick={()=>setAddMode((prev)=>!prev)}
          />
        </div>




        {chats.map((chat)=>(
          <div className="item" key={chat.chatId} onClick={()=>handleSelect(chat)} style={{ backgroundColor:chat?.isSeen?"transparent":"#5183fe",}} >
            <img src={ chat.user.avatar || "./avatar.png"}alt=""/>
            <div className="texts">
              <span>{chat.user.username}</span>
              <p>{chat.lastMessage}</p>
            </div>
          </div>
        ))}
        {addMode && <Adduser/>}
      </div>
      
    
  )
}

export default Chatlist
