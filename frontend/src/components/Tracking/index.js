import React from 'react';
import PropTypes from 'prop-types';
import Plotly from 'plotly.js/lib/core';

import {Container, Dimmer, Header, Icon} from 'semantic-ui-react';

import './style.css';

export default class Tracking extends React.Component {

  constructor(props) {
    super(props);

    this.graphId = 'mainGraph';

    this.state = {
      socket: null,
      initialDataLoaded: false,
    }
  }

  static DEFAULT_SCALE = 5;

  static propTypes = {
    tracking: PropTypes.object,
    timescale: PropTypes.number,
  };


  rescaleGraph(relativeTime, forceScale) {
    const time = relativeTime || new Date();

    const olderTime = new Date(time);
    const futureTime = new Date(time);
    futureTime.setMinutes(time.getMinutes() + (forceScale || this.props.timescale || Tracking.DEFAULT_SCALE));
    olderTime.setMinutes(time.getMinutes() - (forceScale || this.props.timescale || Tracking.DEFAULT_SCALE));

    const minuteView = {
      xaxis: {
        type: 'date',
        range: [olderTime.valueOf(),futureTime.valueOf()],
        fixedrange: true,
        autorange: false,
      }
    };

    Plotly.relayout(this.graphId, minuteView);
  }

  initializeGraph() {

  }

  setInitialCurrencyState(packet) {
    const prepend = {
      x: [(packet.data || []).map(item => item.time*1000)],
      y: [(packet.data || []).map(item => item.close)],
    };

    this.rescaleGraph();
    Plotly.prependTraces(this.graphId, prepend, [0]);
    this.setState({ initialDataLoaded: true });
  }

  updateCurrency(packet) {
    let time = new Date(packet.timestamp*1000);

    const update = {
      x:  [[time.valueOf()]],
      y: [[packet.data[this.props.tracking.outputCurrency]]]
    };

    this.rescaleGraph(time);

    Plotly.extendTraces(this.graphId, update, [0]);
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.timescale === 'number' && nextProps.timescale !== this.props.timescale) {
      this.rescaleGraph(null, nextProps.timescale);
    }
  }

  componentDidMount() {
    const data = [{
      x: [],
      y: [],
      mode: 'lines',
      line: {color: '#80CAF6'}
    }];

    const layout = {
      autosize: true,
    };

    Plotly.plot(this.graphId, data, layout);

    const socket = new WebSocket(this.props.tracking.serverUrl);
    this.setState({ socket });
    socket.onopen = () => {
      console.log('Socket opened');
      socket.send(JSON.stringify({
        type: 'REQUEST_CURRENCY',
        records: 1440, // 24h
        currency: this.props.tracking.currency,
        outputCurrency: this.props.tracking.outputCurrency,
      }));

      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + 10);

      socket.send(JSON.stringify({
        type: 'REQUEST_FORECAST',
        startTimestamp: Math.round(startDate.valueOf()/1000),
        endTimestamp: Math.round(endDate.valueOf()/1000)
      }));

    };
    socket.onmessage = (msg) => {
      if (msg.data && typeof msg.data === 'string') {
        const packet = JSON.parse(msg.data);
        if (packet.type === 'UPDATE') {
          this.updateCurrency(packet);
        }
        if (packet.type === 'INITIAL_STATE') {
          this.setInitialCurrencyState(packet);
        }
      }

    };


    this.setState({ socket });

    const updateAR = () => {
      const arData = {
        x: [],
        y: [],
        mode: 'lines',
        line: { color: '#EFDD00' }
      };

      let cursor = new Date();

      for (let i = 0; i < 60; i++) {
        arData.x.push(cursor.valueOf());
        arData.y.push(9500 + 1000*Math.random());
        cursor.setSeconds(cursor.getSeconds()+1);
      }

      Plotly.addTraces(this.graphId, arData);

    };

    const arInterval = setInterval(updateAR, 60000);
    updateAR();

    // const interval = setInterval(function() {
    //
    //   let time = new Date();
    //
    //   const update = {
    //     x:  [[time.valueOf()]],
    //     y: [[Math.random()]]
    //   };
    //
    //   const olderTime = new Date(time);
    //   const futureTime = new Date(time);
    //   futureTime.setMinutes(time.getMinutes() + 1);
    //   olderTime.setMinutes(time.getMinutes() - 1);
    //
    //
    //   const minuteView = {
    //     xaxis: {
    //       type: 'date',
    //       range: [olderTime.valueOf(),futureTime.valueOf()],
    //       fixedrange: true,
    //       autorange: false,
    //     }
    //   };
    //
    //   Plotly.relayout('mainGraph', minuteView);
    //   Plotly.extendTraces('mainGraph', update, [0]);
    //
    // }, 1000);
  }

  render() {
    return (<div>
      <Dimmer
        active={!this.state.initialDataLoaded}
        page
      >
        <Header as='h2' icon inverted>
          <Icon name='spinner' />
          Loading data
          <Header.Subheader>Just wait for a second</Header.Subheader>
        </Header>
      </Dimmer>
      <div id="mainGraph"/>
    </div>)
  }

}