import React, { Component } from 'react';
import logo from './logo.svg';
import 'semantic-ui-css/semantic.min.css';

import './App.css';
import {Container, Grid, Message, Segment} from 'semantic-ui-react';
import StartTrackingForm from './components/StartTrackingForm';
import Tracking from './components/Tracking';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tracking: true,
    };
  }

  render() {
    return (
      <div className="App">
        <div className="top-bar-container">

        </div>
        <div className="fluid-container">
          <Container fluid={true}>
            <Grid stretched={true} className="main-grid">
              <Grid.Column floated="left" width="4" className="sidebar">

              </Grid.Column>
              <Grid.Column width="12" className="content">
                {this.state.tracking ? (
                  <Tracking></Tracking>) : (
                   <Grid centered={true} stretched={true}>
                     <Grid.Column width="4" mobile="8"
                                  verticalAlign="middle" stretched={false}>
                      <StartTrackingForm/>
                     </Grid.Column>
                   </Grid>
                 )}
              </Grid.Column>
            </Grid>
          </Container>
        </div>
      </div>
    );
  }
}

export default App;
