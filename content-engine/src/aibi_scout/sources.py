"""
The 25 sources monitored by AiBI Scout.

Categories:
- banking:      banking/fintech voices (audience-adjacent)
- general_ai:   general AI thought leaders (upstream signal)
- practitioner: builders and applied LLM voices

Ingestion types:
- rss:     standard RSS/Atom feed (most sources)
- youtube: YouTube channel transcripts
- gmail:   routed through a Gmail label
- manual:  no programmatic feed; placeholder

URLs marked `# TODO: verify` need a quick check in the browser before seeding.
Substack feeds reliably follow `{domain}/feed`. Forbes/contributor RSS is the
shakiest category — if a URL 404s, fall back to gmail routing (subscribe by
email, forward to label).
"""

SOURCES = [
    # ------------------------------------------------------------------ #
    # Banking / Fintech (8)                                              #
    # ------------------------------------------------------------------ #
    {
        "name": "Jim Marous - The Financial Brand",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://thefinancialbrand.com/feed/",
        "handle": "@JimMarous",
        "notes": "Highest-circulation banking marketing/strategy site. Tracks what bank execs are reading.",
    },
    {
        "name": "Ron Shevlin - Fintech Snark Tank",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://www.forbes.com/sites/ronshevlin/feed/",  # TODO: verify
        "handle": "@rshevlin",
        "notes": "Cornerstone Advisors managing director. Critical of hype, strong analyst signal.",
    },
    {
        "name": "Chris Skinner - The Finanser",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://thefinanser.com/feed",
        "handle": "@Chris_Skinner",
        "notes": "Global banking/fintech commentary. Macro framing.",
    },
    {
        "name": "Penny Crosman - American Banker",
        "category": "banking",
        "ingestion_type": "gmail",  # AB requires subscription
        "source_url": "label:aibi-scout-american-banker",
        "handle": "@PennyCrosman",
        "notes": "Best AI coverage in trade press. Route AB AI newsletter through Gmail label.",
    },
    {
        "name": "Alex Johnson - Fintech Takes",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://fintechtakes.com/feed",
        "handle": "@AlexH_Johnson",
        "notes": "Long-form fintech analysis. Smart on infrastructure/BaaS implications of AI.",
    },
    {
        "name": "Jason Mikula - Fintech Business Weekly",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://fintechbusinessweekly.substack.com/feed",
        "handle": "@mikulaja",
        "notes": "Regulatory and compliance angle on fintech. High signal on examiner posture.",
    },
    {
        "name": "Cornerstone Advisors - GonzoBanker",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://gonzobanker.com/feed/",
        "handle": "@CstoneAdvisors",
        "notes": "Practitioner-led consulting voice. Community-bank operational reality.",
    },
    {
        "name": "Theodora Lau - Unconventional Ventures",
        "category": "banking",
        "ingestion_type": "rss",
        "source_url": "https://unconventionalventures.substack.com/feed",  # TODO: verify
        "handle": "@psb_dc",
        "notes": "Inclusive finance + AI ethics lens. Useful counterweight.",
    },

    # ------------------------------------------------------------------ #
    # General AI thought leaders (9)                                     #
    # ------------------------------------------------------------------ #
    {
        "name": "Ethan Mollick - One Useful Thing",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://www.oneusefulthing.org/feed",
        "handle": "@emollick",
        "notes": "HIGHEST PRIORITY. Wharton prof translating frontier AI for operators. Always relevant.",
    },
    {
        "name": "Simon Willison",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://simonwillison.net/atom/everything/",
        "handle": "@simonw",
        "notes": "Best daily signal on model releases, tools, practical patterns.",
    },
    {
        "name": "Andrew Ng - The Batch (DeepLearning.AI)",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://www.deeplearning.ai/the-batch/feed/",  # TODO: verify
        "handle": "@AndrewYNg",
        "notes": "Weekly digest of AI news, accessible for non-technical readers.",
    },
    {
        "name": "Latent Space - swyx & Alessio",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://www.latent.space/feed",
        "handle": "@latentspacepod",
        "notes": "Engineering + product framing. Long-form interviews with builders.",
    },
    {
        "name": "Nathan Lambert - Interconnects",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://www.interconnects.ai/feed",
        "handle": "@natolambert",
        "notes": "RL/post-training depth. Skewed technical — many items will score <5.",
    },
    {
        "name": "Every.to - Dan Shipper",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://every.to/feed.xml",
        "handle": "@danshipper",
        "notes": "AI x knowledge work. Workflow translation candidates.",
    },
    {
        "name": "Andrej Karpathy",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://karpathy.github.io/feed.xml",  # TODO: verify; he posts rarely
        "handle": "@karpathy",
        "notes": "Rare but high signal. Most signal is X-only; consider Nitter mirror later.",
    },
    {
        "name": "AI Snake Oil - Narayanan & Kapoor",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://www.aisnakeoil.com/feed",
        "handle": "@random_walker",
        "notes": "Counter-hype voice. Strong source for risk/governance framing.",
    },
    {
        "name": "Dwarkesh Patel",
        "category": "general_ai",
        "ingestion_type": "rss",
        "source_url": "https://www.dwarkesh.com/feed",
        "handle": "@dwarkesh_sp",
        "notes": "Long-form podcast transcripts. High signal but high volume per item.",
    },

    # ------------------------------------------------------------------ #
    # Practitioners / builders (8)                                       #
    # ------------------------------------------------------------------ #
    {
        "name": "Anthropic News",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://www.anthropic.com/news/rss.xml",  # TODO: verify
        "handle": "@AnthropicAI",
        "notes": "Model releases, safety research, product updates.",
    },
    {
        "name": "OpenAI Blog",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://openai.com/blog/rss.xml",  # TODO: verify
        "handle": "@OpenAI",
        "notes": "Model releases. Filter aggressively — most items low banking-relevance.",
    },
    {
        "name": "Hamel Husain",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://hamel.dev/index.xml",
        "handle": "@HamelHusain",
        "notes": "Evals, applied LLM patterns. Critical for the Application pillar.",
    },
    {
        "name": "Eugene Yan",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://eugeneyan.com/rss/",
        "handle": "@eugeneyan",
        "notes": "Applied ML/LLM patterns at scale. Long-form posts.",
    },
    {
        "name": "Jason Liu - jxnl.co",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://jxnl.co/feed.xml",  # TODO: verify
        "handle": "@jxnlco",
        "notes": "RAG, structured outputs, instructor. Useful for Creation pillar artifacts.",
    },
    {
        "name": "Chip Huyen",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://huyenchip.com/feed.xml",  # TODO: verify
        "handle": "@chipro",
        "notes": "Production LLM systems. Architectural framing.",
    },
    {
        "name": "Lenny's Newsletter",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://www.lennysnewsletter.com/feed",
        "handle": "@lennysan",
        "notes": "PM lens on AI tooling. Useful for translating to bank product managers.",
    },
    {
        "name": "Shreya Shankar",
        "category": "practitioner",
        "ingestion_type": "rss",
        "source_url": "https://www.sh-reya.com/feed.xml",  # TODO: verify
        "handle": "@sh_reya",
        "notes": "Applied LLM evals research. High signal, low volume.",
    },
]


assert len(SOURCES) == 25, f"Expected 25 sources, got {len(SOURCES)}"
