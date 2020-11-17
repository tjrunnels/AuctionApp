import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState }  from 'react';
import { StyleSheet, Text, View, Form, Button, TextInput, ScrollView, TouchableOpacity, Animated} from 'react-native';

import Amplify from 'aws-amplify'
import config from './aws-exports'
Amplify.configure(config)

import { API, graphqlOperation } from 'aws-amplify'
import * as queries from './src/graphql/queries';
import * as subscriptions from './src/graphql/subscriptions';

import gql from 'graphql-tag';
import AWSAppSyncClient, { AUTH_TYPE } from 'aws-appsync';
import awsconfig from './aws-exports';





const ProjectorScreen = ({navigation}) => {
  let [messages, setMessagesLocal] = useState([]);
  let [topBid, setTopBid] = useState(0);

  let [goal, setGoal] = useState(200);

  //for progress bar
  let [percent, setPercent] = useState();
  let animation = useRef(new Animated.Value(0));


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
      //after running through all messages, localTopBid should be the max 
      setTopBid(localTopBid);



    } catch (err){ console.log('error finding and setting top bid') }
  }, [messages]);


   useEffect(() => {
        //update Percent (and thus trigger the progress bar change and animation)
        let percentProgress = (topBid/goal)*100;
        setPercent(percentProgress);
  },[topBid])


  //for progress bar animation
  useEffect(() => {
    Animated.timing(animation.current, {
      toValue: percent,
      duration: 300
    }).start();
  },[percent])

  let pBarWidth = animation.current.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp"
  })




  async function fetchmessages() {
    try {
      const messageData = await API.graphql(graphqlOperation(queries.listMessages))
      const initial_messages = messageData.data.listMessages.items;
      setMessagesLocal(initial_messages); 
      
    } catch (err) { console.log('error fetching messages') }
  }
  


  
  return (
  <View style={styles.container}>
    <View style={{ marginBottom:20, backgroundColor: '#ddd'}}>
        <Text style={{fontSize: 140, fontWeight: "bold", textAlign: 'center'}}>Bid: {topBid}</Text>
        <Text style={{textAlign: 'center'}}>{messages.length}</Text>

      
    </View>
    <View style={styles.progressBar}>
        <Animated.View style={[StyleSheet.absoluteFill], {backgroundColor: "#03fc41", width: pBarWidth }}/>
    </View>

    <Text style={{textAlign: 'center'}}>{percent}%</Text>


   
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
  bodyHolder: {borderRadius:10, backgroundColor: '#6b8bd6'},
  progressBar: {
    height: 100,
    width: '100%',
    backgroundColor: 'white',
    borderColor: '#000',
    borderWidth: 10,
    borderRadius: 20,
    flexDirection:"row"
  }
 
})

export default ProjectorScreen
