import datetime
import json

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer


class ChatConsumer(WebsocketConsumer):
    def connect(self):
        """
        Connect to a chat room
        Spaces are replaced like this: 'My new room' -> 'My_new_room'
        """

        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_name = self.room_name.replace(' ', '_')
        self.room_group_name = 'chat_%s' % self.room_name

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )


    def receive(self, text_data):
        """
        Receive a message and broadcast it to a room group
        """

        text_data_json = json.loads(text_data)
        message = text_data_json['message']
        time = datetime.datetime.now().isoformat()

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'time': time,
            }
        )


    def chat_message(self, event):
        """
        Receive a broadcast message and send it over a websocket
        """

        message = event['message']
        time = event['time']

        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'message': message,
            'time': time,
        }))
