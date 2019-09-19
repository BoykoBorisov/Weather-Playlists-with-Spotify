import adjustmentWeight from './adjustmentWeight';
import axios from 'axios';
import React from 'react';
import Title from './title';
import Form from './form';
import Weather from './weather';
import PlaylistDisplayer from './PlaylistDisplayer';
import SpotifyBody from './SpotifyBody';
import scoreCoefficients from './scoreCoefficients';
import Feedback from './Feedback';

import SpotifyWebApi from 'spotify-web-api-js';
//import { log } from 'util';

var fs = require('browserify-fs');
const request = require('request');
const spotifyApi = new SpotifyWebApi();

class App extends React.Component {
  
  
  constructor(){
    super();
    var songs = [];
    this.state =
    {
      time: new Date().getHours(),
      temperature: undefined,
      city: undefined,
      country: undefined,
      humidity: undefined,
      description: undefined,
      error: undefined,
      token: undefined,
      weatherLoaded: false,
      client_id :'8c7942e0d9d6449a912c7c3eabce7357', // Your client id
      client_secret : '2700e40c75d24cdfb8e26a5489f2b0f5',
      songs : [],
      playlistLoaded : false,
      feedback : {tempo : 0, 
                  mood : 0},
      feedbackProvided: false};

      /*TO CHECK IF LOGGED INTO SPOTIFY*/
      var query = window.location.search;
      var searchQuery = new URLSearchParams(query);
      var accessToken = searchQuery.get("access_token");
      if(accessToken){
        spotifyApi.setAccessToken(accessToken);
        var refreshToken = searchQuery.get("refresh_token");
        var refresh_seconds = searchQuery.get("expires_in");
        this.state.loggedIn = true;
        this.state.accessToken = accessToken;
        this.state.refreshToken = refreshToken;
        this.state.tokenExpiresIn = refresh_seconds; 
        
        /*IF LOGGED IN GET THE TOP SONGS AND SAVE THEM IN AN ARRAY*/
        spotifyApi.getMyTopArtists().then(function(result)
        {     
          var artist;
          // track
          for(artist of result.items)
          {
            spotifyApi.getArtistTopTracks(artist.id, "GB")
            .then(function(result1)
            { 
              for(var track of result1.tracks)
              {
                if(songs.indexOf(track.id) < 0)            
                  songs.push(track.id)
              }
            })        
          }
        })
        spotifyApi.getMyTopTracks().then((result) =>
        {
          for(var track of result.items)
          {
            if(songs.indexOf(track.id) < 0)            
              songs.push(track.id)
          }
        })
        setTimeout(this.refresh(),this.state.tokenExpiresIn * 1000);        
      }else{
        this.state.loggedIn = false;
      }
    this.state.songs = songs;
    this.generatePlaylist = this.generatePlaylist.bind(this);
    this.logIn = this.logIn.bind(this);
    this.calculateTrackScore = this.calculateTrackScore.bind(this);
    this.getFirstTwenty = this.getFirstTwenty.bind(this);
    this.feedbackAdjustment = this.feedbackAdjustment.bind(this);
  }

