import React from "react";

const PlaylistDisplayer = (props) =>{
  return(
    <div>
    {props.weatherLoaded ? (
      <div>
        <button onClick = {props.generatePlaylist}>Generate playlist</button>
        <p>{props.playlist}</p>
      </div>) :(<div></div>)}
    {props.playlistLoaded ? (<div><p>The playlist was generated</p>
    </div>):(<div></div>)}
    </div>
  )

}
export default PlaylistDisplayer;