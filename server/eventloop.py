import traceback
from threading import Thread, Event
from multiprocessing import Process, Queue

import events
from server import run_server

UPDATE_HZ = 30

_handlers = dict()
_draw_state = None
_started = False

def main_loop(evq, state, bridge):
  if _draw_state is None:
    raise RuntimeError('draw_state function was not registered (call register_draw())')
  _started = True
  while True:
    event = evq.get()
    for eventType in _handlers:
      if eventType == type(event):
        _handlers[eventType](state, event)
      assert _draw_state is not None
      _draw_state(state, bridge)
    bridge.render()

def timer(evq, stop):
  '''Thread target that generates periodic timer ticks into the event queue'''
  while not stop.wait(1.0/UPDATE_HZ):
    evq.put(events.TimerTick())

def register_handler(event_type, handler):
  if _started: raise RuntimeError('Event loop already started')
  _handlers[event_type] = handler

def register_draw(draw_state_fn):
  if _started: raise RuntimeError('Event loop already started')
  global _draw_state
  _draw_state = draw_state_fn

def start(bridge, state, listen_host='', listen_port=8000,
    listen_https=False, listen_privkey='', listen_pubkey=''):
  # initialize the event queue
  evq = Queue()

  # signal the producer threads to stop
  stop_event = Event()

  # start the timer
  timer_thread = Thread(target=timer, args=(evq, stop_event,))
  timer_thread.start()

  # start the socket server
  web_process = Process(target=run_server,
    args=(evq, listen_host, listen_port,
      listen_https, listen_privkey, listen_pubkey))
  web_process.start()

  # run indefinitely
  try:
    main_loop(evq, state, bridge)
  except (Exception, KeyboardInterrupt) as e:
    traceback.print_exc()
    stop_event.set()
    timer_thread.join()
    web_process.join()
    print('event loop interrupted, exiting')
