import React from 'react';
import PropTypes from 'prop-types';
import {Dropdown, Form, FormField} from 'semantic-ui-react';


export default class ScaleChanger extends React.Component {

  static propTypes = {
    onChange: PropTypes.func,
  };

  static scaleOptions = [
    {
      text: '1 minute',
      value: 1
    },
    {
      text: '5 minutes',
      value: 5,
    },
    {
      text: '15 minutes',
      value: 15,
    },
    {
      text: '30 minutes',
      value: 30,
    },
    {
      text: '1 hour',
      value: 60,
    },
    {
      text: '1 day',
      value: 60*24,
    }
  ];

  onChange(event, data) {
    if (typeof this.props.onChange === 'function') {
      this.props.onChange(data.value);
    }
  }

  render() {
    return (<div>
      <Form>
        <FormField>
          <label>Chart scale</label>
          <Dropdown selection fluid
                    defaultValue={5} options={ScaleChanger.scaleOptions}
                    onChange={this.onChange.bind(this)} />
        </FormField>
      </Form>
    </div>)
  }

}