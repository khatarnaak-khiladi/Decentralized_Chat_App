import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Paper,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import Gun from "gun/gun";
import "gun/sea";

// Try multiple public Gun relays as fallbacks when one is down or blocked
const DEFAULT_PEERS = [
  "https://reco-production-8190.up.railway.app/gun",
  "https://gunjs.herokuapp.com/gun",
  "https://gun-server.herokuapp.com/gun",
  "https://gun-manhattan.herokuapp.com/gun",
];

function generateSecret() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export default function DecentralizedChat() {
  const [mode, setMode] = useState("create");
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [peerStatus, setPeerStatus] = useState("Waiting for peer...");
  const [status, setStatus] = useState("Ready to connect.");
  const [gun, setGun] = useState(null);
  const [connected, setConnected] = useState(false);
  const messageIds = useRef(new Set());
  const roomRef = useRef(null);
  const messagesNodeRef = useRef(null);
  const presenceNodeRef = useRef(null);
  const ackNodeRef = useRef(null);
  const listenerRef = useRef(null);
  const presenceListenerRef = useRef(null);
  const messageEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("preferredPeers");
    const peers = saved
      ? saved
          .split(",")
          .map((peer) => peer.trim())
          .filter(Boolean)
      : DEFAULT_PEERS;
    try {
      const g = Gun({ peers });
      console.log("Gun initialized with peers:", peers);
      setGun(g);
    } catch (err) {
      console.error("Failed to initialize Gun with peers:", peers, err);
      setGun(Gun());
    }
  }, []);

  useEffect(() => {
    return () => {
      if (listenerRef.current?.off) {
        listenerRef.current.off();
      }
      if (roomRef.current?.off) {
        roomRef.current.off();
      }
      roomRef.current = null;
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const openRoom = (code) => {
    if (!name.trim() || !code.trim()) {
      alert("Enter your name and a room code.");
      return;
    }
    if (!gun) {
      alert("Chat engine is not ready. Reload the page.");
      return;
    }

    const roomSecret = code.trim().toUpperCase();
    setRoomCode(roomSecret);
    setSecret(roomSecret);
    setConnected(true);
    setStatus(`Connected to ${roomSecret}`);
    setMessages([]);
    messageIds.current.clear();
    setPeerStatus("Waiting for peer...");

    if (listenerRef.current?.off) {
      listenerRef.current.off();
      listenerRef.current = null;
    }

    roomRef.current = gun.get(`room/${roomSecret}`);
    messagesNodeRef.current = roomRef.current.get("messages");
    presenceNodeRef.current = roomRef.current.get("presence");
    ackNodeRef.current = roomRef.current.get("acks");

    if (presenceListenerRef.current?.off) {
      presenceListenerRef.current.off();
      presenceListenerRef.current = null;
    }

    presenceListenerRef.current = presenceNodeRef.current.map();
    presenceListenerRef.current.on((data, id) => {
      if (!data || !data.name) return;
      if (data.name === name.trim()) return;
      setPeerStatus(`Peer online: ${data.name}`);
    });

    const listener = messagesNodeRef.current.map();
    listenerRef.current = listener;

    if (ackNodeRef.current) {
      ackNodeRef.current.map().on((ack, id) => {
        if (!ack || !ack.messageId || ack.from === name.trim()) return;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === ack.messageId ? { ...msg, delivered: true } : msg
          )
        );
      });
    }

    listener.on(async (data, id) => {
      if (!data || !data.msg || messageIds.current.has(id)) return;
      messageIds.current.add(id);
      try {
        const decrypted = await Gun.SEA.decrypt(data.msg, roomSecret);
        setMessages((prev) => {
          const next = [...prev, { id, from: data.from, text: decrypted, ts: data.ts || Date.now() }];
          return next.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        });
        if (data.from !== name.trim() && ackNodeRef.current) {
          ackNodeRef.current.get(id).put({ messageId: id, from: name.trim(), ts: Date.now() });
        }
      } catch (error) {
        console.warn("Decrypt failed for one message", error);
      }
    });
      presenceNodeRef.current.get(name.trim()).put({ name: name.trim(), ts: Date.now() });
  };

  const createRoom = () => {
    if (!name.trim()) {
      alert("Enter your name first.");
      return;
    }
    const code = generateSecret();
    openRoom(code);
    setStatus(`Room created: ${code}`);
  };

  const joinRoom = () => {
    if (!name.trim() || !secret.trim()) {
      alert("Enter your name and secret code.");
      return;
    }
    openRoom(secret);
  };

  const sendMessage = async () => {
    if (!input.trim() || !connected || !roomRef.current) return;
    const content = input.trim();
    const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    messageIds.current.add(id);
    const addedMessage = { id, from: name.trim(), text: content, ts: Date.now() };
    setMessages((prev) => [...prev, { ...addedMessage, delivered: false }].sort((a, b) => (a.ts || 0) - (b.ts || 0)));
    setInput("");

    try {
      const encrypted = await Gun.SEA.encrypt(content, secret);
      messagesNodeRef.current.get(id).put({ msg: encrypted, from: name.trim(), ts: addedMessage.ts });
    } catch (error) {
      console.error(error);
      alert("Failed to send the message.");
    }
  };

  const copyCode = () => {
    if (!roomCode) return;
    navigator.clipboard?.writeText(roomCode);
    setStatus("Room code copied to clipboard.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 2,
        background: "linear-gradient(180deg, #0b1730 0%, #151f37 100%)",
        color: "#fff",
      }}
    >
      <Paper
        sx={{
          maxWidth: 960,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          background: "rgba(12, 23, 51, 0.95)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
        elevation={16}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: "0.08em" }}>
              Secure Room Chat
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", mt: 1 }}>
              Create a private secret room or join an existing one. No duplicate messages, encryption enabled, timestamps included.
            </Typography>
          </Box>
          <IconButton onClick={() => navigate("/")} sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
            <ArrowBackIcon />
          </IconButton>
        </Box>

        {!connected ? (
          <Box sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              sx={{ background: "rgba(255,255,255,0.08)", borderRadius: 2 }}
            />
            {mode === "join" && (
              <TextField
                label="Secret room code"
                value={secret}
                onChange={(e) => setSecret(e.target.value.toUpperCase())}
                fullWidth
                sx={{ background: "rgba(255,255,255,0.08)", borderRadius: 2 }}
              />
            )}
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button
                variant={mode === "create" ? "contained" : "outlined"}
                color="primary"
                onClick={() => setMode("create")}
                sx={{ flex: 1, minWidth: 140 }}
              >
                Create Room
              </Button>
              <Button
                variant={mode === "join" ? "contained" : "outlined"}
                color="secondary"
                onClick={() => setMode("join")}
                sx={{ flex: 1, minWidth: 140 }}
              >
                Join Room
              </Button>
            </Box>
            <Button
              variant="contained"
              color="success"
              onClick={mode === "create" ? createRoom : joinRoom}
              sx={{ mt: 1, py: 1.5, fontWeight: 700 }}
            >
              {mode === "create" ? "Create secret room" : "Join with code"}
            </Button>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", mt: 1 }}>
              If you create a room, a unique secret room code will be generated immediately. The second user should enter their name and use the same code to join.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "grid", gap: 2 }}>
            <Paper sx={{ p: 2, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Connected as: {name}</Typography>
              <Typography sx={{ wordBreak: "break-all" }}>
                Room code: <strong>{roomCode}</strong>
              </Typography>
              <Button variant="outlined" size="small" sx={{ mt: 1 }} onClick={copyCode}>
                Copy room code
              </Button>
              <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.75)" }}>{peerStatus}</Typography>
            </Paper>

            <Paper sx={{ p: 2, background: "rgba(255,255,255,0.05)", minHeight: 420, maxHeight: 520, overflowY: "auto", borderRadius: 3 }}>
              {messages.length === 0 ? (
                <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                  No messages yet. Start the conversation.
                </Typography>
              ) : (
                messages.map((message) => {
                  const mine = message.from === name.trim();
                  return (
                    <Box key={message.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", mb: 1 }}>
                      <Paper sx={{ p: 1.5, maxWidth: "75%", background: mine ? "#2e7d32" : "rgba(255,255,255,0.08)", color: mine ? "#fff" : "#fff", borderRadius: 3 }}>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: "block", mb: 0.5 }}>
                          {message.from} • {new Date(message.ts).toLocaleTimeString()}
                        </Typography>
                        {mine && (
                          <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mb: 0.5, textAlign: "right" }}>
                            {message.delivered ? "Delivered" : "Sent"}
                          </Typography>
                        )}
                        <Typography>{message.text}</Typography>
                      </Paper>
                    </Box>
                  );
                })
              )}
              <div ref={messageEndRef} />
            </Paper>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <TextField
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Write your message..."
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                sx={{ background: "rgba(255,255,255,0.08)", borderRadius: 2 }}
              />
              <IconButton color="primary" onClick={sendMessage} sx={{ background: "rgba(255,255,255,0.08)", borderRadius: 2, p: 1.5 }}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        )}

        <Typography sx={{ mt: 3, color: "rgba(255,255,255,0.65)" }}>{status}</Typography>
      </Paper>
    </Box>
  );
}
