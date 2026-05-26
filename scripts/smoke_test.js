const Gun = require('gun');
const SEA = Gun.SEA;

(async function(){
  try {
    // Two local peers (they'll connect to same peer URL if provided)
    const peer = process.env.GUN_PEER || 'https://gunjs.herokuapp.com/gun';
    const a = Gun({ peers: [peer] });
    const b = Gun({ peers: [peer] });

    const secret = 'test-secret-123';
    const roomKey = 'smoke-room-' + (Date.now()%10000);

    // user A encrypts and sets message
    const msg = 'hello from A ' + Date.now();
    const enc = await SEA.encrypt(msg, secret);
    const roomA = a.get(`room/${roomKey}`);
    roomA.set({ msg: enc, from: 'A', ts: Date.now() });

    // wait briefly and try to read from B
    setTimeout(async ()=>{
      const roomB = b.get(`room/${roomKey}`);
      roomB.map().once(async (data, id) => {
        try {
          if (!data || !data.msg) return;
          const dec = await SEA.decrypt(data.msg, secret);
          console.log('Decrypted on B:', dec);
          process.exit(0);
        } catch (e) {
          console.error('Decrypt failed', e);
          process.exit(2);
        }
      });
    }, 2000);
  } catch (e) {
    console.error('Smoke test error', e);
    process.exit(1);
  }
})();
