import { useRecoilState, useRecoilValue } from "recoil";
import "./chat.css";
import { isLoginState, loginIdState } from "./RecoilData";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

const ChatMain = () => {
  const isLogin = useRecoilValue(isLoginState);
  const [chatList, setChatList] = useState([]);
  const [loginId, setLoginId] = useRecoilState(loginIdState);
  const [ws, setWs] = useState({});
  const [btnStatus, setBtnStatus] = useState(true);
  //http://192.168.10.205:9999
  const backServer = process.env.REACT_APP_BACK_SERVER;
  //ws://192.168.10.205:9999
  const socketServer = backServer.replace("http://", "ws://"); //http -> ws(web socket)
  const [chatMsg, setChatMsg] = useState({
    type: "enter",
    memberId: loginId,
    message: "",
  });
  const inputMsg = (e) => {
    const checkValue = e.target.value.replaceAll("\n", ""); //개행문자가 있으면 빈 문자열로 만들기
    if (checkValue === "" && chatMsg.message === "") {
      setBtnStatus(true);
      return;
    }
    setChatMsg({ ...chatMsg, message: e.target.value });
    if (e.target.value === "") {
      setBtnStatus(true);
    } else {
      setBtnStatus(false);
    }
  };
  //ws://192.168.10.205:9999
  useEffect(() => {
    //ws://192.168.10.205:9999/allChat
    chatMsg.memberId = loginId === "" ? "" : loginId;
    setChatMsg({ ...chatMsg });
    if (chatMsg.memberId !== "") {
      const socket = new WebSocket(`${socketServer}/allChat`);
      setWs(socket);
      return () => {
        console.log("이거보이냐?");
        socket.close();
      };
    }
  }, [loginId]);
  const startChat = () => {
    console.log("웹소켓 연결 시 실행되는 함수");
    const data = JSON.stringify(chatMsg);
    ws.send(data);
    setChatMsg({ ...chatMsg, type: "chat" });
  };
  const receiveMsg = (receiveData) => {
    console.log("서버에서 데이터를 받으면 실행되는 함수");
    //서버가 보낸 문자열을 받아서 객체로 변환
    const data = JSON.parse(receiveData.data);
    console.log(data);
    setChatList([...chatList, data]);
  };
  const endChat = () => {
    setTimeout(startChat, 500); //0.5초 후 재연결 시도
    console.log("웹소켓 연결이 끊어지면 실행되는 함수");
    console.log(chatMsg.memberId);
  };
  //소켓 연결하면 실행되는 함수 지정
  ws.onopen = startChat;
  //서버에서 데이터를 받으면 처리할 함수 지정
  ws.onmessage = receiveMsg;
  //소켓 연결이 끊어지면 실행되는 함수 지정
  ws.onclose = endChat;

  //JSON.stringify(obj) => json 데이터를 문자열로 변환
  const sendMessage = () => {
    const data = JSON.stringify(chatMsg);
    ws.send(data); //웹소켓객체의 send함수가 서버쪽으로 웹소켓을 통해서 데이터를 전송
    setChatMsg({ ...chatMsg, message: "" });
  };
  const chatDiv = useRef(null);
  useEffect(() => {
    if (chatDiv.current) {
      chatDiv.current.scrollTop = chatDiv.current.scrollHeight;
    }
  }, [chatList]);
  const inputKeyBoard = (e) => {
    if (e.keyCode === 13 && !e.shiftKey && chatMsg.message !== "") {
      sendMessage();
    }
  };
  return (
    <section className="section chat-wrap">
      <div className="page-title">전체회원 채팅</div>
      {isLogin ? (
        <div className="chat-content-wrap">
          <div className="chat-message-area" ref={chatDiv}>
            {chatList.map((chat, index) => {
              return (
                <Chatting
                  key={"chat-" + index}
                  chat={chat}
                  memberId={loginId}
                />
              );
            })}
          </div>
          <div className="message-input-box">
            <div className="input-item">
              <textarea
                id="chat-message"
                value={chatMsg.message}
                onChange={inputMsg}
                onKeyUp={inputKeyBoard}
              ></textarea>
              <button
                //   btnStatus는 false가 활성화, true가 비활성화 (주의!)
                className={btnStatus ? "btn-secondary" : "btn-primary"}
                onClick={btnStatus ? null : sendMessage}
                disabled={btnStatus}
              >
                전송
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-info-box">
          <h3>로그인 후 이용 가능합니다.</h3>
          <Link to="/login">로그인 페이지로 이동</Link>
        </div>
      )}
    </section>
  );
};

const Chatting = (props) => {
  const chat = props.chat;
  const memberId = props.memberId;
  return (
    <>
      {chat.type === "enter" ? (
        <p className="info">
          <span>{chat.memberId}</span>님이 입장하셨습니다.
        </p>
      ) : chat.type === "out" ? (
        <p className="info">
          <span>{chat.memberId}</span>님이 나가셨습니다.
        </p>
      ) : (
        <div
          className={chat.memberId === memberId ? "chat right" : "chat left"}
        >
          <div className="user">
            <span className="material-icons">account_circle</span>
            <span className="name">{chat.memberId}</span>
          </div>
          <div className="chat-message">{chat.message}</div>
        </div>
      )}
    </>
  );
};

export default ChatMain;
