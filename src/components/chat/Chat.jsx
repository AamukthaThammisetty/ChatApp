import React from 'react';
import "./chat.css";
import { getDoc } from 'firebase/firestore';
import { arrayUnion } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { useChatStore } from '../../lib/chatStore';
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';

function Chat() {
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState({
    file: null,
    url: '',
  });
  const [text, setText] = useState('');
  const [chat, setChat] = useState();
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const endRef = useRef(null);

  const imageUpload = async () => {
    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
        console.log('Image URL:', imgUrl);
        await updateDoc(doc(db, 'chats', chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            createdAt: new Date(),
            ...(imgUrl && { img: imgUrl }),
          }),
        });
        setImg({
          file: null,
          url: '',
        });
      }
    } catch (err) {
      console.log(err);
    }

  }

  const imageUploadCancel = () => {

  }

  const handleSend = async () => {
    if (text === '') return '';

    try {


      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, 'userchats', id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);
          userChatsData.chats[chatIndex].lastMessage = text;
          userChatsData.chats[chatIndex].isSeen = id === currentUser.id;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
    setText('');
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, 'chats', chatId), (res) => {
      setChat(res.data());
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  return (
    <div className='chat'>
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="" />
          <img src="./video.png" alt="" />
          <img src="./info.png" alt="" />
        </div>
      </div>
      <div className="center">
        {chat?.messages?.map((message) => (
          <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt?.seconds}>
            <div className="texts">
              {message.img && < img src={message.img} alt="" />}
              {message.text && <p>{message.text}</p>}
              <span>{new Date(message.createdAt.seconds * 1000).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {img.file && (
          <div className="preview-container">
            <img src={img.url} alt="Preview" className="preview-image" />
            <div className="preview-buttons">
              <button onClick={imageUploadCancel}>Cancel</button>
              <button onClick={imageUpload}>Send</button>
            </div>
          </div>
        )}
        <div ref={endRef}></div>
      </div>
      <div className="bottom">
        <div className="icons">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input type="file" id="file" style={{ display: 'none' }} onChange={handleImg} />
          <img src="./camera.png" alt="" />
          <img src="./mic.png" alt="" />
        </div>
        <input type="text" placeholder="type a message..." onChange={(e) => setText(e.target.value)} value={text} />
        <div className="emoji">
          <img src="./emoji.png" alt="" onClick={() => setOpen((prev) => !prev)} />
          {open && (
            <div className="picker">
              <EmojiPicker onEmojiClick={handleEmoji} height={400} width={300} />
            </div>
          )}
        </div>
        <button className='sendButton' onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
