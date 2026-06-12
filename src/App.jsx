import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE = {
  participants: "spin-wheel-participants-v2",
  theme: "spin-wheel-theme-v2",
  scores: "spin-wheel-scores-v2"
};

const GAMES = [
  {
    emoji: "😂",
    name: "Tell Wrong Answer",
    rules:
      "1. Player 1 asks any question.\n2. Player 2 must intentionally give a funny or completely wrong answer.\n3. The more creative and humorous the wrong answer, the better the game becomes."
  },
  {
    emoji: "🎵",
    name: "Tell Any Word & Sing a Song",
    rules:
      "1. Player 1 says any random word.\n2. Player 2 must sing a song related to that word.\n3. The song must match the given word and continue for the required count or duration."
  },
  {
    emoji: "🎭",
    name: "Guess the Person",
    rules:
      "1. This game is played by two players.\n2. Player 1 must act, imitate, or say a famous dialogue, unique identity, or clue related to an actor, actress, celebrity, or famous person.\n3. Player 2 must guess the correct person based on the clues."
  },
  {
    emoji: "🧠",
    name: "Guess the Word",
    rules:
      "1. Both players think of a secret word.\n2. Each player must try to guess the other player's word.\n3. Players can give hints, share clues, or ask questions to identify the opposite player's word."
  }
];

// ── SVG Wheel helpers ────────────────────────────────────────────
const W_CX = 250, W_CY = 250, W_R = 240;

const WHEEL_LABEL_LINES = [
  ["Tell Wrong", "Answer"],
  ["Sing a Song"],
  ["Guess the", "Person"],
  ["Guess the", "Word"],
];

function wheelSegPath(i) {
  const a0 = ((-90 + i * 90) * Math.PI) / 180;
  const a1 = ((-90 + (i + 1) * 90) * Math.PI) / 180;
  const x1 = (W_CX + W_R * Math.cos(a0)).toFixed(2);
  const y1 = (W_CY + W_R * Math.sin(a0)).toFixed(2);
  const x2 = (W_CX + W_R * Math.cos(a1)).toFixed(2);
  const y2 = (W_CY + W_R * Math.sin(a1)).toFixed(2);
  return `M${W_CX},${W_CY} L${x1},${y1} A${W_R},${W_R},0,0,1,${x2},${y2} Z`;
}

function wheelTextPos(i) {
  const midDeg = -90 + i * 90 + 45;
  const mid = (midDeg * Math.PI) / 180;
  // Flip left-side segments so text is never upside-down
  const rotation = midDeg > 90 && midDeg <= 270 ? midDeg + 180 : midDeg;
  return {
    x: W_CX + 152 * Math.cos(mid),
    y: W_CY + 152 * Math.sin(mid),
    rotation,
  };
}
// ─────────────────────────────────────────────────────────────────

