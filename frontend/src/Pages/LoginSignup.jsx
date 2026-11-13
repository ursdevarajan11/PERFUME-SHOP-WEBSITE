import React, { useState } from "react";
import "./CSS/LoginSignup.css";
import { getApiUrl } from "../config";

const LoginSignup = () => {
  const [state, setState] = useState("Login");

  const [formData,setFormData]=useState({
    username:"",
    password:"",
    email:""
  })
  const changeHandler=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }

  const login=async ()=>{
    try {
      const response = await fetch(getApiUrl('/login'),{
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData),
      });
      const responseData = await response.json();
      if(response.ok && responseData.success){
        window.location.replace("/");
      } else {
        alert(responseData.errors || "Login failed.");
      }
    } catch (error) {
      console.error("Login request failed:", error);
      alert("Unable to reach the server. Please try again.");
    }
  }
  const signup=async ()=>{
    try {
      const response = await fetch(getApiUrl('/signup'),{
        method:'POST',
        credentials:'include',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(formData),
      });
      const responseData = await response.json();
      if(response.ok && responseData.success){
        window.location.replace("/");
      } else {
        alert(responseData.errors || "Registration failed.");
      }
    } catch (error) {
      console.error("Registration request failed:", error);
      alert("Unable to reach the server. Please try again.");
    }
  }

  return (
    <div className="loginsignup">
      <div className="loginsignup-container glass">
        <h1>{state}</h1>
        <div className="loginsignup-fields">
          {state === "Sign Up" ? (
            <input name="username" value={formData.username} onChange={changeHandler} type="text" placeholder="Your Name" />
          ) : (
            <></>
          )}
          <input name="email" value={formData.email} onChange={changeHandler} type="email" placeholder="Email Address" />
          <input name="password" value={formData.password} onChange={changeHandler} type="password" placeholder="Password" />
        </div>
        <button onClick={()=>{state==="Login"?login():signup()}}>Continue</button>
        {state === "Sign Up" ? (
          <p className="loginsignup-login">
            Already have an account? <span onClick={()=>{setState("Login")}}>Login Here</span>
          </p>
        ) : (
          <p className="loginsignup-login">
            Create an account? <span onClick={()=>{setState("Sign Up")}}>Click Here</span>
          </p>
        )}

        <div className="loginsignup-agree">
          <input type="checkbox" name="" id="" />
          <p>By Continuing, I agree to the terms of use & privacy policy</p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
