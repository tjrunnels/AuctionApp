import { StatusBar } from 'expo-status-bar';
import *  as React from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import 'react-native-gesture-handler';


const Stack = createStackNavigator();



import Amplify from 'aws-amplify'
import config from './aws-exports'
import BidScreen from './BidScreen';
import HubScreen from './HubScreen';
import ProjectorScreen from './ProjectorScreen';
import Authentication from './Authentication';
Amplify.configure(config)



const App = () => {
  

  return (
    <NavigationContainer>
    <Stack.Navigator initialRouteName='Authentication'>
      <Stack.Screen
        name="HubScreen"
        component={HubScreen}
        options={{ title: 'Hub Screen' }}
      />
      <Stack.Screen
        name="BidScreen"
        component={BidScreen}
        options={{ title: 'Bidding Screen' }}
      />
      <Stack.Screen
        name="ProjectorScreen"
        component={ProjectorScreen}
        options={{ title: 'Projector Screen' }}
      />
      <Stack.Screen
        name="Authentication"
        component={Authentication}
        options={{ title: 'Sign In or Sign Up!' }}
      />

    </Stack.Navigator>
  </NavigationContainer>
  )

}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  message: {  marginBottom: 15 },
  input: { height: 50, backgroundColor: '#ddd', marginBottom: 10, padding: 8 },
  preButtonsText: {color: '#000', fontSize: 25, textAlign: "left", fontWeight: 'bold', padding: 10, marginBottom: 10},
  buttons: { height: 50, backgroundColor: '#6b8bd6', borderRadius:10 , padding: 10, marginBottom: 10, minWidth: 140},
  buttonsText: { color: '#fff', fontSize: 20, textAlign: "center", fontWeight: 'bold' },
  messageauthor: { fontSize: 12, color: '#a8a69e' },
  messageBody: {fontSize: 16, color: '#fff',  borderRadius: 45, padding:8},
  bodyHolder: {borderRadius:10, backgroundColor: '#6b8bd6'}
})

export default App
