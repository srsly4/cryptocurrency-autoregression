import React from 'react';
import PropTypes from 'prop-types';
import {Button, Divider, Dropdown, Form, FormField, Icon, Input, Label, Segment} from 'semantic-ui-react';


export default class StartTrackingForm extends React.Component {
  static propTypes = {
    onCreateTracking: PropTypes.func,
  };

  constructor(props) {
    super(props);

    this.state = {
      currency: 'BTC',
      outputCurrency: 'USD',
      serverUrl: 'ws://127.0.0.1:9001/',
    };
  }

  static Currencies = [
    {
      text: 'Bitcoin',
      value: 'BTC',
    },
    {
      text: 'Ethereum',
      value: 'ETH',
    },
    {
      text: 'Monero',
      value: 'XMR',
    }
  ];

  static OutputCurrencies = [
    {
      text: 'USD',
      value: 'USD'
    },
    {
      text: 'Polski zloty (PLN)',
      value: 'PLN',
    },
    {
      text: 'Bitcoin (BTC)',
      value: 'BTC',
    },
  ];

  onCreateClick() {
    console.log(this.state);
    if (this.state.currency && this.state.outputCurrency && this.state.serverUrl){
      const tracking = {
        currency: this.state.currency,
        outputCurrency: this.state.outputCurrency,
        serverUrl: this.state.serverUrl,
      };
      this.setState({
        currency: null,
        outputCurrency: null,
        serverUrl: null,
      });
      if (typeof this.props.onCreateTracking === 'function') {
        this.props.onCreateTracking(tracking);
      }
    }
  }

  onChangeStateValue(property, value) {
    const stateChange = {};
    stateChange[property] = value;
    this.setState(stateChange);
  }

  render() {
    return (<Segment raised={true}>
      <h2>Create currency tracking</h2>
      <Form>
        <FormField>
          <Dropdown fluid selection placeholder="Select currency to track" options={StartTrackingForm.Currencies}
                    value={this.state.currency}
                    onChange={(event, data) => this.onChangeStateValue('currency', data.value)}
          />
        </FormField>
        <FormField>
          <Dropdown fluid selection placeholder="Select output currency" options={StartTrackingForm.OutputCurrencies}
                    value={this.state.outputCurrency}
                    onChange={(event, data) => this.onChangeStateValue('outputCurrency', data.value)}
          />
        </FormField>
        <FormField>
          <Input type="text" label="Server URL" value={this.state.serverUrl}
            onChange={(event, data) => { this.onChangeStateValue('serverUrl', data.value)}}
          />
        </FormField>
      </Form>
      <Divider />
      <Button animated onClick={this.onCreateClick.bind(this)}>
        <Button.Content visible>Create</Button.Content>
        <Button.Content hidden>
          <Icon name='right arrow' />
        </Button.Content>
      </Button>
    </Segment>);
  }
};