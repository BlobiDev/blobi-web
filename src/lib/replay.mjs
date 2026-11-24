// A Replay button restarts the demo only when it belongs to the interactive hero conversation;
// the buttons of purely decorative replicas stay inert.
export const replaysMainConversation = (button, mainConversation) => Boolean(mainConversation?.contains(button));
