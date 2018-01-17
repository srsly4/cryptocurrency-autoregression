import React from 'react';
import PropTypes from 'prop-types';
import {Button, Divider, Dropdown, Icon, Segment} from 'semantic-ui-react';


export default class StartTrackingForm extends React.Component {
  static propTypes = {

  };

  static Currencies = [
    {
      text: 'Bitcoin',
      value: 'BTC',
    },
    {
      text: 'Monero',
      value: 'XMR',
    }
  ];

  render() {
    return (<Segment raised={true}>
      <h2>Create currency tracking</h2>
        <Dropdown fluid selection placeholder="Select currency" options={StartTrackingForm.Currencies}/>
      <Divider />
      <Button animated>
        <Button.Content visible>Create</Button.Content>
        <Button.Content hidden>
          <Icon name='right arrow' />
        </Button.Content>
      </Button>
    </Segment>);
  }
};