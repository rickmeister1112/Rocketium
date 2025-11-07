/** @type {import('migrate-mongo').Migration} */
module.exports = {
  async up(db) {
    const designs = db.collection('designs');
    const comments = db.collection('comments');

    await designs.createIndex({ updatedAt: -1 }, { name: 'designs_updatedAt_desc' });
    await designs.createIndex({ name: 1 }, { name: 'designs_name_asc' });

    await comments.createIndex({ designId: 1, createdAt: 1 }, { name: 'comments_design_createdAt' });
    await comments.createIndex({ mentions: 1 }, { name: 'comments_mentions' });
  },

  async down(db) {
    const designs = db.collection('designs');
    const comments = db.collection('comments');

    await designs.dropIndex('designs_updatedAt_desc').catch(() => undefined);
    await designs.dropIndex('designs_name_asc').catch(() => undefined);

    await comments.dropIndex('comments_design_createdAt').catch(() => undefined);
    await comments.dropIndex('comments_mentions').catch(() => undefined);
  },
};

