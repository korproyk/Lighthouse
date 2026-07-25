import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Copy, ArrowRight } from 'lucide-react';
import { useStore } from '../lib/store';
import { t } from '../lib/i18n';
import Lumi from './Lumi';
import BottomSheet from './BottomSheet';
import { challengeGroups } from '../lib/mockData';
import type { ChallengeGroup } from '../lib/mockData';

export default function GroupsPanel() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ChallengeGroup | null>(null);

  return (
    <>
      <GroupsView
        onCreateGroup={() => setShowCreateGroup(true)}
        onJoinGroup={() => setShowJoinGroup(true)}
        onSelectGroup={setSelectedGroup}
      />
      <CreateGroupSheet isOpen={showCreateGroup} onClose={() => setShowCreateGroup(false)} />
      <JoinGroupSheet isOpen={showJoinGroup} onClose={() => setShowJoinGroup(false)} />
      <GroupDetailSheet group={selectedGroup} onClose={() => setSelectedGroup(null)} />
    </>
  );
}

function GroupsView({
  onCreateGroup, onJoinGroup, onSelectGroup,
}: {
  onCreateGroup: () => void;
  onJoinGroup: () => void;
  onSelectGroup: (g: ChallengeGroup) => void;
}) {
  const { joinedGroupId, joinGroup, customGroups, user } = useStore();
  const inAGroup = Boolean(joinedGroupId);
  const allGroups = [...customGroups, ...challengeGroups];

  return (
    <div className="px-6 mt-5">
      <div className="flex gap-3">
        <motion.button
          className={`flex-1 py-3.5 rounded-capsule font-display font-bold text-caption flex items-center justify-center gap-2 ${
            inAGroup
              ? 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
              : 'hero-glow text-white shadow-soft'
          }`}
          whileTap={inAGroup ? undefined : { scale: 0.97 }}
          onClick={onCreateGroup}
          disabled={inAGroup}
          aria-disabled={inAGroup}
        >
          <Plus size={16} />
          {t('challenges.create_group')}
        </motion.button>
        <motion.button
          className={`flex-1 py-3.5 rounded-capsule font-display font-bold text-caption flex items-center justify-center gap-2 ${
            inAGroup
              ? 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
              : 'glass-strong text-ink-900 dark:text-ink-100'
          }`}
          whileTap={inAGroup ? undefined : { scale: 0.97 }}
          onClick={onJoinGroup}
          disabled={inAGroup}
          aria-disabled={inAGroup}
        >
          <Users size={16} />
          {t('challenges.join_group')}
        </motion.button>
      </div>

      {inAGroup && (
        <p className="mt-3 text-caption text-ink-300 text-center">
          Leave your current group before joining or creating another.
        </p>
      )}

      <h3 className="mt-6 font-display font-bold text-title text-ink-900 dark:text-ink-100">
        {inAGroup ? 'Your Group' : 'Groups'}
      </h3>
      <div className="mt-3 space-y-3">
        {allGroups.map((group, i) => {
          const isJoined = joinedGroupId === group.id;
          return (
            <motion.div
              key={group.id}
              className={`relative w-full text-left p-4 rounded-card overflow-hidden ${
                isJoined ? 'glass-tint-warm ring-2 ring-lighthouse-400/50' : 'glass-strong'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div
                className="absolute -top-12 -right-12 w-36 h-36 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(255,178,122,0.45), transparent 70%)', filter: 'blur(24px)' }}
              />
              <div className="relative flex items-start justify-between gap-3">
                <button
                  type="button"
                  className="flex-1 min-w-0 text-left"
                  onClick={() => onSelectGroup(group)}
                >
                  <h4 className="font-display font-bold text-body text-ink-900 dark:text-ink-100">
                    {group.name}
                  </h4>
                  <p className="text-caption text-ink-300 mt-0.5">
                    {group.members.length} {t('challenges.members')}
                    {isJoined ? ' · You\'re in' : ''}
                  </p>
                </button>
                {isJoined ? (
                  <span className="shrink-0 px-3 py-1.5 rounded-capsule text-micro font-bold uppercase tracking-wider bg-mint-500/15 text-mint-700 dark:text-mint-300">
                    Joined
                  </span>
                ) : (
                  <motion.button
                    type="button"
                    className={`shrink-0 px-4 py-1.5 rounded-capsule text-caption font-bold ${
                      inAGroup
                        ? 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
                        : 'hero-glow text-white shadow-soft'
                    }`}
                    whileTap={inAGroup ? undefined : { scale: 0.96 }}
                    disabled={inAGroup}
                    onClick={() => joinGroup(group.id)}
                  >
                    Join
                  </motion.button>
                )}
              </div>

              <button
                type="button"
                className="relative flex items-center mt-3 -space-x-2 w-full"
                onClick={() => onSelectGroup(group)}
              >
                {group.members.slice(0, 5).map((m, j) => (
                  <div
                    key={j}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-lighthouse-300 to-coral-300 flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-paper dark:ring-night-800"
                  >
                    {m.avatar}
                  </div>
                ))}
                {isJoined && (
                  <div className="w-8 h-8 rounded-full hero-glow flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-paper dark:ring-night-800">
                    {(user.name?.[0] || 'Y').toUpperCase()}
                  </div>
                )}
                {group.members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-ink-100 dark:bg-night-700 flex items-center justify-center text-[11px] font-bold text-ink-600 dark:text-ink-300 ring-2 ring-paper dark:ring-night-800">
                    +{group.members.length - 5}
                  </div>
                )}
                <ArrowRight size={16} className="text-ink-300 ml-auto" />
              </button>
            </motion.div>
          );
        })}
      </div>

      <div className="h-4" />
    </div>
  );
}

function CreateGroupSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { joinedGroupId, createGroup } = useStore();
  const [name, setName] = useState('');
  const [created, setCreated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCreate = () => {
    if (joinedGroupId) {
      setError('Leave your current group before creating another.');
      return;
    }
    const group = createGroup(name);
    if (!group) {
      setError('Couldn\'t create the group. Try a different name.');
      return;
    }
    setCode(group.code);
    setCreated(true);
    setError('');
  };

  const handleClose = () => {
    setCreated(false);
    setName('');
    setCode('');
    setError('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={t('challenges.create_group')}>
      {!created ? (
        <div className="space-y-4">
          <div>
            <label className="text-caption text-ink-600 dark:text-ink-300 font-medium">{t('challenges.group_name')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="e.g. Dhaka Dreamers"
              className="mt-2 w-full py-3 px-4 rounded-sm bg-ink-100 dark:bg-night-700 text-body text-ink-900 dark:text-ink-100 placeholder:text-ink-300 focus-ring"
            />
          </div>
          <p className="text-caption text-ink-300">
            Your friends can join using the invite code you'll get after creating the group. You can only be in one group at a time.
          </p>
          {error && <p className="text-caption text-coral-500 font-medium">{error}</p>}
          <motion.button
            className={`w-full py-4 rounded-capsule font-display font-bold text-title shadow-medium ${
              name.trim() && !joinedGroupId
                ? 'hero-glow text-white'
                : 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
            }`}
            whileTap={name.trim() && !joinedGroupId ? { scale: 0.97 } : undefined}
            onClick={handleCreate}
          >
            Create Group
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="text-center space-y-4 py-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lumi pose="cheering" size={72} />
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
            Group created! {'\u{1F389}'}
          </h3>
          <p className="text-body text-ink-600 dark:text-ink-300">
            Share this code with your friends:
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="px-6 py-3 rounded-card bg-lighthouse-50 dark:bg-night-700 border-2 border-dashed border-lighthouse-500">
              <span className="font-display font-bold text-display-l text-lighthouse-600 dark:text-lighthouse-300 tracking-wider">
                {code}
              </span>
            </div>
            <motion.button
              className="w-10 h-10 rounded-full bg-lighthouse-500 flex items-center justify-center"
              whileTap={{ scale: 0.9 }}
              onClick={() => navigator.clipboard?.writeText(code)}
              aria-label="Copy code"
            >
              <Copy size={16} className="text-white" />
            </motion.button>
          </div>
          <motion.button
            className="w-full py-3 rounded-capsule bg-ink-100 dark:bg-night-700 text-ink-900 dark:text-ink-100 font-display font-semibold"
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
          >
            Done
          </motion.button>
        </motion.div>
      )}
    </BottomSheet>
  );
}

function JoinGroupSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { joinedGroupId, joinGroup, customGroups } = useStore();
  const [code, setCode] = useState('');
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = () => {
    if (joinedGroupId) {
      setError('Leave your current group before joining another.');
      return;
    }
    const match = [...customGroups, ...challengeGroups].find(
      (g) => g.code === code.toUpperCase()
    );
    if (!match) {
      setError('Group not found. Check the code and try again.');
      return;
    }
    if (!joinGroup(match.id)) {
      setError('Leave your current group before joining another.');
      return;
    }
    setJoined(true);
    setError('');
  };

  const handleClose = () => {
    setJoined(false);
    setCode('');
    setError('');
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={t('challenges.join_group')}>
      {!joined ? (
        <div className="space-y-4">
          <div>
            <label className="text-caption text-ink-600 dark:text-ink-300 font-medium">{t('challenges.invite_code')}</label>
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="e.g. DHAKA24"
              className="mt-2 w-full py-3 px-4 rounded-sm bg-ink-100 dark:bg-night-700 text-body text-ink-900 dark:text-ink-100 placeholder:text-ink-300 focus-ring uppercase tracking-wider font-display font-bold text-center text-title"
              maxLength={8}
            />
          </div>
          {error && (
            <p className="text-caption text-coral-500 font-medium">{error}</p>
          )}
          <p className="text-caption text-ink-300">
            Ask your friend for their group's invite code. You can only be in one group at a time.
          </p>
          <motion.button
            className={`w-full py-4 rounded-capsule font-display font-bold text-title shadow-medium ${
              code.trim().length >= 4 && !joinedGroupId
                ? 'hero-glow text-white'
                : 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
            }`}
            whileTap={code.trim().length >= 4 && !joinedGroupId ? { scale: 0.97 } : undefined}
            onClick={handleJoin}
          >
            Join Group
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="text-center space-y-4 py-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Lumi pose="happy" size={72} />
          <h3 className="font-display font-bold text-title text-ink-900 dark:text-ink-100">
            You're in! {'\u{1F31F}'}
          </h3>
          <p className="text-body text-ink-600 dark:text-ink-300">
            Complete challenges together and climb the group leaderboard.
          </p>
          <motion.button
            className="w-full py-3 rounded-capsule hero-glow text-white font-display font-semibold"
            whileTap={{ scale: 0.97 }}
            onClick={handleClose}
          >
            Let's go!
          </motion.button>
        </motion.div>
      )}
    </BottomSheet>
  );
}

function GroupDetailSheet({ group, onClose }: { group: ChallengeGroup | null; onClose: () => void }) {
  const { joinedGroupId, leaveGroup, joinGroup } = useStore();
  if (!group) return null;

  const sorted = [...group.members].sort((a, b) => b.score - a.score);
  const isJoined = joinedGroupId === group.id;
  const inOtherGroup = Boolean(joinedGroupId) && !isJoined;

  return (
    <BottomSheet isOpen={!!group} onClose={onClose} title={group.name}>
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 p-3 rounded-card bg-lighthouse-50 dark:bg-lighthouse-700/10 text-center">
            <p className="font-display font-bold text-display-l text-lighthouse-600 dark:text-lighthouse-300">{group.totalScore}</p>
            <p className="text-[11px] text-ink-300">{t('challenges.group_score')}</p>
          </div>
          <div className="flex-1 p-3 rounded-card bg-ink-100 dark:bg-night-700 text-center">
            <p className="font-display font-bold text-display-l text-ink-900 dark:text-ink-100">{group.members.length}</p>
            <p className="text-[11px] text-ink-300">Members</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-card bg-ink-100 dark:bg-night-700">
          <div className="flex-1">
            <p className="text-[11px] text-ink-300 uppercase tracking-wider font-bold">Invite Code</p>
            <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100 tracking-wider">{group.code}</p>
          </div>
          <motion.button
            className="w-9 h-9 rounded-full bg-paper dark:bg-night-800 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
            onClick={() => navigator.clipboard?.writeText(group.code)}
            aria-label="Copy code"
          >
            <Copy size={15} className="text-ink-600 dark:text-ink-300" />
          </motion.button>
        </div>

        <h4 className="font-display font-bold text-caption text-ink-600 dark:text-ink-300 uppercase tracking-wider">
          Member Rankings
        </h4>
        <div className="space-y-2">
          {sorted.map((member, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-card ${
                i === 0 ? 'bg-lighthouse-50 dark:bg-lighthouse-700/10' : 'bg-paper dark:bg-night-800 card-border'
              }`}
            >
              <span className={`w-6 text-center font-display font-bold text-caption ${
                i === 0 ? 'text-lighthouse-600' : 'text-ink-300'
              }`}>
                {i + 1}
              </span>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                i === 0 ? 'hero-glow text-white' : 'bg-ink-100 dark:bg-night-700 text-ink-600 dark:text-ink-300'
              }`}>
                {member.avatar}
              </div>
              <div className="flex-1">
                <p className="font-display font-semibold text-body text-ink-900 dark:text-ink-100">
                  {member.name} {member.flag}
                </p>
                <p className="text-[11px] text-ink-300">{member.challenges} challenges done</p>
              </div>
              <div className="text-right">
                <p className="font-display font-bold text-body text-ink-900 dark:text-ink-100">{member.score}</p>
              </div>
            </div>
          ))}
        </div>

        {isJoined ? (
          <motion.button
            className="w-full py-4 rounded-capsule bg-coral-500/15 text-coral-600 dark:text-coral-300 font-display font-bold text-title"
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              leaveGroup();
              onClose();
            }}
          >
            Leave This Group
          </motion.button>
        ) : (
          <motion.button
            className={`w-full py-4 rounded-capsule font-display font-bold text-title shadow-medium ${
              inOtherGroup
                ? 'bg-ink-100 dark:bg-night-700 text-ink-300 pointer-events-none'
                : 'hero-glow text-white'
            }`}
            whileTap={inOtherGroup ? undefined : { scale: 0.97 }}
            disabled={inOtherGroup}
            onClick={() => {
              if (joinGroup(group.id)) onClose();
            }}
          >
            {inOtherGroup ? 'Leave your group first' : 'Join This Group'}
          </motion.button>
        )}
      </div>
    </BottomSheet>
  );
}
