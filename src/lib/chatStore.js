import {create} from "zustand"
import { doc } from "firebase/firestore";
import { getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { set } from "firebase/database";
import { useUserStore } from "./userStore";
export const useChatStore=create((set)=>({
  chatId:null,
  user:null,
  // isReceiverBlocked:false,
  
  changeChat:(chatId,user)=>{
    const currentUser=useUserStore.getState().currentUser;
      return set({
        chatId,
        user,
      })
}
  
}))

