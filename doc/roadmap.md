

# BACKLOG
- Bombs disappears after a delay
- Animated explosions for bombs
- Catch mouse position even before first move
- Play ambient soundtrack
- Play sound when cursors places bomb
- Play sound when bomb explodes
- Set game in pause mode when any player presses "p", game shows a PAUSED label, all cursors stop moving and users gain back control of the browsers cursor.
- Send bitmap data over websocket instead of async loading using IMGs
- Send sound data over websocket
- Clicking on a bomb forces it to explode
- Client sends keystroke
- Server reacts to keystroke
- Add easing into api
- Abstract the library from the demo
- Namespace all socket events
- Basic "room" chat
- Player Id/Name over cursors
- Chat command to set name
- Basic help in chat
- Gameplay: Maximum cursor speed (uniformize touch vs mouse)
- Gameplay: Cursor can be hit just like a unit
- Gameplay: Cursor based constraints (hold touch or click to feed units)
- Gameplay: Cursors bump into each others ?
- Client send all mouse events (button type, event attrs, etc)


# HISTORY
- Draw bombs under the cursors
- Untangle connect/disconnect from game and differentiate between cursors
- Server changes cursor on click
- Trigger API commands with funex expressions through socket.io
- Execute api functions with .exec()
- Set Macros
- Run Macros
- Listen to remove mouse events
- Activate/Deactivate signals/sensors (mouse, touch, etc)
- Broadcast multiple cursors
- Create a full screen canvas hooked to Easel
- Client send mouse position to server with websocket
- Server sends back sprite cursors to represent player position


# AUTONOMY OF CLIENT ?
- Zooming (+ - 0)
- Stats stats (lag, fps)
- Scene position relative to viewport
