## TODO: the app

There is many things that needs to be done. What? Fly...ing fly...ing cliff racers fly...ing.

So far, we have a working js version of the game. It was made quickly and with no cleaning. Things that are still missing are a scoreboard and ~~a way to cheat by pressing a key combination xyxxz or something.
(I just googled it and it's XYZZY Shift-Enter Enter)~~

What I want to do next is bettering the development system.

- add git hooks to format the code
- use sass
- update the dev server to compile the sass on file changes

Once everything in place, it's time for server-siding the game. Right now it's possible to just open the dev console and find the mines. You can just cheat without entering the cheat code and scanning the cells by looking at the code and debbuging the js.

The obvious solution is to move the game logic outside of the client control. The client will send inputs and the server will awnser with game states. The first implementation only needs to work with http requests.

1. Client ask to start a new game
   1. server creates a new game in the database and send its id to the client
   2. the game with, height and number of mines were defined at game creation
2. Client send the first click
   1. server generate the grid (to avoid the first click being a mine)
   2. server respond with the discovered cells
   3. servers starts the timer
3. Client send one of theses actions:
   - Right click on hidden cell
   - Right click on revealed cell
   - Left click (flag) on hidden cell
4. Server checks the input and respond with one of the following:
   - Reveal cells
   - flag cell
   - game over
   - game win

The server logs every inputs/generated games/results. There is a leaderboard.

## TODO: the server

I'm going to use Django for the server beacause it's what I know. Funny thing is I don't know how to get a django app up and running in a production environment. That was always handled by one of my coworkers and I've never shown interest to learn how to do it.

I already have a VPS with nginx as a reverse proxy for a few software I'm using. There is a php app running there I think. Also a Go one.

I need to follow the official django doc to make the app production ready and use a python server like gunicorn behind nginx to serve the static files. Something like that?

Everytime I want to start a new django project I have to start the django tutorial all over again to get the scafolding. The urls, the settings, the database, static folder, first model and view. I'm not reusing the app I created elsewhere so I only run the django-admin command to create a new app once.
