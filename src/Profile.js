import { useEffect, useState } from 'react';


function Profile(props) {

console.log("props "+JSON.stringify(props.a) );
  return (
    <div
      //onMouseDown={(e)=>{ 마우스다운(e) }}  
      //onMouseUp={(e)=>{ 마우스업(e) }}  
      //onMouseMove={(e) => { 마우스무브(e) }}
      //style={{transform : `translateX(${이동거리}px) translateY(${-이동거리/10}px) rotate(${-이동거리/20}deg)` }}
      id={props.a.id}
      className={`card text-white ` 
      + ( props.a.passed == true?' move-'+props.a.liked :'')
      }
      style={ props.a.passed === true 
        ?{zIndex: (props.데이터.length - props.a.id) }
        :{zIndex: (props.데이터.length - props.a.id) }
      }
      
      >
      <img draggable="false" src={props.a.img != undefined ? props.a.img :'https://placeimg.com/500/500/animals'} className="card-img" alt="..." />
      <div className="card-img-overlay text-left">
        <h5 className="card-title">{props.a.name}, {props.a.age}세</h5>
        <h5 className="card-text">
          { props.a.things.map((item,i)=>{
            return <span key={i} className="badge badge-pill">{item}</span>
          }) }
          
        </h5>
        <p className="card-text">Last updated {props.a.days} days ago</p>
      </div>
    </div>
  )
}




export default Profile;
