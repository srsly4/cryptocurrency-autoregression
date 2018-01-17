import React from 'react';
import Plotly from 'plotly.js/lib/core';

import './style.css';

export default class Tracking extends React.Component {


  initializeGraph() {

  }

  componentDidMount() {
    const time = new Date();

    const data = [{
      x: [time],
      y: [Math.random],
      mode: 'lines',
      line: {color: '#80CAF6'}
    }];

    const layout = {
      autosize: true,
    };

    Plotly.plot('mainGraph', data, layout);

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
        arData.y.push(Math.random());
        cursor.setSeconds(cursor.getSeconds()+1);
      }

      Plotly.addTraces('mainGraph', arData);

    };

    // const arInterval = setInterval(updateAR, 60000);
    // updateAR();

    const interval = setInterval(function() {

      let time = new Date();

      const update = {
        x:  [[time.valueOf()]],
        y: [[Math.random()]]
      };

      const olderTime = new Date(time);
      const futureTime = new Date(time);
      futureTime.setMinutes(time.getMinutes() + 1);
      olderTime.setMinutes(time.getMinutes() - 1);


      const minuteView = {
        xaxis: {
          type: 'date',
          range: [olderTime.valueOf(),futureTime.valueOf()],
          fixedrange: true,
          autorange: false,
        }
      };

      Plotly.relayout('mainGraph', minuteView);
      Plotly.extendTraces('mainGraph', update, [0]);

    }, 1000);
  }

  render() {
    return (<div>
      <div id="mainGraph"></div>
    </div>)
  }

}