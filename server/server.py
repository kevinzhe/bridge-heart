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

def run_server(evq, listen_host='', listen_port=8000,
    https=False, listen_privkey='', listen_pubkey=''):
  global event_queue
  event_queue = evq
  app = socketio.Middleware(sio)
  if https:
    server = eventlet.wrap_ssl(
      eventlet.listen((listen_host, listen_port)),
      certfile=listen_pubkey,
      keyfile=listen_privkey,
      server_side=True)
  else:
    server = eventlet.listen((listen_host, listen_port))
  eventlet.wsgi.server(server, app)

def main():
  run_server(None)

if __name__ == '__main__':
  main()
