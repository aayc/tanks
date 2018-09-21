# Tanks!

As a kid, I loved the Tanks! minigame in Wii Play.  Since I no longer have access to a Wii, I decided to build my own version.  This version is both single player and multiplayer (a little unreliable).  The first few levels are heavily inspired by the Wii Play version, but I then branched into my own custom levels, up to level 20.
  
It's playable [here](https://enigmatic-reef-9847.herokuapp.com) but not complete (just missing an ending screen).  I've also added skill points and upgrades to the game, so you can improve your tank speed, bullet speed, etc.

Download zip and run:
```javascript
node index.js
```
Navigate to localhost:4004

## Dependencies
Single Player mode can be run using a simple Python server

`
python -m SimpleHTTPServer
`

I wrote a room management socket library [corridors](https://www.npmjs.com/package/corridors) to simplify multiplayer and manage connection failure, etc.

I used Phaser 2 engine for physics and sprite rendering.

## Screenshot: Gameplay (Level 2)
![alt tag](readme-imgs/gameplay-img.png)

## Screenshot: Upgrade Screen
![alt tag](readme-imgs/level-up-screen.png)
