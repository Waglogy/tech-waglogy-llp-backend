/**
 * Backfill stored alt text for already-uploaded images.
 *
 * Existing Blog/Project/Insight documents already SERVE alt text via the
 * `*AltText` virtuals (generated on read), so nothing is broken without this.
 * This script simply writes that generated alt into the editable `imageAlt` /
 * `heroImageAlt` fields where they are empty — giving admins a sensible,
 * pre-filled default they can review and tweak in mission-control.
 *
 * Safe to re-run: it only fills blanks and never overwrites custom alt text.
 * Use --dry to preview without writing.
 *
 * Usage:
 *   node src/scripts/backfillImageAlt.js
 *   node src/scripts/backfillImageAlt.js --dry
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/database');
const Blog = require('../models/Blog');
const Project = require('../models/Project');
const Insight = require('../models/Insight');
const { blogAlt, projectAlt, insightAlt } = require('../utils/altText');

const DRY_RUN = process.argv.includes('--dry');

// For each model: which image field maps to which stored-alt field + generator.
const TARGETS = [
  {
    model: Blog,
    name: 'Blog',
    fields: [{ image: 'image', alt: 'imageAlt', gen: (d) => blogAlt(d) }]
  },
  {
    model: Project,
    name: 'Project',
    fields: [
      { image: 'image', alt: 'imageAlt', gen: (d) => projectAlt(d, 'image') },
      { image: 'heroImage', alt: 'heroImageAlt', gen: (d) => projectAlt(d, 'hero') }
    ]
  },
  {
    model: Insight,
    name: 'Insight',
    fields: [
      { image: 'image', alt: 'imageAlt', gen: (d) => insightAlt(d, 'image') },
      { image: 'heroImage', alt: 'heroImageAlt', gen: (d) => insightAlt(d, 'hero') }
    ]
  }
];

const run = async () => {
  await connectDB();
  console.log(`\n🔤 Backfilling image alt text${DRY_RUN ? ' (DRY RUN — no writes)' : ''}...\n`);

  let totalUpdated = 0;

  for (const target of TARGETS) {
    const docs = await target.model.find({});
    let updatedDocs = 0;

    for (const doc of docs) {
      let changed = false;

      for (const field of target.fields) {
        const hasImage = doc[field.image] && String(doc[field.image]).trim();
        const hasAlt = doc[field.alt] && String(doc[field.alt]).trim();
        if (hasImage && !hasAlt) {
          const generated = field.gen(doc);
          console.log(`  ${target.name} "${doc.title}" → ${field.alt}: "${generated}"`);
          doc[field.alt] = generated;
          changed = true;
        }
      }

      if (changed) {
        updatedDocs += 1;
        totalUpdated += 1;
        if (!DRY_RUN) {
          // Only touch alt fields; skip slug/readTime pre-save side effects.
          await target.model.updateOne(
            { _id: doc._id },
            { $set: target.fields.reduce((acc, f) => {
              if (doc[f.alt]) acc[f.alt] = doc[f.alt];
              return acc;
            }, {}) }
          );
        }
      }
    }

    console.log(`  → ${target.name}: ${updatedDocs} document(s) ${DRY_RUN ? 'would be' : ''} updated\n`);
  }

  console.log(`✅ Done. ${totalUpdated} document(s) ${DRY_RUN ? 'would be' : ''} updated total.\n`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Backfill failed:', err.message);
  process.exit(1);
});
