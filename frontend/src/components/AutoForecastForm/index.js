import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Form, FormField, Segment} from 'semantic-ui-react';


export default class AutoForecastForm extends React.Component {

  constructor(props){
    super(props);

    this.state = {
      autoForecastInterval: this.props.autoForecastInterval || 5,
      autoForecastTime: this.props.autoForecastTime || 10,
    }
  }

  static propTypes = {
    autoForecastInterval: PropTypes.number,
    autoForecastTime: PropTypes.number,
    onChangeAutoForecastInterval: PropTypes.func,
    onChangeAutoForecastTime: PropTypes.func,
  };

  static timeOptions = [
    {
      text: '1 minute',
      value: 1,
    },
    {
      text: '5 minutes',
      value: 5,
    },
    {
      text: '10 minutes',
      value: 10,
    },
    {
      text: '30 minutes',
      value: 30,
    },
    {
      text: '1 hour',
      value: 60,
    },
  ];

  onChangeAutoForecastIntervalProperty(value) {
    this.setState({ autoForecastInterval: value });
    if (typeof this.props.onChangeAutoForecastInterval === 'function') {
      this.props.onChangeAutoForecastInterval(value);
    }
  }
  onChangeAutoForecastTimeProperty(value) {
    this.setState({ autoForecastTime: value });
    if (typeof this.props.onChangeAutoForecastTime === 'function') {
      this.props.onChangeAutoForecastTime(value);
    }
  }

  render() {
    return (<Segment>
      <h2>Autoforecast options</h2>
      <Form>
        <FormField>
          <label>Forecast duration:</label>
          <Dropdown value={this.state.autoForecastTime} selection fluid options={AutoForecastForm.timeOptions}
                    onChange={(event, data) => this.onChangeAutoForecastTimeProperty(data.value)}
          />
        </FormField>
        <FormField>
          <label>Forecast interval:</label>
          <Dropdown value={this.state.autoForecastInterval} selection fluid options={AutoForecastForm.timeOptions}
                    onChange={(event, data) => this.onChangeAutoForecastIntervalProperty(data.value)}
          />
        </FormField>
      </Form>
    </Segment>)
  }

}