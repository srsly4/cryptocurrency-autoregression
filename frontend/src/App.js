import React, { Component } from 'react';
import 'semantic-ui-css/semantic.min.css';

import './App.css';
import {Container, Grid, Image, Segment} from 'semantic-ui-react';
import StartTrackingForm from './components/StartTrackingForm';
import Tracking from './components/Tracking';
import ScaleChanger from './components/ScaleChanger/index';
import AutoForecastForm from './components/AutoForecastForm/index';

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
      autoForecastTime: 10,
      autoForecastInterval: 5,
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

  onChangeAutoForecastTime(value) {
    this.setState({
      autoForecastTime: value,
    });
  }

  onChangeAutoForecastInterval(value) {
    this.setState({
      autoForecastInterval: value,
    });
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
                  <AutoForecastForm
                    autoForecastTime={this.state.autoForecastTime}
                    autoForecastInterval={this.state.autoForecastInterval}
                    onChangeAutoForecastInterval={this.onChangeAutoForecastInterval.bind(this)}
                    onChangeAutoForecastTime={this.onChangeAutoForecastTime.bind(this)}
                  />
                </Container>
              </Grid.Column>
              <Grid.Column width="12" className="content">
                {this.state.tracking ? (
                  <Tracking tracking={this.state.tracking}
                            timescale={this.state.timescale}
                            autoForecastInterval={this.state.autoForecastInterval}
                            autoForecastTime={this.state.autoForecastTime}
                  />) : (
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
