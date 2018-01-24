import React from 'react';
import PropTypes from 'prop-types';
import Plotly from 'plotly.js/lib/core';

import {Dimmer, Header, Icon} from 'semantic-ui-react';

import './style.css';

export default class Tracking extends React.Component {

  constructor(props) {
    super(props);

    this.graphId = 'mainGraph';

    this.state = {
      socket: null,
      autoForecastTimer : null,
      autoForecastProcessing: false,
      lastAutoForecast: null,
      nextAutoForecast: null,
      initialDataLoaded: false,
    };

    this.currentColorIndex = 0;
  }

  static DEFAULT_SCALE = 5;
  static DEFAULT_AUTOFORECAST_TIME = 1;
  static DEFAULT_AUTOFORECAST_INTERVAL = 1;
  static FORECAST_COLORS = ['#4F77FF' , '#48E88C', '#FFF55C', '#E88448', '#A782FF'];
  static CURRENCY_COLOR = '#0C1447';

  static propTypes = {
    tracking: PropTypes.object,
    timescale: PropTypes.number,
    autoForecastTime: PropTypes.number,
    autoForecastInterval: PropTypes.number,
  };


  autoForecast() {
    if (!this.state.autoForecastTimer) {
      const timer = setInterval(this.autoForecast.bind(this), 1000);
      this.setState({
        autoForecastTimer: timer,
      });
      return;
    }


    if (!this.state.autoForecastProcessing && (!this.state.nextAutoForecast
      || this.state.nextAutoForecast.getTime() < Date.now())) {
      const startDate = this.state.nextAutoForecast ? new Date(this.state.nextAutoForecast) : new Date();
      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + (this.props.autoForecastTime || Tracking.DEFAULT_AUTOFORECAST_TIME));

      this.state.socket.send(JSON.stringify({
        type: 'REQUEST_FORECAST',
        startTimestamp: Math.round(startDate.valueOf()/1000),
        endTimestamp: Math.round(endDate.valueOf()/1000)
      }));

      const nextDate = new Date(startDate);
      nextDate.setMinutes(nextDate.getMinutes() + (this.props.autoForecastInterval || Tracking.DEFAULT_AUTOFORECAST_INTERVAL));

      this.setState({
        autoForecastProcessing: true,
        nextAutoForecast: nextDate,
      });
    }

  }

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
    const data = [{
      x: [],
      y: [],
      mode: 'lines',
      name: this.props.tracking.currency,
      line: {color: Tracking.CURRENCY_COLOR, width: 4 }
    }];

    const layout = {
      autosize: true,
      showlegend: false,
      yaxis: {
        title: this.props.tracking.outputCurrency,
      },
    };

    Plotly.plot(this.graphId, data, layout);
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

  drawForecast(packet) {
    this.setState({ lastAutoForecast: new Date(), autoForecastProcessing: false });
    const arData = {
      x: (packet.data.x || []).map(point => point*1000),
      y: packet.data.y || [],
      mode: 'lines',
      title: 'Forecast',
      name: `Forecast ${this.state.lastAutoForecast.toUTCString()}`,
      line: { color: Tracking.FORECAST_COLORS[this.currentColorIndex] }
    };

    Plotly.addTraces(this.graphId, arData);


    this.currentColorIndex += 1;
    if (this.currentColorIndex >= Tracking.FORECAST_COLORS.length) {
      this.currentColorIndex = 0;
    }
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

    if (nextProps.autoForecastInterval !== this.props.autoForecastInterval) {
      const startDate = this.state.lastAutoForecast ? new Date(this.state.lastAutoForecast) : new Date();
      const nextDate = new Date(startDate);
      nextDate.setMinutes(nextDate.getMinutes() + nextProps.autoForecastInterval);
      this.setState({ nextAutoForecast: nextDate });
    }
  }

  componentDidMount() {
    this.initializeGraph();

    const socket = new WebSocket(this.props.tracking.serverUrl);
    this.setState({ socket });
    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: 'REQUEST_CURRENCY',
        records: 1440, // 24h
        currency: this.props.tracking.currency,
        outputCurrency: this.props.tracking.outputCurrency,
      }));

      this.autoForecast();
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
        if (packet.type === 'FORECAST') {
          this.drawForecast(packet);
        }
      }

    };
    this.setState({ socket });
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