import time
import traceback
import random
from threading import Thread, Event
from multiprocessing import Process, Queue

import events
from bridge import CombinedBridge, PauschBridge, SimulatedBridge
from server import run_server

UPDATE_HZ = 30
START_SEQ_OFFSET = 40
WIDTH = 1

COLORS = (
(249.0/255.0, 38.0/255.0,114.0/255.0),
(166.0/255.0,226.0/255.0, 46.0/255.0),
(102.0/255.0,217.0/255.0,239.0/255.0),
(253.0/255.0,151.0/255.0, 31.0/255.0),
(174.0/255.0,129.0/255.0,255.0/255.0),
)

class State(object):
  '''All the state'''
  now = 0
  last_beat = {}
  panels_in_use = {}
  colors = {}
  next_color = 0

def on_connected(state, event):
  '''Handle a client connecting.'''
  print('connected', event.cid)
  next_panel = START_SEQ_OFFSET
  while next_panel in [a for b in state.panels_in_use.values() for a in b]:
    next_panel += 1
  state.panels_in_use[event.cid] = range(next_panel, next_panel + WIDTH)
  state.last_beat[event.cid] = 0
  state.colors[event.cid] = COLORS[state.next_color]
  state.next_color += 1
  state.next_color %= len(COLORS)

def on_disconnected(state, event):
  '''Handle a client disconnecting.'''
  print('disconnected', event.cid)
  del state.last_beat[event.cid]
  del state.panels_in_use[event.cid]

def on_heartbeat(state, event):
  '''Handle a HeartBeat event.'''
  state.last_beat[event.cid] = time.time()

def on_timer(state, event):
  '''Handle a TimerTick event.'''
  state.now = time.time()

def draw_state(state, bridge):
  '''Translate the supplied state object into a lighting show on the bridge.'''
  for cid in state.last_beat.keys():
    diff = state.now - state.last_beat[cid]
    diff = min(diff, 1.0)
    diff = 1.0 - diff
    bridge.set_bottom(*state.colors[cid], w=diff, panels=state.panels_in_use[cid])
    bridge.set_top(*state.colors[cid], w=diff, panels=state.panels_in_use[cid])

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
