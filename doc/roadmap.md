

# BACKLOG

- Automatic re-use/caching/memoizing of macros
- Mute behavior all local, without server involvement
- Hook "sound mute" state persistence to local storage

- Event/Reaction when loosing websocket connection
- Set game in pause mode when any player presses "p", game shows a PAUSED label, all cursors stop moving and users gain back control of the browsers cursor.

- Flush the scene when connectin is reseted
- Store game state in DB
- Cursor changes shape when it hovers over a clickable area
- Player cursor disapear when mouse is not over the window anymore
- Catch mouse position even before first move
- Detection and Message to force "google chrome"
- Prevent default mouse/touch/selection events on canvas
- Drag a bomb with your in-game cursor
- Add smoke sprites to explosion animation
- Add easing into api
- Upon big lag or disconnection, the player's cursor re-appears
- Abstract the library from the demo
- Namespace all socket events

- Basic "room" chat
- Player Id/Name over cursors
- Chat command to set player nick
- Basic help in chat

- Client send all mouse events (button type, event attrs, etc)
- Clean up the client-side api for Bitmaps, Audio, Inputs.
- Optimize the demo ambiance track for smaller size
- Send bitmap data over websocket instead of async loading using IMGs
- Send sound data over websocket


# HISTORY

## v0.0.10

- Macro instances with functionnal api
- Sending macros for reuse
- local and remote context
- run command
- run() multiple times with array or models
- multi-line macros

## v0.0.9

- Calculate/Monitor lag


## v0.0.8

- Show "muted!/unmuted!" as an icon
- Mute/Unmute icon is clickable


## v0.0.7

- Loop ambiance sound
- Mute/Unmute on "m" keypress
- Client sends keystroke
- Server reacts to keystroke

## v0.0.6

- Play ambient soundtrack
- Play sound when cursors places bomb
- Play sound when bomb explodes

## v0.0.5

- Better looking cursor
- Make a factory for the high resolution timer mechanism
- Exploding bomb will trigger other bombs nearby to explode

## v0.0.4

- Change class names to "Bobombs" instead of "Bombs"
- Animated explosions for bombs
- Animated "Bobombs" sprites
- Log time cost of game loop

## v0.0.3

- Bombs disappears after a delay

## v0.0.2
- Draw bombs under the cursors

## v0.0.1
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
