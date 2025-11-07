"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractMentions = void 0;
const extractMentions = (message) => {
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g;
    const mentions = new Set();
    let match;
    // eslint-disable-next-line no-cond-assign
    while ((match = mentionRegex.exec(message)) !== null) {
        const mention = match[1];
        if (mention) {
            mentions.add(mention);
        }
    }
    return Array.from(mentions.values());
};
exports.extractMentions = extractMentions;
//# sourceMappingURL=mentions.js.map