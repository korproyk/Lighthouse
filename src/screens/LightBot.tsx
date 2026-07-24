import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, ArrowRight, Sparkles, MessageCircle, BookOpen, Wind, Star } from 'lucide-react';
import Lumi from '../components/Lumi';
import { t } from '../lib/i18n';
import { api } from '../lib/supabase';

interface Message {
  id: string;
  from: 'user' | 'bot';
  text: string;
  type?: 'text' | 'breathing' | 'crisis' | 'challenge';
}

const quickChips = [
  { key: 'sad', label: 'lightbot.chip.sad' },
  { key: 'focus', label: 'lightbot.chip.focus' },
  { key: 'breathe', label: 'lightbot.chip.breathe' },
  { key: 'chat', label: 'lightbot.chip.chat' },
];

const cannedFlows: Record<string, Message[]> = {
  sad: [
    { id: 's1', from: 'bot', text: "I hear you. It's okay to feel sad sometimes. Can you tell me a bit more about what's going on?" },
    { id: 's2', from: 'bot', text: "Whatever it is, you don't have to face it alone. Sometimes just naming the feeling helps." },
    { id: 's3', from: 'bot', text: "Here's something gentle: close your eyes and take 3 slow breaths. In through your nose, out through your mouth. I'll wait." },
    { id: 's4', from: 'bot', text: "You're stronger than you think. And I'm always here when you need to talk." },
  ],
  focus: [
    { id: 'f1', from: 'bot', text: "Let's get you focused! First, put your phone face-down for 5 minutes. Just 5." },
    { id: 'f2', from: 'bot', text: "Here's a trick: write down the ONE thing you need to do next. Not the whole list. Just one." },
    { id: 'f3', from: 'bot', text: "Set a timer for 25 minutes. Work on that one thing. When it rings, take a 5-minute break. This is called Pomodoro." },
    { id: 'f4', from: 'bot', text: "You've got this. Come back and tell me how it went!" },
  ],
  breathe: [
    { id: 'b1', from: 'bot', text: "Let's do a breathing exercise together.", type: 'breathing' },
    { id: 'b2', from: 'bot', text: "That was great. How do you feel now? Even a tiny bit calmer counts." },
  ],
  chat: [
    { id: 'c1', from: 'bot', text: "Hey! What's on your mind today? I'm all ears (well, all lantern)." },
    { id: 'c2', from: 'bot', text: "Fun question: if you could be anywhere in the world right now, where would you go?" },
    { id: 'c3', from: 'bot', text: "Nice choice! I'd go to a lighthouse by the ocean. Obviously." },
  ],
};

const crisisKeywords = ['suicide', 'kill myself', 'end it', 'want to die', 'self harm', 'hurt myself'];

interface LightBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const friendIntro: Message[] = [
  { id: 'intro-1', from: 'bot', text: "Hey, are you feeling good today? Or is something weighing on you?" },
];

const longSupportiveReply = `Hey, I really hear you, and first of all — thank you for trusting me with this. It's okay to think like that. Whatever you're going through, please remember that your feelings are completely valid and you are not alone.

The most important thing: please talk to your parents about this as soon as you can. I know it can feel scary or awkward, but share it with them — they love you more than you know, and just saying it out loud to someone who cares about you takes a huge weight off your shoulders. You don't have to carry this by yourself.

While you work up to that conversation, let's try a small breathing practice together to release some of the tension. Try box breathing: breathe in through your nose for 4 seconds, hold for 4, breathe out through your mouth for 6, and pause for 2. Do this 4 or 5 times. You'll feel your shoulders drop and your mind quiet down a little.

Here are some other gentle things that really help when stress gets heavy:
• Step outside for 5-10 minutes of sunlight and a slow walk — even around the block.
• Drink a full glass of water. Stress dehydrates you faster than you think.
• Put your phone face-down for 20 minutes and do one thing with your hands — draw, stretch, tidy your desk, anything.
• Write down the one thing bothering you most, then the smallest next step you can take. Tiny wins count.
• Text or call one person who always makes you smile. Connection is medicine.
• Sleep. If today has been rough, give yourself permission to rest early tonight.

You're stronger than this moment, and this feeling will pass. I'm right here, like a friend, any time you need to talk. You've got this.`;

function getSessionId(): string {
  const key = 'lumi-chat-session';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}

