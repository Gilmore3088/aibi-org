// Template hydration — substitution + section-tag stripping + default fallback.

import { describe, it, expect } from 'vitest';
import { hydrate, defaultArtifactBody, TEMPLATE_VERSION } from './templates';

describe('toolbox/templates', () => {
  describe('hydrate', () => {
    it('substitutes known placeholders', () => {
      const out = hydrate('Track: {{track}}, Date: {{created_date}}', {
        artifact_type: 'data_discipline_card',
        title: 'X',
        track: 'risk_compliance',
        created_date: '2026-05-23',
      });
      expect(out).toContain('Track: risk compliance');
      expect(out).toContain('Date: 2026-05-23');
    });

    it('leaves unknown placeholders intact for learner to fill', () => {
      const out = hydrate('Item 1: {{item_1}}', {
        artifact_type: 'data_discipline_card',
        title: 'X',
      });
      expect(out).toContain('{{item_1}}');
    });

    it('strips mustache section tags', () => {
      const tmpl = '{{#slot_schema}}\nbody\n{{/slot_schema}}\n';
      const out = hydrate(tmpl, { artifact_type: 'skill', title: 'X' });
      expect(out).not.toContain('{{#slot_schema}}');
      expect(out).not.toContain('{{/slot_schema}}');
      expect(out).toContain('body');
    });

    it('hydrates template_version with the current constant', () => {
      const out = hydrate('v{{template_version}}', {
        artifact_type: 'data_discipline_card',
        title: 'X',
      });
      expect(out).toBe(`v${TEMPLATE_VERSION}`);
    });

    it('falls back to an em-dash when track is missing', () => {
      const out = hydrate('Track: {{track}}', {
        artifact_type: 'data_discipline_card',
        title: 'X',
      });
      expect(out).toBe('Track: —');
    });
  });

  describe('defaultArtifactBody', () => {
    it('produces a sensible default with title + date + lesson context', () => {
      const body = defaultArtifactBody({
        artifact_type: 'where_ai_fits',
        title: 'My weekly map',
        lesson_id: 'm1.2',
        lesson_title: 'Where AI fits this week',
        created_date: '2026-05-23',
      });
      expect(body).toContain('# My weekly map');
      expect(body).toContain('2026-05-23');
      expect(body).toContain('Where AI fits this week');
      expect(body).toContain('AiBI-Foundation');
    });
  });
});
