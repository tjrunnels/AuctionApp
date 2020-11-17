import React, { useState } from "react";
import { View, StyleSheet, Button, Alert } from "react-native";
import printHappy from "./printhappy";



const HubScreen = ({navigation}) => {
    console.log('hubscreen loaded');
    printHappy();
    const createThreeButtonAlert = () =>
    Alert.alert(
      "Welcome to Auction App",
      "What screen would you like",
      [
        {
          text: "BidScreen",
          onPress: () => navigation.navigate('BidScreen'),
        },
        {
          text: "Nothing",
          onPress: () => console.log("Nothing Pressed"),
          style: "cancel"
        },
        { text: "DeleteMessages", onPress: () => {
            console.log("DeleteMessages Pressed") 
            
            }
        }
      ],
      { cancelable: false }
    );

  
    return (
        <View style={{flex: 1, justifyContent: "space-around", alignItems: "center"}}>
            <Button title="BidScreen" onPress={() => navigation.navigate('BidScreen')}></Button>

            <Button title={"other"} onPress={createThreeButtonAlert} />
            {/* <Button title="BidScreen"></Button> */}
            <Button title="ProjectorScreen" onPress={() => navigation.navigate('ProjectorScreen')}></Button>
        </View>
        
    )
    
  };
  
  
  
  export default HubScreen
  