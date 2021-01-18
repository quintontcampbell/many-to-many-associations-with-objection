import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom"

import ClubsListPage from "./ClubsListPage.js"
import ClubShowPage from "./ClubShowPage.js"

import { hot } from "react-hot-loader/root";

import "../assets/scss/main.scss";

const App = props => {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/" component={ClubsListPage} />
        <Route exact path="/clubs" component={ClubsListPage} />
        <Route exact path="/clubs/:id" component={ClubShowPage} />
      </Switch>
    </BrowserRouter>
  )
}

export default hot(App);
