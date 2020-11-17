import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {Authenticator} from 'aws-amplify-react-native'

export default class Authentication extends React.Component {
  render() {
    return (
        <Authenticator usernameAttributes="username" signUpConfig={signUpConfig}/>
    );
  }
}

const signUpConfig = {
    hideAllDefaults: true,
    signUpFields: [
      {
        label: 'Username',
        key: 'username',
        required: true,
        displayOrder: 1,
        type: 'string',
      },
      {
        label: 'Phone Number',
        key: 'phone_number',
        required: true,
        displayOrder: 2,
        type: 'string',
      },  
      {
        label: 'Password',
        key: 'password',
        required: true,
        displayOrder: 3,
        type: 'password',
      },
    ],
  }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
