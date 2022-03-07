import React, {useEffect, useState} from 'react'

function App() {
  const [messages, setMessages] = useState([]);
  console.log("Started to render");
  useEffect(() => {
    const roomName = location.pathname.substr(1);
    const socketPath = 'ws://'
      + window.location.host
      + '/ws/'
      + roomName;
    const chatSocket = new WebSocket(
      socketPath
    );

    chatSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      const message = {text: data.message, date: data.time};
      setMessages(messages => [...messages, message]);
    };
    chatSocket.onclose = (e) => {
      console.error('Chat socket closed unexpectedly');
    };
    document.querySelector('#chat-message-input').focus();
    document.querySelector('#chat-message-submit').onclick = (e) => {
      const messageInputDom = document.querySelector('#chat-message-input');
      const message = messageInputDom.value;

      chatSocket.send(JSON.stringify({
        'message': message
      }));
      messageInputDom.value = '';
    };
  },[]);
  return (
    <div>
      {messages.map(function (item, i) {
          return <div key={i} id="message" className="card">

            <div className="cell large-4">{item.text}</div>
            <div className="cell large-2 text-right"><small>{item.date}</small></div>
          </div>
            ;
        }
      )}
      <textarea id="chat-message-input" type="text" cols="100"/><br/>
      <input id="chat-message-submit" type="button" className="button" value="Send"/>
    </div>
  );
}
export default App;