function hashCode(text) {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) {
    h = (h << 5) - h + text.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function initials(name) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

function avatarGradient(name) {
  const palette = [
    ["#ff6b6b", "#feca57"],
    ["#4d96ff", "#6bcBef"],
    ["#845ef7", "#5c7cfa"],
    ["#20c997", "#69db7c"],
    ["#ff922b", "#ffd43b"],
    ["#f06595", "#cc5de8"]
  ];
  return palette[hashCode(name) % palette.length];
}

function avatarImage(name) {
  return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
}

export default function App() {
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState({});
  const [players, setPlayers] = useState({ p1: null, p2: null });
  const [nameInputs, setNameInputs] = useState(Array(20).fill(""));

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedGameIndex, setSelectedGameIndex] = useState(null);
  const [lastGameIndex, setLastGameIndex] = useState(-1);
  const [glowWheel, setGlowWheel] = useState(false);
  const [stage, setStage] = useState("spin");

  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState("");
  const [selecting, setSelecting] = useState({ p1: false, p2: false });
  const [duelHype, setDuelHype] = useState(false);

  const wheelRef = useRef(null);
  const confettiRef = useRef(null);
  const toastTimerRef = useRef(null);
  const hypeTimerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const spinTickTimerRef = useRef(null);
  const playerTimerRef = useRef({ p1: null, p2: null });

  const selectedGame = selectedGameIndex === null ? null : GAMES[selectedGameIndex];

  useEffect(() => {
    try {
      const rawParticipants = localStorage.getItem(STORAGE.participants);
      const savedParticipants = rawParticipants ? JSON.parse(rawParticipants) : [];
      const normalizedParticipants = Array.isArray(savedParticipants)
        ? savedParticipants.filter(Boolean).slice(0, 20)
        : [];
      setParticipants(normalizedParticipants);

      const rawScores = localStorage.getItem(STORAGE.scores);
      const savedScores = rawScores ? JSON.parse(rawScores) : {};
      setScores(savedScores && typeof savedScores === "object" ? savedScores : {});

      const savedTheme = localStorage.getItem(STORAGE.theme);
      setDarkMode(savedTheme === "dark");
    } catch {
      setParticipants([]);
      setScores({});
      setDarkMode(false);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem(STORAGE.theme, "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem(STORAGE.theme, "light");
    }
  }, [darkMode]);

  useEffect(() => {
    return () => {
      if (spinTickTimerRef.current) {
        clearInterval(spinTickTimerRef.current);
      }
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      if (hypeTimerRef.current) {
        clearTimeout(hypeTimerRef.current);
      }
      if (playerTimerRef.current.p1) {
        clearInterval(playerTimerRef.current.p1);
      }
      if (playerTimerRef.current.p2) {
        clearInterval(playerTimerRef.current.p2);
      }
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowParticipantsModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const scoreP1 = useMemo(() => (players.p1 ? Number(scores[players.p1] || 0) : 0), [players.p1, scores]);
  const scoreP2 = useMemo(() => (players.p2 ? Number(scores[players.p2] || 0) : 0), [players.p2, scores]);

  const showToast = (message) => {
    setToast(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => setToast(""), 1700);
  };

  const persistParticipants = (list) => {
    localStorage.setItem(STORAGE.participants, JSON.stringify(list));
  };

  const persistScores = (nextScores) => {
    localStorage.setItem(STORAGE.scores, JSON.stringify(nextScores));
  };

  const setAvatarProps = (name, fallbackText) => {
    if (!name) {
      return {
        text: fallbackText,
        image: null,
        background: "linear-gradient(135deg, #9db4d9, #7288b0)"
      };
    }
    const [a, b] = avatarGradient(name);
    return {
      text: initials(name),
      image: avatarImage(name),
      background: `linear-gradient(135deg, ${a}, ${b})`
    };
  };

  const openParticipantsModal = () => {
    const nextInputs = Array.from({ length: 20 }, (_, i) => participants[i] || "");
    setNameInputs(nextInputs);
    setShowParticipantsModal(true);
  };

  const saveParticipantsFromModal = () => {
    const values = nameInputs.map((v) => v.trim()).filter(Boolean).slice(0, 20);
    const unique = [];
    for (const name of values) {
      if (!unique.includes(name)) {
        unique.push(name);
      }
    }
    unique.splice(20);

    const nextPlayers = {
      p1: unique.includes(players.p1) ? players.p1 : null,
      p2: unique.includes(players.p2) ? players.p2 : null
    };

    setParticipants(unique);
    setPlayers(nextPlayers);
    persistParticipants(unique);
    setShowParticipantsModal(false);
    showToast("Participants saved");
  };

  const playSpinTick = () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) {
          return;
        }
        audioCtxRef.current = new Ctx();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.value = 760 + Math.random() * 220;
      gain.gain.value = 0.032;

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {
      // Audio may be blocked by browser and app should still function.
    }
  };

  const startSpinSound = () => {
    if (spinTickTimerRef.current) {
      clearInterval(spinTickTimerRef.current);
    }
    spinTickTimerRef.current = setInterval(playSpinTick, 105);
  };

  const stopSpinSound = () => {
    if (spinTickTimerRef.current) {
      clearInterval(spinTickTimerRef.current);
      spinTickTimerRef.current = null;
    }
  };

  const getWheelTargetRotation = (index, currentRotation) => {
    const center = index * 90 + 45;
    const desired = (360 - center) % 360;
    const current = ((currentRotation % 360) + 360) % 360;
    const delta = (desired - current + 360) % 360;
    const rounds = Math.floor(Math.random() * 3) + 6;
    return currentRotation + rounds * 360 + delta;
  };

  const runConfetti = () => {
    const canvas = confettiRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#ff4d7e", "#ffd166", "#2fd6a9", "#4d96ff", "#b57dff", "#ff9248"];

    for (let i = 0; i < 120; i += 1) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * canvas.height * 0.2,
        vy: 2 + Math.random() * 3.2,
        vx: -1.7 + Math.random() * 3.4,
        r: 3 + Math.random() * 5,
        a: Math.random() * Math.PI,
        va: -0.2 + Math.random() * 0.4,
        c: colors[Math.floor(Math.random() * colors.length)]
      });
    }

    const start = performance.now();
    const life = 1650;

    const frame = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.65);
        ctx.restore();
      }

      if (now - start < life) {
        requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    requestAnimationFrame(frame);
  };

  const spinWheel = () => {
    if (spinning) {
      return;
    }

    setSpinning(true);

    let index = Math.floor(Math.random() * GAMES.length);
    while (index === lastGameIndex && GAMES.length > 1) {
      index = Math.floor(Math.random() * GAMES.length);
    }

    const target = getWheelTargetRotation(index, rotation);
    startSpinSound();
    setGlowWheel(false);

    requestAnimationFrame(() => {
      setRotation(target);
    });

    const wheel = wheelRef.current;
    if (!wheel) {
      return;
    }

    const onDone = () => {
      stopSpinSound();
      setSpinning(false);
      setSelectedGameIndex(index);
      setLastGameIndex(index);
      setGlowWheel(true);
      runConfetti();
    };

    wheel.addEventListener("transitionend", onDone, { once: true });
  };

  const animatePickBoth = () => {
    if (selecting.p1 || selecting.p2) {
      return;
    }

    if (participants.length < 2) {
      showToast("Add at least 2 participants");
      return;
    }

    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const finalP1 = shuffled[0];
    const finalP2 = shuffled.find((name) => name !== finalP1);

    if (!finalP1 || !finalP2) {
      showToast("Need 2 different participants");
      return;
    }

    if (playerTimerRef.current.p1) {
      clearInterval(playerTimerRef.current.p1);
    }
    if (playerTimerRef.current.p2) {
      clearInterval(playerTimerRef.current.p2);
    }
    if (hypeTimerRef.current) {
      clearTimeout(hypeTimerRef.current);
      hypeTimerRef.current = null;
    }

    setDuelHype(false);
    setSelecting({ p1: true, p2: true });

    const start = Date.now();
    const p1Duration = 2300;
    const p2Duration = 2550;

    playerTimerRef.current.p1 = setInterval(() => {
      const randomName = participants[Math.floor(Math.random() * participants.length)];
      setPlayers((prev) => ({ ...prev, p1: randomName }));

      if (Date.now() - start >= p1Duration) {
        clearInterval(playerTimerRef.current.p1);
        playerTimerRef.current.p1 = null;
        setPlayers((prev) => ({ ...prev, p1: finalP1 }));
        setSelecting((prev) => ({ ...prev, p1: false }));
      }
    }, 82);

    playerTimerRef.current.p2 = setInterval(() => {
      const pool = participants.filter((name) => name !== finalP1);
      const randomName = pool[Math.floor(Math.random() * pool.length)];
      setPlayers((prev) => ({ ...prev, p2: randomName }));

      if (Date.now() - start >= p2Duration) {
        clearInterval(playerTimerRef.current.p2);
        playerTimerRef.current.p2 = null;
        setPlayers((prev) => ({ ...prev, p2: finalP2 }));
        setSelecting((prev) => ({ ...prev, p2: false }));
        setDuelHype(true);
        hypeTimerRef.current = setTimeout(() => {
          setDuelHype(false);
          hypeTimerRef.current = null;
        }, 1700);
      }
    }, 94);
  };

  const restartGame = () => {
    setRotation(0);
    setSpinning(false);
    setSelectedGameIndex(null);
    setLastGameIndex(-1);
    setPlayers({ p1: null, p2: null });
    setGlowWheel(false);
    setStage("spin");
    showToast("Game reset");
  };

  const avatarP1 = setAvatarProps(players.p1, "P1");
  const avatarP2 = setAvatarProps(players.p2, "P2");

  return (
    <>
      <div className="bg-blur bg-one" aria-hidden="true" />
      <div className="bg-blur bg-two" aria-hidden="true" />
      <canvas ref={confettiRef} id="confetti" />

      <div className="top-actions">
        <div className="top-left">
          <button onClick={openParticipantsModal} className="control-btn" type="button">
            Add Participants
          </button>
        </div>
        <div className="top-right">
          <button onClick={() => setDarkMode((prev) => !prev)} className="control-btn" type="button">
            {darkMode ? "Light" : "Dark"}
          </button>
          <button onClick={restartGame} className="control-btn" type="button">
            Restart
          </button>
        </div>
      </div>

      <main className="app">
        {stage === "spin" ? (
          <section className="glass main-card spin-home">
            <h1>Spin Wheel Game</h1>
            <p className="sub">Spin to pick your challenge, then tap Play Game.</p>

            <div className="wheel-wrap">
              <div className="pointer" aria-hidden="true" />
              <div className="wheel-frame">
                <div
                  ref={wheelRef}
                  className={`wheel ${spinning ? "is-spinning" : ""} ${glowWheel ? "glow" : ""}`}
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 500 500" className="wheel-svg" aria-hidden="true">
                    <defs>
                      <radialGradient id="sg0" cx="68%" cy="28%" r="75%">
                        <stop offset="0%" stopColor="#FF8FB3" />
                        <stop offset="100%" stopColor="#C2185B" />
                      </radialGradient>
                      <radialGradient id="sg1" cx="68%" cy="28%" r="75%">
                        <stop offset="0%" stopColor="#B49BFC" />
                        <stop offset="100%" stopColor="#4C1D95" />
                      </radialGradient>
                      <radialGradient id="sg2" cx="68%" cy="28%" r="75%">
                        <stop offset="0%" stopColor="#5FD3F6" />
                        <stop offset="100%" stopColor="#0369A1" />
                      </radialGradient>
                      <radialGradient id="sg3" cx="68%" cy="28%" r="75%">
                        <stop offset="0%" stopColor="#FDE68A" />
                        <stop offset="100%" stopColor="#B45309" />
                      </radialGradient>
                      <radialGradient id="glossy" cx="38%" cy="18%" r="64%">
                        <stop offset="0%" stopColor="white" stopOpacity="0.55" />
                        <stop offset="48%" stopColor="white" stopOpacity="0.07" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Segments */}
                    {GAMES.map((game, i) => (
                      <path
                        key={game.name}
                        d={wheelSegPath(i)}
                        fill={`url(#sg${i})`}
                        className={selectedGameIndex === i ? "seg-win" : ""}
                      />
                    ))}

                    {/* Divider lines */}
                    {[0, 1, 2, 3].map((i) => {
                      const a = ((-90 + i * 90) * Math.PI) / 180;
                      return (
                        <line
                          key={i}
                          x1="250" y1="250"
                          x2={(250 + 240 * Math.cos(a)).toFixed(2)}
                          y2={(250 + 240 * Math.sin(a)).toFixed(2)}
                          stroke="rgba(255,255,255,0.85)"
                          strokeWidth="3.5"
                        />
                      );
                    })}

                    {/* Labels */}
                    {GAMES.map((game, i) => {
                      const { x, y, rotation } = wheelTextPos(i);
                      const lines = WHEEL_LABEL_LINES[i];
                      return (
                        <g
                          key={game.name + "-lbl"}
                          transform={`translate(${x.toFixed(1)},${y.toFixed(1)}) rotate(${rotation})`}
                        >
                          <text
                            y="-28"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="26"
                            style={{ userSelect: "none" }}
                          >
                            {game.emoji}
                          </text>
                          {lines.map((line, li) => (
                            <text
                              key={li}
                              y={li * 17 + 2}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="14"
                              fontWeight="800"
                              fill="#ffffff"
                              style={{
                                fontFamily: "'Plus Jakarta Sans','Space Grotesk',sans-serif",
                                letterSpacing: "0.03em",
                                filter: "drop-shadow(0 1px 4px rgba(0,0,0,0.7))",
                              }}
                            >
                              {line}
                            </text>
                          ))}
                        </g>
                      );
                    })}

                    {/* Glossy shimmer overlay */}
                    <circle cx="250" cy="250" r="240" fill="url(#glossy)" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="action-row">
              <button onClick={spinWheel} disabled={spinning} className="spin-btn" type="button">
                {spinning ? "SPINNING..." : "SPIN"}
              </button>
              <button
                onClick={() => {
                  if (selectedGameIndex === null) {
                    showToast("Spin first to select a game");
                    return;
                  }
                  setStage("game");
                }}
                className={`play-btn ${selectedGameIndex !== null ? "show" : ""}`}
                type="button"
              >
                Play Game
              </button>
            </div>

            <div className="result">
              {selectedGame ? `${selectedGame.emoji} ${selectedGame.name}` : "Spin to randomly select a game"}
            </div>
          </section>
        ) : (
          <section className="game-stage-wrap">
            {/* Floating background orbs */}
            <div className="gs-orb gs-orb1" aria-hidden="true" />
            <div className="gs-orb gs-orb2" aria-hidden="true" />
            <div className="gs-orb gs-orb3" aria-hidden="true" />

            {/* ── Header ── */}
            <div className="gs-header">
              <button onClick={() => setStage("spin")} className="gs-back-btn" type="button">
                ← Back
              </button>
              <div className="gs-title-wrap">
                <span className="gs-title-emoji">{selectedGame?.emoji ?? "🎮"}</span>
                <h2 className="gs-title-text">{selectedGame?.name ?? "Selected Game"}</h2>
              </div>
              <div />
            </div>

            {/* ── Rules card ── */}
            <div className="gs-rules-card">
              <div className="gs-rules-header">
                <span className="gs-rules-icon">📋</span>
                <span className="gs-rules-label">Game Rules</span>
              </div>
              <ul className="gs-rules-list">
                {(selectedGame?.rules ?? "").split("\n").filter(Boolean).map((line, i) => (
                  <li key={i} className="gs-rule-item">
                    <span className="gs-rule-dot" />
                    {line.replace(/^[-•]\s*/, "")}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Battle arena ── */}
            <div className="gs-arena">
              {/* Energy line */}
              <div className={`gs-energy-line ${selecting.p1 || selecting.p2 ? "active" : ""}`} aria-hidden="true" />

              {/* P1 card */}
              <article className={`gs-player-card ${selecting.p1 ? "gs-selecting" : ""} ${players.p1 && !selecting.p1 ? "gs-chosen" : ""}`}>
                <div className="gs-avatar-ring">
                  <div className="gs-avatar" style={{ background: avatarP1.background }}>
                    {avatarP1.image
                      ? <img src={avatarP1.image} alt={players.p1 ?? "P1"} className="gs-avatar-img" />
                      : <span className="gs-avatar-initials">{avatarP1.text}</span>}
                  </div>
                  <div className="gs-avatar-glow" style={{ background: avatarP1.background }} />
                </div>
                <div className="gs-player-label">
                  <span className="gs-player-num">PLAYER 1</span>
                  <span className="gs-player-name">{players.p1 || "—"}</span>
                  <span className={`gs-status-dot ${selecting.p1 ? "gs-status-picking" : players.p1 ? "gs-status-ready" : "gs-status-idle"}`}>
                    {selecting.p1 ? "Picking…" : players.p1 ? "Ready" : "Waiting"}
                  </span>
                </div>
              </article>

              {/* VS Badge */}
              <div className={`gs-vs-badge ${selecting.p1 || selecting.p2 ? "gs-vs-active" : ""}`}>
                <div className="gs-vs-inner">
                  <div className="gs-vs-fighters">
                    <div className="gs-vs-mini" style={{ background: avatarP1.background }}>
                      {avatarP1.image ? <img src={avatarP1.image} alt="" className="gs-avatar-img" /> : <span>{avatarP1.text}</span>}
                    </div>
                    <div className="gs-vs-mini" style={{ background: avatarP2.background }}>
                      {avatarP2.image ? <img src={avatarP2.image} alt="" className="gs-avatar-img" /> : <span>{avatarP2.text}</span>}
                    </div>
                  </div>
                  <span className="gs-vs-text">VS</span>
                </div>
              </div>

              {/* P2 card */}
              <article className={`gs-player-card ${selecting.p2 ? "gs-selecting" : ""} ${players.p2 && !selecting.p2 ? "gs-chosen" : ""}`}>
                <div className="gs-avatar-ring">
                  <div className="gs-avatar" style={{ background: avatarP2.background }}>
                    {avatarP2.image
                      ? <img src={avatarP2.image} alt={players.p2 ?? "P2"} className="gs-avatar-img" />
                      : <span className="gs-avatar-initials">{avatarP2.text}</span>}
                  </div>
                  <div className="gs-avatar-glow" style={{ background: avatarP2.background }} />
                </div>
                <div className="gs-player-label">
                  <span className="gs-player-num">PLAYER 2</span>
                  <span className="gs-player-name">{players.p2 || "—"}</span>
                  <span className={`gs-status-dot ${selecting.p2 ? "gs-status-picking" : players.p2 ? "gs-status-ready" : "gs-status-idle"}`}>
                    {selecting.p2 ? "Picking…" : players.p2 ? "Ready" : "Waiting"}
                  </span>
                </div>
              </article>
            </div>

            {/* Hype banner */}
            <div className={`gs-hype ${duelHype ? "gs-hype-show" : ""}`} aria-live="polite">
              🎉 WOW! LET'S PLAY! 🎉
            </div>

            {/* Choose button */}
            <div className="gs-actions">
              <button
                onClick={animatePickBoth}
                className={`gs-choose-btn ${selecting.p1 || selecting.p2 ? "gs-choose-running" : ""}`}
                disabled={selecting.p1 || selecting.p2}
                type="button"
              >
                <span className="gs-choose-icon">{selecting.p1 || selecting.p2 ? "⚡" : "🎲"}</span>
                <span>{selecting.p1 || selecting.p2 ? "Choosing Players…" : "Choose Players"}</span>
              </button>
            </div>
          </section>
        )}
      </main>

      <section
        className={`overlay ${showParticipantsModal ? "show" : ""}`}
        aria-hidden={!showParticipantsModal}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setShowParticipantsModal(false);
          }
        }}
      >
        <article className="modal">
          <h3>Add Participants</h3>
          <p className="modal-sub">Enter up to 20 participant names.</p>
          <div className="name-grid">
            {nameInputs.map((value, index) => (
              <input
                key={index}
                type="text"
                maxLength={24}
                placeholder={`Player ${index + 1}`}
                value={value}
                onChange={(event) => {
                  const next = [...nameInputs];
                  next[index] = event.target.value;
                  setNameInputs(next);
                }}
              />
            ))}
          </div>
          <div className="modal-actions">
            <button onClick={() => setShowParticipantsModal(false)} className="ghost-btn" type="button">
              Cancel
            </button>
            <button onClick={saveParticipantsFromModal} className="solid-btn" type="button">
              Save
            </button>
          </div>
        </article>
      </section>

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </>
  );
}
