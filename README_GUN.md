Running a private Gun relay

This project uses Gun (https://gun.eco) and by default connects to a public peer: https://gunjs.herokuapp.com/gun

To run your own relay (Node.js):

1. Create a simple Express server and attach gun:

```js
// server.js
const express = require('express');
const Gun = require('gun');
const app = express();
const server = require('http').createServer(app);

app.use(Gun.serve);
const gun = Gun({ web: server });

server.listen(8765, () => console.log('Gun relay listening on 8765'));
```

2. Install and run:

```bash
npm install express gun
node server.js
```

3. Use your relay's URL as a peer in the app (e.g. `http://your-server:8765/gun`) — open `/p2p` and paste the peer url into the `Peers` input before joining the room.

Security notes
- The app encrypts messages with `Gun.SEA.encrypt` using the secret code you enter. Only clients with the same secret can decrypt messages.
- Running your own relay gives you more privacy and availability than relying on public relays.

If you want, I can add a small settings UI to save a preferred peer URL or start an embedded fallback. Tell me if you'd like that next.