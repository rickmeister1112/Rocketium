const LEGACY_OWNER_ID = 'legacy-shared';
const LEGACY_OWNER_NAME = 'Legacy Workspace';

/** @type {import('migrate-mongo').Migration} */
module.exports = {
  async up(db) {
    const designs = db.collection('designs');

    const cursor = designs.find({
      $or: [{ ownerId: { $exists: false } }, { ownerId: null }, { ownerId: '' }],
    });

    const operations = [];
    // eslint-disable-next-line no-constant-condition
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      operations.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              ownerId: LEGACY_OWNER_ID,
              ownerName: doc.ownerName ?? LEGACY_OWNER_NAME,
            },
          },
        },
      });
    }

    if (operations.length > 0) {
      await designs.bulkWrite(operations);
    }

    await designs.createIndex({ ownerId: 1, updatedAt: -1 }, { name: 'designs_owner_updatedAt' });
  },

  async down(db) {
    const designs = db.collection('designs');

    await designs
      .updateMany(
        { ownerId: LEGACY_OWNER_ID },
        {
          $unset: { ownerId: '', ownerName: '' },
        },
      )
      .catch(() => undefined);

    await designs.dropIndex('designs_owner_updatedAt').catch(() => undefined);
  },
};

