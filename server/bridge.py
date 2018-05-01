'''
Generic interface to program the bridge.
'''

import sys


class Bridge(object):
  '''Generic interface for the bridge.'''
  START_SEQ = 1
  END_SEQ = 200

  def set_top(self, r, g, b, w, panels=None):
    raise NotImplementedError()
  def set_bottom(self, r, g, b, w, panels=None):
    raise NotImplementedError()
  def render(self):
    raise NotImplementedError()


class PauschBridge(Bridge):
  '''API to access the Pausch Bridge'''

  def __init__(self):
    '''Initialize the Pausch Bridge.'''
    try: import lumiversepython as L
    except: raise ImportError(
      'Couldn\'t import lumiversepython: ' +
      'Are you running on pbridge.adm.cs.cmu.edu?')
    self.rig = L.Rig("/home/teacher/Lumiverse/PBridge.rig.json")
    self.rig.init()
    # Cache the panel objects into an array for speedy lookup.
    # Gates side has sequence 1.
    self.top_panels = [
      self.rig.select("$side=top[$sequence={0}]".format(i))
      for i in xrange(Bridge.START_SEQ, Bridge.END_SEQ+1)]
    self.bottom_panels = [
      self.rig.select("$side=bot[$sequence={0}]".format(i))
      for i in xrange(Bridge.START_SEQ, Bridge.END_SEQ+1)]
    [panel.setRGBRaw(0, 0, 0) for panel in self.top_panels]
    [panel.setRGBRaw(0, 0, 0) for panel in self.bottom_panels]

  def set_top(self, r, g, b, w, panels = None):
    if panels is None:
      [panel.setRGBRaw(r, g, b, w) for panel in self.top_panels]
    else:
      for panel in panels:
        self.top_panels[panel].setRGBRaw(r, g, b, w)

  def set_bottom(self, r, g, b, w, panels = None):
    if panels is None:
      [panel.setRGBRaw(r, g, b, w) for panel in self.bottom_panels]
    else:
      for panel in panels:
        self.bottom_panels[panel].setRGBRaw(r, g, b, w)

  def render(self):
    self.rig.updateOnce()


class SimulatedBridge(Bridge):
  '''A simulated bridge, useful for testing.'''

  def __init__(self):
    self.top = (0, 0, 0)
    self.bottom = (0, 0, 0)

  def set_top(self, r, g, b, w, panels=None):
    self.top = (r, g, b)

  def set_bottom(self, r, g, b, w, panels=None):
    self.bottom = (r, g, b)

  def render(self):
    pass


class CombinedBridge(Bridge):
  '''Combine multiple Bridge instances'''

  def __init__(self, bridges):
    self.bridges = bridges

  def set_top(self, r, g, b, w, panels=None):
    for bridge in self.bridges:
      bridge.set_top(r, g, b, w, panels=panels)

  def set_bottom(self, r, g, b, w, panels=None):
    for bridge in self.bridges:
      bridge.set_bottom(r, g, b, w, panels=panels)

  def render(self):
    for bridge in self.bridges:
      bridge.render()

