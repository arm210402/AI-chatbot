import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from "@expo/vector-icons"
import { GiftedChat } from 'react-native-gifted-chat';

export default function App() {

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState("")
  const [outputMessage, setOutputMessage] = useState("results shown here")

  const handleButtonClick = () => {
    if (inputMessage.toLocaleLowerCase().startsWith("generate image")) {
      generateImages()
    }
    else {
      generateText()
    }

  }

  const generateText = () => {
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
        "Authorization": "Bearer $OPENAI_API_KEY"
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

  const generateImages = () => {
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
        "Authorization": "Bearer $OPENAI_API_KEY"
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
  const handleTextInput = (text) => {
    setInputMessage(text)
    //  console.log(text)

  }


  return (

    <ImageBackground source={require('./assets/peakpx2.jpg')} resizeMode="cover" style={{ flex: 1, width: "100%", height: "100%" }}>
      <StatusBar backgroundColor="black" />
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "center" }}>
          <GiftedChat messages={messages} renderInputToolbar={() => { }} user={{ _id: 1 }} minInputToolbarHeight={0} />
        </View>

        <View style={{ flexDirection: "row" }}>
          <View style={{ flex: 1, marginLeft: 10, marginBottom: 20, borderRadius: 10, height: 60, marginLeft: 10, marginRight: 10, borderColor: "grey", borderWidth: 1, backgroundColor: "white", justifyContent: "center", paddingLeft: 10, paddingRight: 10 }}>
            <TextInput placeholder='Enter your question' onChangeText={handleTextInput} value={inputMessage} />
          </View>

          <TouchableOpacity onPress={handleButtonClick}>
            <View style={{ backgroundColor: "green", borderRadius: 9999, width: 60, height: 60, justifyContent: "center", padding: 5, marginRight: 10, marginBottom: 20 }}>
              <MaterialIcons name="send" size={30} color="white" style={{ marginLeft: 10 }} />
            </View>
          </TouchableOpacity>
        </View>

        <StatusBar style="auto" />
      </View>
    </ImageBackground>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
