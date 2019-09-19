import React from "react";

const SpotifyBody = (props) =>{
  return(
    <div>
      {props.loggedIn ? (
        <p>You are logged into Spotify</p>
        ) :(<button onClick={props.logIn}>
                <p class="btn btn-primary">Log in with Spotify</p>
            </button>
        )}
    </div>
  )
}
export default SpotifyBody;