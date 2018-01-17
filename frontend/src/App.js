import React, { Component } from 'react';
import logo from './logo.svg';
import 'semantic-ui-css/semantic.min.css';

import './App.css';
import {Container, Grid, Image, Message, Segment} from 'semantic-ui-react';
import StartTrackingForm from './components/StartTrackingForm';
import Tracking from './components/Tracking';
import ScaleChanger from './components/ScaleChanger/index';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      // tracking: {
      //   currency: 'BTC',
      //   serverUrl: 'ws://127.0.0.1:9001/',
      //   outputCurrency: 'USD',
      // },
      tracking: null,
    };
  }

  onChangeTimeScale(value) {
    this.setState({
      timescale: value,
    });
  }

  onCreateTracking(tracking) {
    this.setState({ tracking });
  }

  render() {
    return (
      <div className="App">
        <div className="top-bar-container">
          <h1>Cryptocurrency autoregression live-model</h1>
        </div>
        <div className="fluid-container">
          <Container fluid={true}>
            <Grid stretched={true} className="main-grid">
              <Grid.Column floated="left" width="4" className="sidebar">
                <Container fluid={true}>
                  <Segment>
                    <h2>Chart options</h2>
                    <ScaleChanger onChange={this.onChangeTimeScale.bind(this)}/>
                  </Segment>
                </Container>
              </Grid.Column>
              <Grid.Column width="12" className="content">
                {this.state.tracking ? (
                  <Tracking tracking={this.state.tracking} timescale={this.state.timescale} />) : (
                   <Grid centered={true} stretched={true}>
                     <Grid.Column width="4" mobile="8"
                                  verticalAlign="middle" stretched={false}>
                      <StartTrackingForm onCreateTracking={this.onCreateTracking.bind(this)} />
                       <Segment>
                         <Image src="/extrapolating.png" centered className="xkcd-image" />
                       </Segment>
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
