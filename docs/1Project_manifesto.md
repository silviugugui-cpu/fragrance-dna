# FragranceDNA Project Development Manifesto

This manifesto defines how FragranceDNA must be developed. These principles are permanent and take precedence over implementation preferences.

==================================================
PRIMARY OBJECTIVE
==================================================

The goal of this project is NOT to build documentation.

The goal is NOT to build architecture.

The goal is NOT to build frameworks.

The goal is to build a real, working, production-ready Fragrance Intelligence Platform as quickly as possible while maintaining a clean and scalable architecture.

Every development decision must move the platform closer to a usable product.

==================================================
PRODUCT FIRST
==================================================

Every completed sprint must deliver visible progress.

At the end of every sprint there must be something new that can be used, tested or demonstrated inside the platform.

Invisible architectural work should be minimized.

Visible functionality is always preferred whenever architecture is already sufficient.

==================================================
MINIMAL DOCUMENTATION
==================================================

Documentation exists only to support implementation.

Never create documentation simply for completeness.

Only create documents when they unblock development or preserve important architectural decisions.

If the same time could be spent implementing working functionality, implementation takes priority.

==================================================
NO OVER-ENGINEERING
==================================================

Do not build infrastructure that is not immediately needed.

Do not introduce abstraction layers without a concrete use case.

Do not create "future-proof" systems that delay implementation.

Always prefer the simplest architecture capable of solving the current problem correctly.

==================================================
REAL DATA FIRST
==================================================

The Builder must always work against the real RawPerfumeDatabase.

Avoid mock data whenever possible.

Every new feature should be validated against the complete production dataset.

Development decisions must be driven by real data, not assumptions.

==================================================
AUTOMATION FIRST
==================================================

Human work is the exception.

Automation is the default.

Whenever a problem is discovered, the first question must always be:

"Can Builder solve this automatically?"

Only problems that cannot be solved deterministically should reach the human Review Workspace.

==================================================
STUDIO PHILOSOPHY
==================================================

Studio is not an administration panel.

Studio is the operational control center of the Fragrance Intelligence Platform.

Every module inside Studio must eventually become a fully functional workspace powered by real Builder data.

Placeholders should be replaced by working modules as early as possible.

==================================================
BUILDER PHILOSOPHY
==================================================

Builder is the heart of the platform.

Its purpose is to transform a raw fragrance database into a canonical Master Perfume Database with minimal human intervention.

Builder should continuously reduce the amount of manual work required.

Success is measured by increasing autonomous processing.

==================================================
IMPLEMENTATION PRIORITY
==================================================

Highest priority:

Working product features.

Second priority:

Builder intelligence.

Third priority:

User experience improvements.

Lowest priority:

Documentation, refactoring and architectural polishing.

==================================================
DEVELOPMENT STYLE
==================================================

Prefer complete working modules over isolated components.

Prefer large functional milestones over many tiny infrastructure milestones.

Every sprint should make FragranceDNA feel more like a finished product.

==================================================
SUCCESS METRIC
==================================================

Progress is NOT measured by:

- number of documents
- number of classes
- number of components
- number of architecture diagrams

Progress IS measured by:

- working Builder capabilities
- working Studio modules
- autonomous Builder processing
- reduction of manual work
- visible platform functionality
- production readiness

==================================================
FINAL PRINCIPLE
==================================================

Always ask:

"If this sprint finishes today, will FragranceDNA become a better product?"

If the answer is no, reconsider the implementation strategy.
