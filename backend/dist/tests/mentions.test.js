"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const mentions_1 = require("../utils/mentions");
(0, vitest_1.describe)('extractMentions', () => {
    (0, vitest_1.it)('collects unique mentions from text', () => {
        const result = (0, mentions_1.extractMentions)('Hello @alex and @jordan, ping @alex again');
        (0, vitest_1.expect)(result).toEqual(['alex', 'jordan']);
    });
    (0, vitest_1.it)('returns empty array when no mentions', () => {
        (0, vitest_1.expect)((0, mentions_1.extractMentions)('No mentions here')).toEqual([]);
    });
});
//# sourceMappingURL=mentions.test.js.map