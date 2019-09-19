import React from "react";

const Form = (props) => {
  return(
    props.loggedIn && !props.weatherLoaded ?(
    <form onSubmit = {props.loadWeather}>
      <p>Enter your current location</p>
      <div>
        <label>City:</label>
        <input name="text" name="city"/>
        <label>Country:</label>
        <input name="text" name="country"/>
      </div>
      <button>Get Weather</button>
    </form>):
   (<div></div>)
  )
}

export default Form;