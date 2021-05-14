import './App.css'
import { useEffect, useState } from 'react'
import Profile from './Profile.js'
// import axios from 'axios'
import arratData from "./result_json"

// const newArratData = arratData
// const fs = require('fs');

function App() {
  let [step, setStep] = useState(0);
  let [현재카드번호, set현재카드번호] = useState(-1);
  let [뭐눌렀냐, set뭐눌렀냐] = useState('like');
  let [고른거, 고른거변경] = useState([]);
  let [데이터, 데이터변경] = useState([]);
  
  useEffect(() => {

    데이터변경([...arratData])
    console.log(arratData);

  },[]);
  

  useEffect(()=>{
    if (현재카드번호 != -1 && 뭐눌렀냐 == 'like') {
      좋아요()
    } else if (현재카드번호 != -1 && 뭐눌렀냐 == 'dislike'){
      싫어요()
    }
    
  }, [현재카드번호, 뭐눌렀냐])


  function 좋아요(){
    let copy = [...데이터];
      copy[현재카드번호].passed = true;
      copy[현재카드번호].liked = 'right';
      데이터변경(copy);
      //고른리스트에 추가
      고른거변경([...고른거, 현재카드번호]);
        console.log(고른거);
  }

  function 싫어요(){

    let copy = [...데이터];
    copy[현재카드번호].passed = true;
    copy[현재카드번호].liked = 'left';
    데이터변경(copy);

  }

  return (
    <div className="App">
      <nav className="navbar navbar-expand navbar-light">
          <ul className="navbar-nav">
            <li className="nav-item active">
              <i className="nav-link fas fa-dog fa-lg"></i>
            </li>
            <li className="nav-item">
              <i className="nav-link fas fa-star fa-lg"></i>
            </li>
            <li className="nav-item">
              <i className="nav-link fas fa-comment fa-lg"></i>
            </li>
            <li className="nav-item">
            <i className="nav-link fas fa-cog fa-lg"></i>
            </li>
          </ul>
      </nav>
      
      { 
      
      //첫로드시 카드, 버튼 보여주기

      데이터[0] &&
        
      <div className="p-1 p-container" >
        { 데이터.map((a,i)=>
          <Profile className="profile" a={a} key={i} 현재카드번호={현재카드번호} step={step} 고른거={고른거} 고른거변경={고른거변경} 데이터={데이터}></Profile>
        )}
        <div className="bottom-buttons">
          <button onClick={()=>{
            if (데이터.length > 현재카드번호+1){
              set현재카드번호(현재카드번호+1); set뭐눌렀냐('dislike');
            } else {
              alert('유기견 없어 이제')
            }

            }} className="btn green"><i className="fas fa-times-circle fa-3x"></i></button>
          <button onClick={()=>{
            if (데이터.length > 현재카드번호+1){
            set현재카드번호(현재카드번호+1); set뭐눌렀냐('like');
            }else {
              alert('유기견 멸종')
            }
          
          }} className="btn red"><i className="fab fa-gratipay fa-3x"></i></button>
        </div>
      </div>
      
      
      }

      {
      //고르는거 끝났을 때
      데이터.length < 현재카드번호+2 
      ? (<h5 className="result">님이 입양할 친구들 : 

        { 고른거.map((data,i)=>{
          return <p className="m-1">{데이터[data].name}</p>
        }) }

      </h5>)

      : null
      }
    </div>
  );
}


export default App;
