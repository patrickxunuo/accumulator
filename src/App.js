import './App.css';
import React, {useState, useEffect} from 'react'
import firebaseConfig from "./components/firebaseConfig";
import CreateTask from "./components/CreateTask"
import Home from "./components/Home"
import firebase from 'firebase'
import {BrowserRouter as Switch, Route, Link, useLocation} from "react-router-dom"


function App() {

    return (
        <div className="App">
            <Switch>
                <Route exact path='/'>
                    <CreateTask/>
                </Route>
                <Route path='/home/:appid'>
                    <Home/>
                </Route>
            </Switch>
        </div>
    );
}

export default App;
