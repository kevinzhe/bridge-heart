import time
import traceback
from threading import Thread, Event
from multiprocessing import Process, Queue

import events
from bridge import CombinedBridge, PauschBridge, SimulatedBridge
from server import run_server

UPDATE_HZ = 30


class State(object):
  '''All the state'''
  last_beat = 0
  now = 0


def on_connected(state, event):
  '''Handle a client connecting.'''
  print('connected', event.cid)
  pass

def on_disconnected(state, event):
  '''Handle a client disconnecting.'''
  print('disconnected', event.cid)
  pass

def on_heartbeat(state, event):
  '''Handle a HeartBeat event.'''
  state.last_beat = time.time()


def on_timer(state, event):
  '''Handle a TimerTick event.'''
  state.now = time.time()

def draw_state(state, bridge):
  '''Translate the supplied state object into a lighting show on the bridge.'''
  diff = state.now - state.last_beat
  diff = min(diff, 1.0)
  diff = 1.0 - diff
  diff *= 0.7
  bridge.set_bottom(diff, 0.0, 0.0)


def main_loop(evq, state, bridge):
  while True:
    event = evq.get()
    if type(event) == events.TimerTick:   on_timer(state, event)
    elif type(event) == events.HeartBeat: on_heartbeat(state, event)
    elif type(event) == events.Connected: on_connected(state, event)
    elif type(event) == events.Disconnected: on_disconnected(state, event)
    draw_state(state, bridge)
    bridge.render()


def timer(evq, stop):
  '''Thread target that generates periodic timer ticks into the event queue'''
  while not stop.wait(1.0/UPDATE_HZ):
    evq.put(events.TimerTick())


def main():
  # initialize the state object
  state = State()

  # initialize the bridges
  bridges = []
  bridges.append(SimulatedBridge())
  bridges.append(PauschBridge())

  # initialize the event queue
  evq = Queue()

  # signal the producer threads to stop
  stop_event = Event()

  # start the timer
  timer_thread = Thread(target=timer, args=(evq, stop_event,))
  timer_thread.start()

  # start the socket server
  web_process = Process(target=run_server, args=(evq,))
  web_process.start()

  # run indefinitely
  try:
    main_loop(evq, state, CombinedBridge(bridges))
  except (Exception, KeyboardInterrupt) as e:
    traceback.print_exc()
    stop_event.set()
    timer_thread.join()
    web_process.join()
    print('event loop interrupted, exiting')


if __name__ == "__main__":
  main()
