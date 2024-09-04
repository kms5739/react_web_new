import { useState } from "react";
import { useRecoilState } from "recoil";
import { loginIdState } from "../utils/RecoilData";
import BoardFrm from "./BoardFrm";
import ToastEditor from "../utils/ToastEditor";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const BoardWrite = () => {
  const backServer = process.env.REACT_APP_BACK_SERVER;
  const navigate = useNavigate();
  //글 작성 시 전송할 데이터 선언
  const [loginId, setLoginId] = useRecoilState(loginIdState); //로그인한 회원 아이디 값(입력하지 않을거라서 state 사용 X, 변수로만 사용)
  const [boardTitle, setBoardTitle] = useState(""); //사용자가 입력할 제목
  const [thumbnail, setThumbnail] = useState(null); //썸네일은 첨부파일로 처리
  const [boardContent, setBoardContent] = useState(""); //사용자가 입력할 내용
  const [boardFile, setBoardFile] = useState([]); //첨부파일(여러개일 수 있으므로 배열로 처리)
  const inputTitle = (e) => {
    setBoardTitle(e.target.value);
  };
  const writeBoard = () => {
    if (boardTitle !== "" && boardContent !== "") {
      const form = new FormData();
      form.append("boardTitle", boardTitle);
      form.append("boardContent", boardContent);
      form.append("boardWriter", loginId);
      //썸네일이 첨부된 경우에만 추가
      if (thumbnail !== null) {
        form.append("thumbnail", thumbnail);
      }
      //첨부파일도 추가한 경우에만 추가(첨부파일은 여러개가 같은 name으로 전송)
      for (let i = 0; i < boardFile.length; i++) {
        form.append("boardFile", boardFile[i]);
      }
      axios
        .post(`${backServer}/board`, form, {
          headers: {
            contentType: "multipart/form-data",
            processData: false,
          },
        })
        .then((res) => {
          if (res.data) {
            navigate("/board/list");
          } else {
            Swal.fire({
              title: "에러가 발생했습니다.",
              text: "원인을 찾으세요",
              icon: "error",
            });
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  return (
    <section className="section board-content-wrap">
      <div className="page-title">게시글 작성</div>
      <form
        className="board-write-frm"
        onSubmit={(e) => {
          e.preventDefault();
          writeBoard();
        }}
      >
        <BoardFrm
          loginId={loginId}
          boardTitle={boardTitle}
          setBoardTitle={inputTitle}
          thumbnail={thumbnail}
          setThumbnail={setThumbnail}
          boardFile={boardFile}
          setBoardFile={setBoardFile}
        />
        <div className="board-content-wrap">
          <ToastEditor
            boardContent={boardContent}
            setBoardContent={setBoardContent}
          />
        </div>
        <div className="button-zone">
          <button type="submit" className="btn-primary lg">
            등록하기
          </button>
        </div>
      </form>
    </section>
  );
};

export default BoardWrite;
