import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ImageBackground, Alert, StyleSheet, Pressable, Text, TextInput, TouchableOpacity, View, Button, SafeAreaView } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons"
import { GiftedChat } from 'react-native-gifted-chat';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";


export default function App() {

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [outputMessage, setOutputMessage] = useState("results shown here")
  const [modalVisible, setModalVisible] = useState(true);
  const [defKey, setdefKey] = useState("")


  const storeData = async () => {
    console.log(defKey)
    try {
      await AsyncStorage.setItem('key', defKey)
      console.log("data stored")
    } catch (e) {
      Alert.alert("failed to store data")
    }
  }
  const getData = async () => {

    try {
      const setdefKey = await AsyncStorage.getItem('key')
      if (setdefKey !== null) {
        console.log(setdefKey)
      }
      else {
        Alert.alert("Key is invalid or empty")
      }
    } catch (e) {
      Alert.alert("Error retriving data")
    }
  }


  const handleKey = (text) => {
    setdefKey(text)
    console.log(text)
  }
  const handleButtonClick = () => {


    if (inputMessage.toLocaleLowerCase().startsWith("/image")) {
      generateImages()
    }
    else {
      generateText()
    }

  }

  const generateText = () => {


    if (defKey === null && setdefKey === null) {
      Alert.alert("Empty or Invalid key")
    }
    else {
      // console.log("btn clicked")
      const message = {
        _id: Math.random().toString(36).substring(7),
        text: inputMessage,
        createdAt: new Date(),
        user: { _id: 1 }
      }
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [message])
      )
      setInputMessage("")

      fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + defKey
        },
        body: JSON.stringify({
          "messages": [{ "role": "user", "content": inputMessage }],
          "model": "gpt-3.5-turbo",
        })
      }).then((responce) => responce.json()).then((data) => {
        setOutputMessage(data.choices[0].message.content.trim())
        const message = {
          _id: Math.random().toString(36).substring(7),
          text: data.choices[0].message.content.trim(),
          createdAt: new Date(),
          user: { _id: 2, name: "Open AI" }
        }

        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [message])
        )

      })
    }
  }

  const generateImages = () => {

    if (defKey === null && setdefKey === null) {
      Alert.alert("Empty or Invalid key")
    }
    else {
      // console.log("btn clicked")
      const message = {
        _id: Math.random().toString(36).substring(7),
        text: inputMessage,
        createdAt: new Date(),
        user: { _id: 1 }
      }
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, [message])
      )
      setInputMessage("")
      fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + defKey
        },
        body: JSON.stringify({
          "prompt": inputMessage,
          "n": 2,
          "size": "1024x1024"
        })
      }).then((responce) => responce.json()).then((data) => {
        setOutputMessage(data.data[0].url)
        data.data.forEach((item => {
          const message = {
            _id: Math.random().toString(36).substring(7),
            text: "Image",
            createdAt: new Date(),
            user: { _id: 2, name: "Open AI" },
            image: item.url
          }
          setMessages((previousMessages) =>
            GiftedChat.append(previousMessages, [message])
          )

        }))

      })
    }
  }
  const handleTextInput = (text) => {
    setInputMessage(text)
    //  console.log(text)

  }


  return (
    <>
      <ImageBackground source={require('./assets/peakpx2.jpg')} resizeMode="cover" style={{ flex: 1, width: "100%", height: "100%" }}>

        <View style={styles.centeredView}>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              //  Alert.alert('Modal has been closed.');
              setModalVisible(!modalVisible);
            }}>
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Enter OpenAI API key</Text>
                <TextInput style={{ paddingBottom: 20, marginBottom: 30, backgroundColor: "#E0E0E0", borderRadius: 20, width: 300, justifyContent: 'center' }}
                  placeholder='   Enter Key Here' onChangeText={handleKey} value={defKey}></TextInput>

                <Pressable
                  style={[styles.button, styles.buttonClose]}
                  onPress={() => { setModalVisible(!modalVisible); storeData() }}>

                  <Text style={styles.textStyle}>Submit</Text>

                </Pressable>
              </View>
            </View>
          </Modal>
          <Pressable
            style={[styles.button, styles.buttonOpen]}
            onPress={() => { setModalVisible(true); }}>
            <Text style={styles.textStyle}>KEY</Text>
          </Pressable>


        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flex: 1, justifyContent: "center" }}>
            <GiftedChat messages={messages} renderInputToolbar={() => { }} user={{ _id: 1 }} minInputToolbarHeight={0} />
          </View>



          <View style={{ flexDirection: "row" }}>
            <View style={{ flex: 1, marginLeft: 10, marginBottom: 20, borderRadius: 10, height: 60, marginLeft: 10, marginRight: 10, borderColor: "grey", borderWidth: 1, backgroundColor: "white", justifyContent: "center", paddingLeft: 10, paddingRight: 10 }}>
              <TextInput placeholder='Enter your question' onChangeText={handleTextInput} value={inputMessage} />
            </View>

            <TouchableOpacity onPress={() => { getData(); handleButtonClick() }}>
              <View style={{ backgroundColor: "green", borderRadius: 9999, width: 60, height: 60, justifyContent: "center", padding: 5, marginRight: 10, marginBottom: 20 }}>
                <MaterialIcons name="send" size={30} color="white" style={{ marginLeft: 10 }} />
              </View>
            </TouchableOpacity>
          </View>

          <StatusBar style="auto" />
        </View>
      </ImageBackground>
    </>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginTop: 30,
    width: 80
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
});


{/* <View style={{ padding: 30 }}>
        <TouchableOpacity onPress={() => setApiKeySaved(false)}>
          <View style={{ backgroundColor: "red", borderRadius: 9999, width: 60, height: 60, justifyContent: "center", padding: 5, marginRight: 10, marginBottom: 20 }}>
            <Text>Enter API Key</Text>
          </View>
        </TouchableOpacity>
      </View>
      {!apiKeySaved && (
        <View>
          <TextInput
            placeholder="Enter API key"
            value={apiKey}
            onChangeText={setApiKey}
          />
          <TouchableOpacity onPress={saveApiKey}>
            <Text>Save</Text>
          </TouchableOpacity>
        </View>
      )} */}