export default function LightBot({ isOpen, onClose }: LightBotProps) {
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 'init', from: 'bot', text: friendIntro[0].text },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [flowIndex, setFlowIndex] = useState(0);
  const [activeFlow, setActiveFlow] = useState<string | null>(null);
  const [replyTurn, setReplyTurn] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(getSessionId());

  const persist = async (role: 'user' | 'bot', content: string) => {
    await api.chatMessages.insert({
      session_id: sessionIdRef.current,
      role,
      content,
    });
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessages = (msgs: Message[], startIdx: number) => {
    let delay = 0;
    msgs.slice(startIdx, startIdx + 1).forEach((msg) => {
      delay += 1200;
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, msg]);
        }, 800);
      }, delay);
    });
  };

  const handleChip = (key: string) => {
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text: t(`lightbot.chip.${key}`) };
    setMessages((prev) => [...prev, userMsg]);
    setActiveFlow(key);
    setFlowIndex(0);
    addBotMessages(cannedFlows[key] ?? [], 0);
    setFlowIndex(1);
  };

  const sendBot = (text: string, type?: Message['type']) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const msg: Message = { id: `bot-${Date.now()}-${Math.random()}`, from: 'bot', text, type };
      setMessages((prev) => [...prev, msg]);
      persist('bot', text);
    }, 1200);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    const userMsg: Message = { id: `u-${Date.now()}`, from: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    persist('user', text);
    setInput('');

    if (crisisKeywords.some((kw) => text.toLowerCase().includes(kw))) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: `crisis-${Date.now()}`, from: 'bot', text: '', type: 'crisis' },
        ]);
      }, 500);
      return;
    }

    if (activeFlow && cannedFlows[activeFlow] && flowIndex < cannedFlows[activeFlow].length) {
      addBotMessages(cannedFlows[activeFlow], flowIndex);
      setFlowIndex((prev) => prev + 1);
      return;
    }

    // First user reply after the intro question → send the long supportive message
    if (replyTurn === 0) {
      sendBot(longSupportiveReply);
      setTimeout(() => sendBot("Want to try a breathing exercise with me right now?", 'breathing'), 2800);
      setReplyTurn(1);
      return;
    }

    // Follow-up turns: gentle encouragement
    const followUps = [
      "I'm proud of you for opening up. Have you thought about when you can talk with your parents — maybe tonight over dinner?",
      "That's completely understandable. Take it one small step at a time. I'm here whenever you need me.",
      "You are doing better than you think. Remember: breathe, talk to someone who loves you, and be gentle with yourself today.",
    ];
    sendBot(followUps[Math.min(replyTurn - 1, followUps.length - 1)]);
    setReplyTurn((r) => r + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col max-w-[440px] mx-auto overflow-hidden"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            background:
              'radial-gradient(ellipse at 10% 0%, rgba(255, 178, 122, 0.55), transparent 55%),' +
              'radial-gradient(ellipse at 90% 100%, rgba(255, 77, 106, 0.35), transparent 55%),' +
              '#FAF7F2',
          }}
        >
          {/* Ambient blobs */}
          <motion.div
            className="aurora-blob"
            style={{ width: 360, height: 360, top: '-10%', left: '-18%', background: 'radial-gradient(circle, #FFB27A 0%, transparent 70%)', opacity: 0.55 }}
            animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="aurora-blob"
            style={{ width: 320, height: 320, bottom: '-10%', right: '-14%', background: 'radial-gradient(circle, #FF4D6A 0%, transparent 70%)', opacity: 0.3 }}
            animate={{ x: [0, -24, 0], y: [0, -30, 0] }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="noise-overlay" />

          {/* Header */}
          <div
            className="relative flex items-center justify-between px-5 py-3"
            style={{ paddingTop: 'calc(12px + env(safe-area-inset-top))', zIndex: 2 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full hero-glow blur-lg opacity-60 scale-110" />
                <div className="relative w-11 h-11 rounded-full hero-glow flex items-center justify-center shadow-medium ring-2 ring-white">
                  <Lumi pose="headphones" size={28} animate={false} />
                </div>
              </div>
              <div>
                <p className="font-display font-bold text-body text-ink-900 tracking-tight">
                  {t('lightbot.title')}
                </p>
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-mint-500"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="text-[11px] text-mint-700 font-bold">{t('lightbot.online')}</span>
                </div>
              </div>
            </div>
            <motion.button
              className="w-9 h-9 rounded-full glass flex items-center justify-center focus-ring"
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              aria-label="Close"
            >
              <X size={18} className="text-ink-900" />
            </motion.button>
          </div>

          {/* Intro screen or Chat */}
          {!chatStarted ? (
            <IntroScreen onStart={() => setChatStarted(true)} />
          ) : (
            <>
              {/* Messages */}
              <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3 selectable" style={{ zIndex: 2 }}>
                {messages.map((msg) => {
                  if (msg.type === 'crisis') {
                    return (
                      <motion.div
                        key={msg.id}
                        className="relative overflow-hidden p-4 rounded-card glass-strong border-2 border-coral-500/30"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div
                          className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none"
                          style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.45), transparent 70%)', filter: 'blur(22px)' }}
                        />
                        <p className="relative font-display font-bold text-body text-coral-600 mb-2">
                          You're not alone. Help is available.
                        </p>
                        <div className="relative space-y-2 text-caption">
                          <p className="text-ink-900">{'\u{1F1E7}\u{1F1E9}'} Bangladesh: Kaan Pete Roi — 01779-554391</p>
                          <p className="text-ink-900">{'\u{1F1F0}\u{1F1F7}'} Korea: 1577-0199</p>
                          <p className="text-ink-900">{'\u{1F30D}'} Crisis Text Line: Text HOME to 741741</p>
                        </div>
                        <p className="relative mt-3 text-caption text-ink-600">
                          These are verified, confidential helplines. You matter.
                        </p>
                      </motion.div>
                    );
                  }

                  if (msg.type === 'breathing') {
                    return (
                      <div key={msg.id} className="flex items-start gap-2">
                        <BotAvatar />
                        <motion.div
                          className="relative overflow-hidden p-4 rounded-[20px] rounded-tl-[4px] glass-strong max-w-[85%]"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <div
                            className="absolute -top-10 -right-10 w-28 h-28 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.5), transparent 70%)', filter: 'blur(20px)' }}
                          />
                          <p className="relative text-body text-ink-900 mb-3">{msg.text}</p>
                          <BreathingCircle />
                        </motion.div>
                      </div>
                    );
                  }

                  if (msg.from === 'bot') {
                    return (
                      <div key={msg.id} className="flex items-start gap-2">
                        <BotAvatar />
                        <motion.div
                          className="relative overflow-hidden p-3.5 rounded-[20px] rounded-tl-[4px] glass-strong max-w-[85%]"
                          initial={{ opacity: 0, scale: 0.95, y: 5 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                        >
                          <div
                            className="absolute -top-8 -right-8 w-20 h-20 rounded-full pointer-events-none"
                            style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.4), transparent 70%)', filter: 'blur(16px)' }}
                          />
                          <p className="relative text-body text-ink-900 whitespace-pre-line">{msg.text}</p>
                        </motion.div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex justify-end">
                      <motion.div
                        className="relative overflow-hidden p-3.5 rounded-[20px] rounded-tr-[4px] hero-glow max-w-[85%] shadow-soft"
                        initial={{ opacity: 0, scale: 0.95, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                      >
                        <div
                          className="absolute -top-8 -right-8 w-24 h-24 rounded-full pointer-events-none"
                          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)', filter: 'blur(16px)' }}
                        />
                        <p className="relative text-body text-white font-medium">{msg.text}</p>
                      </motion.div>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-start gap-2">
                    <BotAvatar />
                    <div className="p-3.5 rounded-[20px] rounded-tl-[4px] glass-strong flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-lighthouse-500 typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-lighthouse-500 typing-dot" />
                      <div className="w-2 h-2 rounded-full bg-lighthouse-500 typing-dot" />
                    </div>
                  </div>
                )}
              </div>

              {/* Quick chips */}
              {messages.length <= 2 && (
                <div className="relative px-4 py-2 flex gap-2 overflow-x-auto scrollbar-none" style={{ zIndex: 2 }}>
                  {quickChips.map((chip) => (
                    <motion.button
                      key={chip.key}
                      className="whitespace-nowrap px-4 py-2 rounded-capsule glass-strong text-caption font-bold text-ink-900"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleChip(chip.key)}
                    >
                      {t(chip.label)}
                    </motion.button>
                  ))}
                </div>
              )}

              {/* Composer */}
              <div
                className="relative px-4 py-3 flex items-center gap-2"
                style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 2 }}
              >
                <button className="w-10 h-10 rounded-full glass flex items-center justify-center focus-ring" aria-label="Voice input">
                  <Mic size={18} className="text-ink-600" />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={t('lightbot.placeholder')}
                  className="flex-1 py-3 px-4 rounded-capsule glass-strong text-body text-ink-900 placeholder:text-ink-300 focus-ring"
                />
                <motion.button
                  className={`w-10 h-10 rounded-full flex items-center justify-center focus-ring shadow-soft ${
                    input.trim() ? 'hero-glow' : 'glass'
                  }`}
                  whileTap={{ scale: 0.93 }}
                  onClick={handleSend}
                  aria-label="Send"
                >
                  <Send size={18} className={input.trim() ? 'text-white' : 'text-ink-300'} />
                </motion.button>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BotAvatar() {
  return (
    <div className="relative w-8 h-8 flex-shrink-0 mt-1">
      <div className="absolute inset-0 rounded-full hero-glow blur-sm opacity-50 scale-110" />
      <div className="relative w-8 h-8 rounded-full hero-glow flex items-center justify-center ring-1 ring-white shadow-soft">
        <Lumi pose="headphones" size={22} animate={false} />
      </div>
    </div>
  );
}

function IntroScreen({ onStart }: { onStart: () => void }) {
  const features = [
    { Icon: MessageCircle, label: 'Emotional support', color: 'text-coral-500' },
    { Icon: BookOpen, label: 'Study help', color: 'text-lighthouse-600' },
    { Icon: Wind, label: 'Breathing exercises', color: 'text-mint-500' },
    { Icon: Star, label: 'Daily motivation', color: 'text-lighthouse-500' },
  ];

  return (
    <div className="relative flex-1 flex flex-col px-6 pb-6" style={{ zIndex: 2 }}>
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          className="relative w-full max-w-[340px] rounded-hero glass-strong overflow-hidden p-6"
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        >
          <div
            className="absolute -top-20 -right-20 w-60 h-60 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.6), transparent 70%)', filter: 'blur(28px)' }}
          />
          <div
            className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,77,106,0.35), transparent 70%)', filter: 'blur(28px)' }}
          />

          <div className="relative flex flex-col items-center text-center">
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full hero-glow blur-2xl opacity-60"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative w-24 h-24 rounded-full hero-glow flex items-center justify-center ring-4 ring-white shadow-medium">
                <Lumi pose="headphones" size={72} />
              </div>
              <motion.div
                className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-soft"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <Sparkles size={14} className="text-lighthouse-500" strokeWidth={2.5} fill="currentColor" />
              </motion.div>
            </div>

            <p className="mt-4 text-micro uppercase tracking-[0.18em] text-ink-600 font-bold">
              Always in your corner
            </p>
            <h2 className="mt-1 font-display font-bold text-display-l text-ink-900 tracking-tight">
              {t('lightbot.title')}
            </h2>
            <p className="mt-3 text-body text-ink-600 leading-relaxed">
              {t('lightai.intro')}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 w-full">
              {features.map((f, i) => {
                const Icon = f.Icon;
                return (
                  <motion.div
                    key={f.label}
                    className="flex items-center gap-2 p-2.5 rounded-capsule glass"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.06 }}
                  >
                    <Icon size={14} className={f.color} strokeWidth={2.5} />
                    <span className="text-[11px] font-bold text-ink-900 truncate">{f.label}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.button
        className="w-full py-4 rounded-capsule hero-glow text-white font-display font-bold text-title shadow-medium flex items-center justify-center gap-2 shine"
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {t('lightai.start')}
        <ArrowRight size={20} strokeWidth={2.5} />
      </motion.button>

      <motion.p
        className="mt-3 text-[11px] text-ink-600 text-center max-w-[300px] mx-auto leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Lumi is not a replacement for professional help. If you're in crisis, verified helplines are always available.
      </motion.p>
    </div>
  );
}

function BreathingCircle() {
  return (
    <div className="flex justify-center py-4 relative">
      <motion.div
        className="w-20 h-20 rounded-full hero-glow shadow-medium"
        animate={{
          scale: [1, 1.5, 1.5, 1],
          opacity: [0.7, 1, 1, 0.7],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          times: [0, 0.25, 0.5, 1],
          ease: 'easeInOut',
        }}
      />
      <motion.p
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-caption font-bold text-white pointer-events-none"
        animate={{ opacity: [1, 1, 0, 1] }}
        transition={{ duration: 8, repeat: Infinity, times: [0, 0.4, 0.5, 1] }}
      >
        Breathe
      </motion.p>
    </div>
  );
}
