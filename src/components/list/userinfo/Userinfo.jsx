import React from 'react'
import "./userinfo.css"
import { auth } from '../../../lib/firebase';
import { useUserStore } from '../../../lib/userStore';
function Userinfo() {
  const{currentUser}=useUserStore();
  return (
    <div className='userinfo'>
      <div className='user'>
        <img src={currentUser.avatar || "./avatar.png" }alt=""/>
        <h2>{currentUser.username}</h2>
      </div>
      <div className='logout' onClick={()=>auth.signOut()}>
          Logout
      </div>
    </div>
   
  )
}

export default Userinfo
