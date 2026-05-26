import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Gun from "gun";

// Default peer can be overridden in the UI before joining
const DEFAULT_PEERS = ["https://gunjs.herokuapp.com/gun"];
const gun = Gun({ peers: DEFAULT_PEERS });

async function sha256Hex(text) {
  const enc = new TextEncoder();
  const data = enc.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function DecentralizedChat() {
  const [secret, setSecret] = useState("");
  const [nick, setNick] = useState("");
  const [joined, setJoined] = useState(false);
  const [roomKey, setRoomKey] = useState("");
  const [messages, setMessages] = useState([]);
  const [messageMap, setMessageMap] = useState({}); // id -> message
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [peersInput, setPeersInput] = useState(() => {
    try {
      return localStorage.getItem("preferredPeers") || DEFAULT_PEERS.join(",");
    } catch (e) {
      return DEFAULT_PEERS.join(",");
    }
  });
  const [availableRooms, setAvailableRooms] = useState([]);
  const seen = useRef(new Set());
  const navigate = useNavigate();
  const roomRef = useRef(null);

  useEffect(() => {
    return () => {
      // cleanup listeners if any
    };
  }, []);

  const joinRoom = async () => {
    if (!secret || !nick) return alert("Enter nickname and secret code to join.");
    const key = await sha256Hex(secret.trim());
    setRoomKey(key);
    setJoined(true);
    // allow dynamic peer override
    try {
      const peers = peersInput.split(",").map((p) => p.trim()).filter(Boolean);
      if (peers.length) {
        roomRef.current = Gun({ peers });
      } else {
        roomRef.current = gun;
      }
    } catch (e) {
      roomRef.current = gun;
    }

    const room = roomRef.current.get(`room/${key}`);

    // Register this room in a simple public index (optional)
    try {
      const index = roomRef.current.get("rooms_index");
      index.set({ key, ts: Date.now() });
    } catch (e) {
      // ignore
    }

    // Subscribe to messages, store by id and keep sorted order
    room.map().on(async (data, id) => {
      if (!data || !data.msg) return;
      if (seen.current.has(id)) return; // dedupe quickly
      seen.current.add(id);
      try {
        const decrypted = await Gun.SEA.decrypt(data.msg, secret);
        setMessageMap((prev) => {
          const next = { ...prev, [id]: { id, from: data.from, message: decrypted, ts: data.ts || Date.now() } };
          // convert to sorted array
          const sorted = Object.values(next).sort((a, b) => (a.ts || 0) - (b.ts || 0));
          setMessages(sorted);
          return next;
        });
      } catch (err) {
        // decryption failed -> wrong secret or malformed message
      }
    });

    // Subscribe to typing updates for this room
    const typingNode = roomRef.current.get(`room/${key}/typing`);
    typingNode.on((obj) => {
      if (!obj) return;
      setTypingUsers((prev) => {
        const now = Date.now();
        const next = { ...prev, ...obj };
        // cleanup old entries
        Object.keys(next).forEach((u) => { if (now - next[u] > 5000) delete next[u]; });
        return next;
      });
    });

    // Subscribe to rooms index to show available rooms
    try {
      const index = roomRef.current.get("rooms_index");
      index.map().on((item, id) => {
        if (!item || !item.key) return;
        setAvailableRooms((prev) => {
          const found = prev.find((r) => r.key === item.key);
          if (found) return prev;
          return [{ key: item.key, ts: item.ts }, ...prev].slice(0, 20);
        });
      });
    } catch (e) {
      // ignore
    }
  };

  const sendMessage = async () => {
    if (!text.trim() || !joined) return;
    try {
      const encrypted = await Gun.SEA.encrypt(text, secret);
      const room = (roomRef.current || gun).get(`room/${roomKey}`);
      const msgObj = { msg: encrypted, from: nick, ts: Date.now() };
      room.set(msgObj);
      // Local append via messageMap to keep ordering consistent
      setMessageMap((prev) => {
        const id = `local-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
        const next = { ...prev, [id]: { id, from: nick, message: text, ts: msgObj.ts } };
        const sorted = Object.values(next).sort((a, b) => (a.ts || 0) - (b.ts || 0));
        setMessages(sorted);
        return next;
      });
      setText("");
    } catch (err) {
      console.error("send error", err);
    }
  };

  // Publish typing heartbeat
  useEffect(() => {
    if (!joined || !roomKey) return;
    const node = (roomRef.current || gun).get(`room/${roomKey}/typing`);
    let interval = null;
    if (text.trim()) {
      node.put({ [nick]: Date.now() });
      interval = setInterval(() => node.put({ [nick]: Date.now() }), 2000);
    } else {
      node.put({ [nick]: null });
    }
    return () => { if (interval) clearInterval(interval); node.put({ [nick]: null }); };
  }, [text, joined, roomKey, nick]);

  return (
    <Box sx={{ p: 2, height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">Decentralized Chat</Typography>
      </Box>

      {!joined ? (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 2, maxWidth: 640 }}>
          <TextField label="Nickname" value={nick} onChange={(e) => setNick(e.target.value)} />
          <TextField label="Secret Code" value={secret} onChange={(e) => setSecret(e.target.value)} />
          <TextField label="Peers (comma-separated)" value={peersInput} onChange={(e) => setPeersInput(e.target.value)} helperText="Override default peers, e.g. http://localhost:8765/gun" />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="contained" onClick={joinRoom}>Join Room</Button>
            <Button variant="outlined" onClick={() => { navigator.clipboard?.writeText(secret || ''); }}>Copy Secret</Button>
          </Box>
          <Typography variant="caption">Enter the same secret code to chat privately. Messages are encrypted with SEA; only users with the secret can decrypt them.</Typography>
          {availableRooms.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2">Recent public room keys (may be incomplete):</Typography>
              {availableRooms.map((r) => (
                <Box key={r.key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.key.slice(0,8)}...</Typography>
                  <Button size="small" onClick={() => { navigator.clipboard?.writeText(r.key); }}>Copy</Button>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2">Room: <span style={{fontFamily:'monospace'}}>{roomKey?.slice(0,8)}...</span></Typography>
            <Typography variant="caption" sx={{ color: 'gray' }}>{Object.keys(typingUsers).filter(u=>u && u!==nick).length ? `${Object.keys(typingUsers).filter(u=>u&&u!==nick).join(', ')} is typing...` : ''}</Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", mb: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {messages.map((m, idx) => {
              const isMe = m.from === nick;
              return (
                <Box key={m.id || idx} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <Box sx={{ maxWidth: '72%', backgroundColor: isMe ? '#4caf50' : '#e0e0e0', color: isMe ? '#fff' : '#000', p: 1.25, borderRadius: 2 }}>
                    <Typography variant="caption" sx={{ color: isMe ? 'rgba(255,255,255,0.85)' : 'gray', display: 'block' }}>{m.from} • {new Date(m.ts).toLocaleTimeString()}</Typography>
                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>{m.message}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField fullWidth value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }} />
            <IconButton onClick={sendMessage} color="primary"><SendIcon /></IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
