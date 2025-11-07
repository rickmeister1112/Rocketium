export const extractMentions = (message: string): string[] => {
  const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
  const mentions = new Set<string>();
  let match: RegExpExecArray | null;

  // eslint-disable-next-line no-cond-assign
  while ((match = mentionRegex.exec(message)) !== null) {
    const mention = match[1];
    if (mention) {
      mentions.add(mention);
    }
  }

  return Array.from(mentions.values());
};

