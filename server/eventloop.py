import socketio
import eventlet
import time

sio = socketio.Server()

_UPDATE_HZ = 30


def render_forever(state, bridge, draw_fn, timer_fn):
  '''Redraw the bridge periodically'''
  while True:
    start = time.time()

    timer_fn(state)
    draw_fn(state, bridge)
    bridge.render()

    end = time.time()
    wait = (1.0/_UPDATE_HZ) - (end-start)
    wait = max(wait, 0.0)
    eventlet.sleep(wait)

def start(
    bridge,
    state,
    listen_host='',
    listen_port=8000,
    listen_https=False,
    listen_privkey='',
    listen_pubkey='',
    handlers=None,
    timer_fn=None,
    draw_fn=None,
    ):
  '''Spin up the event loop'''
  assert handlers is not None
  assert draw_fn is not None
  assert timer_fn is not None

  # register the handlers
  for event, handler in handlers.iteritems():
    if event == 'connect':
      sio.on(event, lambda sid, environ, event=event, state=state: handlers[event](state, sid))
    elif event == 'disconnect':
      sio.on(event, lambda sid, event=event, state=state: handlers[event](state, sid))
    else:
      sio.on(event, lambda sid, data, event=event, state=state: handlers[event](state, sid))

  # initialize the server
  app = socketio.Middleware(sio)
  server = eventlet.listen((listen_host, listen_port))
  if listen_https:
    server = eventlet.wrap_ssl(
      server,
      certfile=listen_pubkey,
      keyfile=listen_privkey,
      server_side=True)

  # spin up the main event loop
  eventlet.spawn(render_forever, state, bridge, draw_fn, timer_fn)
  eventlet.wsgi.server(server, app, log_output=False)
