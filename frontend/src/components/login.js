import React, { useState } from 'react';

import PropTypes from "prop-types";

export default function LoginPopUp({showPopUp, onSubmitLogin, onSubmitSignUp}){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showLogin, setShowLogin] = useState(true);

  if (!showPopUp) {return null}
  return (
    <div className="LoginPopUp" >
        <div className="LoginPopUpTitle">{showLogin?("Login"):("Sign Up")}</div>
        {!showLogin&&
          <textarea value={name} onChange={(e) => setName(e.target.value)} className="NameInputBox" placeholder="Enter Name"></textarea>
        }
        <textarea value={email} onChange={(e) => setEmail(e.target.value)} className="EmailInputBox" placeholder="Enter Email"></textarea>
        <input type="password"  value={password} onChange={(e) => setPassword(e.target.value)} className="PasswordInputBox" placeholder="Enter Password"></input>
        
        
        <button className="LoginPopUpSubmit"onClick={showLogin?() =>onSubmitLogin(email, password):() =>onSubmitSignUp(name,email, password)}>Submit</button>
        <button className="Sign Up" onClick={()=>setShowLogin(!showLogin)}>{!showLogin?("Login"):("Sign Up")}</button>
    </div>
  );
};



LoginPopUp.propTypes = {
  showPopUp: PropTypes.bool.isRequired,
  showLogin: PropTypes.bool.isRequired,
  onSubmitLogin: PropTypes.func.isRequired,
  onSubmitSignUp: PropTypes.func.isRequired,
};