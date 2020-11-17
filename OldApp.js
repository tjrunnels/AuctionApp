import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState }  from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity} from 'react-native';

import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

import { API, graphqlOperation } from 'aws-amplify'
import * as queries from './src/graphql/queries';
import * as mutations from './src/graphql/mutations';
import * as subscriptions from './src/graphql/subscriptions';

import gql from 'graphql-tag';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from './aws-exports';

const client = new AWSAppSyncClient({
  url: awsconfig.aws_appsync_graphqlEndpoint,
  region: awsconfig.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.API_KEY, // or type: awsconfig.aws_appsync_authenticationType,
    apiKey: awsconfig.aws_appsync_apiKey,
  }
});



const initialState = { author: '', body: '' }

const App = () => {
  let [formState, setFormState] = useState(initialState);
  let [messages, setMessagesLocal] = useState([]);

  let [topBid, setTopBid] = useState(0);

  useEffect(() => {
    console.log("useEffect for [] running... note: should happen just once")
    fetchmessages();
    const observable = client.subscribe({ query: gql(subscriptions.onCreateMessage)})
        .subscribe({      
        next: data => {
          console.log("subscription:next running...")
          fetchmessages();
        },
        error: error => {
          console.warn(error);
        }
      });
  }, [])

  //when messages changes
  useEffect(() => {
    console.log("useEffect for messages running...")
    try{
      console.log("messages length:", messages.length);

      //establish a local variable that can quickly change
      var localTopBid = topBid; 

      //if messages loaded correctly
      if(messages.length != 0){ 
        messages.forEach((item, index) => {
          console.log("evaluating bid: ", item.bid, typeof item.bid, ' > ', topBid, typeof topBid, '(technically...', localTopBid)
          //if the bid is not null, compare to max
          if(item.bid != null && item.bid > localTopBid){
            console.log("increaseing topBid to: ", item.bid)
            localTopBid = item.bid
          }
        }) ;
      }
      //after running through all messages, localTopBid should be the max 
      setTopBid(localTopBid);
    } catch (err){ console.log('error finding and setting top bid') }
  }, [messages]);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchmessages() {
    try {
      const messageData = await API.graphql(graphqlOperation(queries.listMessages))
      const initial_messages = messageData.data.listMessages.items;
      setMessagesLocal(initial_messages); 
      
    } catch (err) { console.log('error fetching messages') }
  }
  

  async function addMessageClient() {
    try {
      const message = { ...formState }
      setMessagesLocal([...messages, message])
      setFormState(initialState)
      console.log("add: ",message);
      await API.graphql(graphqlOperation(mutations.createMessage, {input: message}))
    } catch (err) {
      console.log('error creating message:', err)
    }
  }

  async function addMessageClientC(_author, _body, _bid) {
    try {
      let message = {};
      message.bid = _bid == null? null :  _bid;
      message.author = _author == null? null : _author;
      message.body = _body == null? null : _body;

      setMessagesLocal([...messages, message])
      console.log("add: ",message);
      await API.graphql(graphqlOperation(mutations.createMessage, {input: message}))
    } catch (err) {
      console.log('error creating message (custom):', err)
    }
  }

  return (
  <View style={styles.container}>
    <View style={{height:300, marginBottom:20, backgroundColor: '#ddd'}}>
        <Text style={{fontSize: 40, fontWeight: "bold", textAlign: 'center'}}>Bid: {topBid}</Text>
        <Text style={{textAlign: 'center'}}>{messages.length}</Text>
        {/* 
        <ScrollView >
          {
            messages.map((message, index) => (
              <View key={message.id ? message.id : index} style={styles.message}>
                <Text style={styles.messageauthor}>{message.author}: {message.id}</Text>
                <View style={styles.bodyHolder}>
                  <Text style={styles.messageBody}>{message.body}</Text>
                </View>
              </View>
            ))
          }
        </ScrollView> */}
    </View>

    <View> 
        <View style={{flexDirection: "row"}}>
          <Text style={styles.preButtonsText}>Increase by 05:</Text>
          <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 5)); }}>
            <Text style={styles.buttonsText}>Bid {topBid + 5}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: "row"}}>
          <Text style={styles.preButtonsText}>Increase by 10:</Text>
          <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 10)); }}>
          <Text style={styles.buttonsText}>Bid {topBid + 10}</Text>
        </TouchableOpacity> 
        </View>
        <View style={{flexDirection: "row"}}>
          <Text style={styles.preButtonsText}>Increase by 20:</Text>
          <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 20)); }}>
            <Text style={styles.buttonsText}>Bid {topBid + 20}</Text>
          </TouchableOpacity>  
        </View>
        
        
        <TouchableOpacity style={styles.buttons} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 69)); }}>
          <Text style={styles.buttonsText}>Custom:{'\t'}*not scripted yet*</Text>
        </TouchableOpacity>    
      </View>
   
  </View>
  )
  //#region [oldreturn]
  const oldreturn = (
    
    <View style={styles.container}>
      <View style={{height:380, marginBottom:20}}>
      <Text style={{fontSize: 20, fontWeight: "bold"}}>Bid: {topBid}</Text>
      <ScrollView >
      {
        messages.map((message, index) => (
          <View key={message.id ? message.id : index} style={styles.message}>
            <Text style={styles.messageauthor}>{message.author}: {message.id}</Text>
            <View style={styles.bodyHolder}>
              <Text style={styles.messageBody}>{message.body}</Text>
            </View>
          </View>
        ))
      }
      </ScrollView>
      </View>
      <TextInput
        onChangeText={val => setInput('author', val)}
        style={styles.input}
        value={formState.author} 
        placeholder="author"
      />
      <TextInput
        onChangeText={val => setInput('body', val)}
        style={styles.input}
        value={formState.body}
        placeholder="body"
      />
      <Button title="Create message" onPress={addMessageClient} />
      <View style={{flexDirection: "row"}}>
        <Button  title="Bid 10" onPress={() => { addMessageClientC('tomSystem','*bid*',10); }} />
        <Button title="Bid 25" onPress={() => { addMessageClientC('tomSystem','*bid*',25); }} />
        <Button title="Bid 50" onPress={() => { addMessageClientC('tomSystem','*bid*',50); }} />
        <Button title={"Bid ".concat(topBid +5)} onPress={() => { addMessageClientC('tomSystem','*bid*',(topBid + 5)); }} />
      </View>

    </View>
  )
  //#endregion
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
