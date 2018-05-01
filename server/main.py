import time

import eventloop
import events

from bridge import CombinedBridge
from bridge import PauschBridge
from bridge import SimulatedBridge


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
  print('heartbeat')
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


def main():
  # initialize the state object
  state = State()

  # initialize the bridges
  bridge = CombinedBridge([
    SimulatedBridge(),
    #PauschBridge()
  ])

  # register all of the handlers
  eventloop.register_handler(events.TimerTick, on_timer)
  eventloop.register_handler(events.HeartBeat, on_heartbeat)
  eventloop.register_handler(events.Connected, on_connected)
  eventloop.register_handler(events.Disconnected, on_disconnected)
  eventloop.register_draw(draw_state)

  # spin up the event loop
  eventloop.start(bridge, state)

if __name__ == '__main__':
  main()
