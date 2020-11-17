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





const initialState = { author: '', body: '' }

const BidScreen = ({navigation}) => {
  let [formState, setFormState] = useState(initialState);
  let [messages, setMessagesLocal] = useState([]);

  let [topBid, setTopBid] = useState(0);

  useEffect(() => {

    const client = new AWSAppSyncClient({
        url: awsconfig.aws_appsync_graphqlEndpoint,
        region: awsconfig.aws_appsync_region,
        auth: {
          type: AUTH_TYPE.API_KEY, // or type: awsconfig.aws_appsync_authenticationType,
          apiKey: awsconfig.aws_appsync_apiKey,
        }
      });


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
      else
        localTopBid = 0;
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


  async function deleteMessages() {
    try {
      console.log("starting: deleteMEssages....")
      var i;
      for (i = messages.length - 1; i >= 0; i--)
      {
        let mID =  messages[i].id;
        await API.graphql(graphqlOperation(mutations.deleteMessage, {input: {id: mID}}))
      }
      console.log("worked i guesss....")
      fetchmessages();
    } catch (err) { console.log('error fetching messages') }
  }

  return (
  <View style={styles.container}>
    <View style={{height:300, marginBottom:20, backgroundColor: '#ddd'}}>
        <Text style={{fontSize: 40, fontWeight: "bold", textAlign: 'center'}}>Bid: {topBid}</Text>
        <Text style={{textAlign: 'center'}}>{messages.length}</Text>
      
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

        <TouchableOpacity style={styles.buttons} onPress={() => { deleteMessages() }}>
          <Text style={styles.buttonsText}>Delete All (just for testing)</Text>
        </TouchableOpacity>    
        
      </View>
   
  </View>
  )
  
};

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

export default BidScreen