  feedbackAdjustment(event){
    this.setState({feedbackProvided : true});
    axios.post('http://localhost:8888/feedback', 
               {time: this.state.timeCode, weather: this.state.conditionCode,
               mood: event.target.elements.mood.value, tempo:event.target.elements.mood.value},
              (response) =>
              {
                console.log("Success");
                console.log(response);                
              });
    /*this.setState({feedback : {tempo : parseInt(event.target.elements.tempo.value), 
                                mood : parseInt(event.target.elements.mood.value)}})
  
    console.log(scoreCoefficients);
    var newTempo = scoreCoefficients[0][0][3] + this.state.feedback.tempo * adjustmentWeight;
    var newMood = scoreCoefficients[0][0][4] + this.state.feedback.mood * adjustmentWeight;
    var newAdjustmentWeight = adjustmentWeight * 0.90;
    var adjustmentWeightString = `module.exports = ${newAdjustmentWeight};`;
    console.log(adjustmentWeightString);
    
    fs.writeFile('/adjustmentWeight.js', adjustmentWeightString, (err) =>{
      if (err)
      console.log(err);
      else
      console.log("Adjustment weight changed");     
    })
    //var changedSubArray = scoreCoefficients[this.state.timeCode][this.state.conditionCode];
    scoreCoefficients[0][0].splice(3, 2, newTempo, newMood);
    var scoreCoefficientsString = "[";
    for(var OuterArray of scoreCoefficients)
    { scoreCoefficientsString += "[";
      for(var innerArray of OuterArray)
        scoreCoefficientsString += `[ + ${innerArray.toString} + ],`
      scoreCoefficientsString = scoreCoefficientsString.slice(0,scoreCoefficientsString.length - 2) + "]";
    }
    scoreCoefficientsString +="]";
    console.log(scoreCoefficientsString);*/
  }

