import socketio
import eventlet
import events
from threading import Thread

sio = socketio.Server()
event_queue = None

@sio.on('connect')
def connect(sid, env):
  if event_queue is not None:
    event = events.Connected(sid)
    event_queue.put(event)

@sio.on('beat')
def beat(sid, data):
  if event_queue is not None:
    event = events.HeartBeat(sid)
    event_queue.put(event)

@sio.on('disconnect')
def disconnect(sid):
  if event_queue is not None:
    event = events.Disconnected(sid)
    event_queue.put(event)

def run_server(evq):
  global event_queue
  event_queue = evq
  app = socketio.Middleware(sio)
  server = eventlet.wrap_ssl(
    eventlet.listen(('bridge.kevinzheng.com', 8000)),
    certfile='./certs/fullchain.pem',
    keyfile='./certs/privkey.pem',
    server_side=True)
  eventlet.wsgi.server(server, app)

def main():
  run_server(None)

if __name__ == '__main__':
  main()
