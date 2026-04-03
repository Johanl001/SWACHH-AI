---
name: swachh_frontend_design_system
description: Comprehensive frontend development guidelines for SWACHH-AI —
user-friendly, adaptive, responsive design system
type: reference
---

**CORE DESIGN PHILOSOPHY**
Your designs must feel handcrafted by an experienced designer, not
AI-generated. Key principles:
- **Imperfect perfection** — Add subtle micro-interactions that feel
organic, not mechanical
- **Purpose-first** — Every UI element must have a clear user intent
- **Progressive disclosure** — Start simple, reveal complexity only when
needed
- **Emotional connection** — Use warm tones, humanizing language, real
imagery (not generic stock photos)

**RESPONSIVE ADAPTATION (CRITICAL)**
- Mobile-first, fluid layouts (no fixed widths)
- Touch targets ≥ 44px, thumb-zone optimized
- Landscape mode awareness for tablet/edge devices
- Offline-capability with graceful degradation
- **Test on actual devices** before shipping

**VISUAL LANGUAGE**
- **Colors** — Use SWACHH's official palette; prefer warm, earthy tones
(not cold tech blues)
- **Typography** — Clean sans-serif with 1.6:1 scale; readable at small
sizes
- **Spacing** — 8px base grid with rhythm (not rigid 24px everywhere)
- **Shadows** — Soft, contextual (not default box-shadow everywhere)
- **Borders** — Subtle radius (4-8px), avoid overused rounded corners

**AVOIDING "AI LOOK"**
❌ DO NOT use:
- Generic gradients without purpose
- Excessive glow effects or neon
- Stock photos that look AI-generated
- Over-polished, sterile aesthetics
- Copy-paste component libraries without customization

✅ DO include:
- Real user photos (with permission)
- Imperfect, authentic imagery
- Context-aware loading states
- Human-centered error messages

**ACCESSIBILITY (MUST-HAVE)**
- WCAG 2.1 AA compliance minimum
- Semantic HTML (no div soup)
- Focus indicators visible (never hidden)
- Alt text that describes, not labels
- ARIA labels where needed

**PERFORMANCE**
- LCP < 2.5s, FCP < 1.8s
- Lazy load non-critical images
- Code-split by route
- **Avoid** premature optimization, but be mindful of edge deployments

**COMPONENT GUIDELINES**
- Buttons: Clear hierarchy, primary/secondary states
- Cards: Consistent padding, subtle hover states
- Forms: Real-time validation with inline feedback
- Empty states: Encouraging, not dead ends
- Search: Intelligent suggestions, debounced

**EDGE DEVICE CONSIDERATIONS**
- Low-bandwidth optimization
- Service worker caching strategy
- Background task awareness (mobile)
- Offline-first data patterns

**TESTING CHECKLIST**
Before committing:
- [ ] Tested on Chrome, Safari, Firefox, Edge
- [ ] Tested on iOS, Android (real devices)
- [ ] Accessibility audit passed
- [ ] Performance budget met
- [ ] Error cases handled gracefully
