import React from "react";


const Feedback = (props) =>{
  return(
        ((props.playlistLoaded && !props.feedbackProvided) ? (
          <div>
            <form onSubmit = {props.sendFeedback}>
              <p>Help us improve our service</p>
              <label>Speed of the tracks:</label>
              <div class = "row">
                <div class = "col">Too fast?</div>
                <div class = "col-6"><input type="range" name="tempo" min="-2" max="2"/></div>
                <div class = "col">Too slow?</div>
              </div>
              <label>Mood of the tracks:</label>
              <div class = "row">
                <div class = "col">Too Happy?</div>
                <div class = "col-6"><input type="range" name="mood" min="-2" max="2"/></div>
                <div class = "col">Too Sad?</div>
              </div>
              <button type="submit">Submit feedback</button>
            </form>
          </div>
          ):(<div></div>)
        )
  )
}

export default Feedback;