import React, { useState, useRef, useEffect } from 'react';
import "./chat.css";
import Camera from 'react-html5-camera-photo';
import { getDoc, updateDoc, doc, onSnapshot, arrayUnion } from 'firebase/firestore';
import 'react-html5-camera-photo/build/css/index.css';
import EmojiPicker from 'emoji-picker-react';
import { useChatStore } from '../../lib/chatStore';
import { db } from '../../lib/firebase';
import { useUserStore } from '../../lib/userStore';
import upload from '../../lib/upload';
import vmsg from 'vmsg';

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [img, setImg] = useState({ file: null, url: '' });
  const [camImg, setCamImg] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [text, setText] = useState('');
  const [chat, setChat] = useState();
  const { chatId, user } = useChatStore();
  const { currentUser } = useUserStore();
  const [isCamOpen, setIsCamOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const endRef = useRef(null);
  const recorderRef = useRef(new vmsg.Recorder({ wasmURL: "https://unpkg.com/vmsg@0.3.0/vmsg.wasm" }));

  const handleCamToggle = () => {
    setIsCamOpen((prev) => !prev);
  };

  const handleTakePhoto = async (dataUri) => {
    const blob = await fetch(dataUri).then(res => res.blob());
    const file = new File([blob], "photo.jpg", { type: "image/jpeg" });
    setCamImg(file);
    setIsCamOpen(false);
  };

  const imageUpload = async () => {
    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      } else if (camImg) {
        imgUrl = await upload(camImg);
      }

      if (imgUrl) {
        await updateDoc(doc(db, 'chats', chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            createdAt: new Date(),
            img: imgUrl,
          }),
        });

        setImg({ file: null, url: '' });
        setCamImg(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const audioUpload = async () => {
    try {
      if (audioBlob) {
        const audioUrl = await upload(audioBlob);
        await updateDoc(doc(db, 'chats', chatId), {
          messages: arrayUnion({
            senderId: currentUser.id,
            text,
            createdAt: new Date(),
            audio: audioUrl,
          }),
        });
        setAudioBlob(null);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleRecord = async () => {
    setIsLoading(true);
    const recorder = recorderRef.current;

    if (isRecording) {
      const blob = await recorder.stopRecording();
      setAudioBlob(blob);
      setIsRecording(false);
      setIsLoading(false);
    } else {
      try {
        await recorder.initAudio();
        await recorder.initWorker();
        recorder.startRecording();
        setIsRecording(true);
        setIsLoading(false);
      } catch (err) {
        setIsLoading(false);
        console.log(err);
      }
    }
  };

  const audioUploadCancel = () => {
    setAudioBlob(null);
  };
  const imageUploadCancel = () => {
    setImg({ file: null, url: '' });
  };

  const handleSend = async () => {
    if (text === '') return '';

    try {
      await updateDoc(doc(db, 'chats', chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: new Date(),
        }),
      });
    } catch (err) {
      console.error("Error updating user chats:", err);
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
              {message.audio && <audio controls src={message.audio}></audio>}
              {message?.text?.length !== 0 && <p>{message.text}</p>}
              <span>{new Date(message.createdAt.seconds * 1000).toLocaleString()}</span>
            </div>
          </div>
        ))}
        {(img.file || camImg) && (
          <div className="preview-container">
            <img src={img.file ? img.url : URL.createObjectURL(camImg)} alt="Preview" className="preview-image" />
            <div className="preview-buttons">
              <button onClick={imageUploadCancel}>Cancel</button>
              <button onClick={imageUpload}>Send</button>
            </div>
          </div>
        )}
        {audioBlob && (
          <div className="preview-container">
            <audio controls src={URL.createObjectURL(audioBlob)} className="preview-audio"></audio>
            <div className="preview-buttons">
              <button onClick={audioUploadCancel}>Cancel</button>
              <button onClick={audioUpload}>Send</button>
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
          <img src="./camera.png" alt="" onClick={handleCamToggle} />
          {isCamOpen && (
            <div className="camera-container">
              <Camera onTakePhoto={(dataUri) => handleTakePhoto(dataUri)} />
              <button className="camera-close-button" onClick={handleCamToggle}>Close Camera</button>
            </div>
          )}
          <img src={isRecording ? "./images.jpg" : "./mic.png"} alt="" onClick={handleRecord} disabled={isLoading} />
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
