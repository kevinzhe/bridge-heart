'''
Representations of the events that the mainloop can accept
'''

class Event(object):
  pass

class TimerTick(Event):
  pass

class HeartBeat(Event):
  def __init__(self, cid):
    self.cid = cid

class Connected(Event):
  def __init__(self, cid):
    self.cid = cid

class Disconnected(Event):
  def __init__(self, cid):
    self.cid = cid