  refresh(){
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      headers: { 'Authorization': 'Basic ' + (new Buffer
        (this.state.client_id + ':' + this.state.client_secret).toString('base64'))},
      form: {
        grant_type: 'refresh_token',
        refresh_token: this.state.refresh_token
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {
          var access_token = response.body.access_token;
          this.state({
        '   access_token': access_token
          });
      }
    });

  }

  generatePlaylist =async(e) =>{
    /*Store audio features in trackInfo, the info is pulled in 4 calls
     because of api data limit*/
    var trackInfo = [];
    var top20Tracks;
    spotifyApi.getAudioFeaturesForTracks(this.state.songs.slice(0,50))
    .then(trackFeatures => {
      for(var trackFeature of trackFeatures.audio_features)
        trackInfo.push(trackFeature);
    })
    spotifyApi.getAudioFeaturesForTracks(this.state.songs.slice(50,100))
    .then(trackFeatures => {
      for(var trackFeature of trackFeatures.audio_features)
       trackInfo.push(trackFeature);
    })
    spotifyApi.getAudioFeaturesForTracks(this.state.songs.slice(100,150))
    .then(trackFeatures => {
      for(var trackFeature of trackFeatures.audio_features)
        trackInfo.push(trackFeature);
    })
    spotifyApi.getAudioFeaturesForTracks(this.state.songs.slice(150,200))
    .then(trackFeatures => {
      for(var trackFeature of trackFeatures.audio_features)
        trackInfo.push(trackFeature);
    })
    .then(() =>
    {
      var trackScore = this.calculateTrackScore(trackInfo);
      top20Tracks = this.getFirstTwenty(trackScore, trackInfo);      
    })
    .then(()=>{
    var top20TracksURI = [];

    for(var track of top20Tracks)
    {
      top20TracksURI.push(`spotify:track:${track}`);
    }
    spotifyApi.getMe().then((user)=>
    {
      var playlistId;
      spotifyApi.getUserPlaylists(user.id).then(playlists => 
      {
        var zeroTonNineteenArray = [];
        for(var i = 0; i < 20; i++)
          zeroTonNineteenArray.push(i);
        var existent = false;
        for(var playlist of playlists.items)
        { 
          if(playlist.name  === `${this.state.description} weather playlist`)
          {
            playlistId = playlist.id;
            if(playlist.tracks.total > 0)
            {
              spotifyApi.removeTracksFromPlaylistInPositions(playlist.id, zeroTonNineteenArray, playlist.snapshot_id);
            }
            existent = true;
          }
        }
        if(!existent)
          spotifyApi.createPlaylist(user.id, {name : `${this.state.description} weather playlist`,
                                             },
          (err, result) =>
          {
            console.log(top20TracksURI);
            
            playlistId = result.id;
            spotifyApi.addTracksToPlaylist(playlistId,top20TracksURI);
          })
        else{
          spotifyApi.addTracksToPlaylist(playlistId,top20TracksURI);
        }  
      })
    });
  })
  this.setState({playlistLoaded : true,
                feedbackProvided : false});
  }

  calculateTrackScore(trackInfo) 
  {
    var trackScore = []
    var score;
    var track;
    /*Makes the weather conditions id to match the array index*/
    var weatherConditions = this.state.weatherId < 500 ? 
                            Math.floor(this.state.weatherId/100) -2 : 
                            this.state.weatherId < 800 ?
                            Math.floor(this.state.weatherId/100) - 3: 
                            this.state.weatherId === 800 ? 5 : 6;
    /*Four time periods - 0  - 5  as 0
                          6  - 11 as 1
                          12 - 18 as 2
                          19 - 23 as 3*/
    var time = this.state.time < 5 ? 0 : 
                                    (this.state.time < 12 ? 1 :
                                                           (this.state.time < 19 ? 2 : 3));
  
    this.setState({conditionCode : weatherConditions,
                    timeCode : time})
    for(track of trackInfo)
    {
      if(weatherConditions === 0 || weatherConditions === 3 || weatherConditions === 5)
        score = track.mode === 0 ? 0 : 10;
      else
        score = track.mode === 1 ? 0 : 10;
      var coefficients = scoreCoefficients[time][weatherConditions];
      score += coefficients[0] * track.acousticness + coefficients[2] * track.danceability
              + coefficients[3] * track.energy + coefficients[4] * track.valence;      
      trackScore.push(score);
    }
    return trackScore;
  }

  getFirstTwenty(trackScore, trackInfo)
  {
    var idsOfTop20Tracks = [];
    console.log(trackScore);
    
    var trackScoreCopy = trackScore.slice();
    var firstTwentyScores = (trackScore.sort((a,b) => a - b)).slice(trackScore.length - 20, trackScore.length);
    
    
    for(var score of firstTwentyScores)
    {
      idsOfTop20Tracks.push((trackInfo[trackScoreCopy.indexOf(score)].id));
    }
    return idsOfTop20Tracks;
  }

  logIn = async (e) =>{

    e.preventDefault();
    window.location.replace("http://localhost:8888/login");
  }  
  

  getWeather = async (e) => {

    e.preventDefault();

    var city = e.target.elements.city.value;
    var country = e.target.elements.country.value;
    var Api_Key = "7d71db68e0501217f6b066c1e2f09d88";


    const api_call = await fetch(`http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&units=metric&appid=${Api_Key}`);
    
    const response = await api_call.json();
    
    if(city && country){
      if(response.main){
        this.setState({
          weatherLoaded: true,
          temperature: response.main.temp,
          city: response.name,
          country: response.sys.country,
          humidity: response.main.humidity,
          description: response.weather[0].description,
          weatherId: response.weather[0].id,
          error: ""
        })
      }
      else{
        this.setState({
          error: "There is no such city in the database, please change the city or the coutry."
        })
      }
    }else{
      this.setState({
        error: "Please enter a city name and country"
      })
    }    
  }

  render(){
    return (
      <div>
        <Title setToken={this.setToken}/>
        <SpotifyBody 
          logIn={this.logIn}
          loggedIn={this.state.loggedIn} />
        
        <Form 
          loadWeather={this.getWeather}
          weatherLoaded={this.state.weatherLoaded}
          loggedIn={this.state.loggedIn}/>
        <Weather 
          temperature={this.state.temperature}
          city={this.state.city}
          country={this.state.country}
          humidity={this.state.humidity}
          description={this.state.description}
          error={this.state.error} />
        <PlaylistDisplayer
          generatePlaylist = {this.generatePlaylist}
          playlist = {this.state.paylist} 
          weatherLoaded = {this.state.weatherLoaded}
          playlistLoaded = {this.state.playlistLoaded}/>
        <Feedback 
          sendFeedback = {this.feedbackAdjustment}
          feedbackProvided = {this.state.feedbackProvided}
          playlistLoaded = {this.state.playlistLoaded}
          feedback = {this.state.feedback}/>
      </div> 
    )
  } 
}
export default App;
