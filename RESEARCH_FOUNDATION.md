# Music & You: Research Foundation

## Why I Built This Project

It started with a simple observation about my own listening habits. As a Computer Engineering student at Penn, I found myself constantly switching between wildly different genres - one moment I'd be listening to Tina Turner's "What's Love Got to Do With It," then jumping to André Rieu's "Blue Danube," followed by some Afrobeats, then Lewis Capaldi, and maybe some traditional Hilife from Ghana.

This seemed... statistically unlikely. Most of my Gen Z peers had much more focused tastes - they were either into hip-hop, pop, indie, or electronic, but rarely all of them. It struck me as strange that I, a college student, would be rotating between Tina Turner, Cyndi Lauper, Bob Marley, classical waltzes, and contemporary ballads all in one sitting.

**There had to be something deeper going on.**

My engineering background trains me to find patterns in chaos, and this felt like a pattern worth exploring. Is there a connection between someone's diverse musical taste and their personality? Does the fact that I gravitate toward such varied emotional landscapes in music say something about who I am psychologically?

This question led me down a research rabbit hole that eventually became Music & You.## What the Research Actually Says

### The Big Picture

Over the past 20 years, researchers have been trying to crack this code. The honest answer? **It works, but not as well as you might think.**

Studies consistently find correlations between music preferences and personality traits, but they're modest - typically explaining only 10-25% of the variance. That means your Spotify Wrapped isn't a crystal ball, but it's not random either.

### The STOMP and MUSIC Models

The foundational work came from Rentfrow and Gosling, who developed two key frameworks:

**STOMP (Short Test of Music Preferences)** breaks music into dimensions like:

- Reflective & Complex (jazz, classical, folk)
- Intense & Rebellious (rock, alternative, heavy metal)
- Upbeat & Conventional (pop, country, soundtrack)
- Energetic & Rhythmic (rap/hip-hop, soul/funk, electronic)

**MUSIC Model** goes deeper, focusing on the actual sound qualities:

- **Mellow** - soft, relaxing music
- **Unpretentious** - simple, straightforward songs
- **Sophisticated** - complex, intelligent music
- **Intense** - aggressive, energetic tracks
- **Contemporary** - modern, trendy sounds

What's interesting is that the MUSIC model moves beyond genre labels to focus on how music actually _feels_ - which turns out to be more predictive of personality.

### The Personality Connections

Here's what researchers have consistently found about the Big Five traits:

**Openness to Experience** - This is the strongest predictor. People high in openness gravitate toward complex, novel music - think jazz, classical, indie, world music. They're the ones with 47 different genres in their library.

**Extraversion** - Extraverts love energetic, rhythmic music that gets people moving. Pop, hip-hop, electronic dance music. Music for parties, workouts, and social gatherings.

**Agreeableness** - These folks prefer mellow, harmonious music. Think acoustic, soft rock, anything that doesn't assault your eardrums. They're not big on aggressive or confrontational sounds.

**Conscientiousness** - Interestingly, this trait connects to conventional, unpretentious music. Country, pop, mainstream hits. They prefer familiar structures over experimental weirdness.

**Neuroticism** - The weakest and most complex relationship. Sometimes links to intense music (maybe for emotional release?), sometimes to mellow music (for regulation). It varies a lot.

### Beyond Personality: Cognitive Styles

David Greenberg's work introduced something fascinating - the empathizing vs. systemizing cognitive styles:

- **Empathizers** prefer mellow, emotional music with strong lyrical content
- **Systemizers** gravitate toward complex, structured music with intricate patterns

This added a whole new dimension beyond just personality traits.

## The Cultural Question

One thing that particularly interested me, given my own diverse listening habits spanning Western pop, classical, Ghanaian Hilife, and Afrobeats, was how cultural context shapes these patterns. Most research focused on Western music and Western populations, but music is deeply cultural.

Does a preference for traditional Hilife mean the same thing as liking Western folk? When I listen to André Rieu's classical performances alongside contemporary Afrobeats, am I expressing the same personality trait, or are these culturally distinct preferences?

Recent studies across 50+ countries show some universal patterns (especially for Openness and Extraversion), but also significant cultural variations. A person's musical "accent" - the cultural context they grew up in - shapes both what they hear and what they prefer.

This became a key consideration in designing Music & You: how do we account for the global diversity of musical expression while still finding meaningful psychological patterns?

## Why Current Approaches Fall Short

### The Variance Problem

Even the best models only explain a fraction of why people like what they like. Music preference is influenced by:

- Life experiences and memories
- Social context and peer groups
- Situational factors (workout vs. study music)
- Cultural background
- Random exposure and discovery

Personality is just one piece of a much larger puzzle.

### The Method Problem

Different studies use different approaches:

- Some ask about genres ("Do you like rock music?")
- Others play audio clips and ask for ratings
- The newest ones analyze actual listening behavior

These methods don't always agree with each other. Your stated preferences, your ratings of clips, and your actual listening history can tell different stories.

## My Research Approach

Given these limitations, I designed Music & You to address several key gaps:

### 1. Multi-Modal Features

Instead of just looking at genres or basic audio features, I extract:

- **Acoustic properties** (energy, valence, complexity)
- **Listening patterns** (consistency, exploration, session structure)
- **Behavioral signals** (skip rates, repeat behavior, discovery patterns)
- **Temporal dynamics** (how preferences change over time)

### 2. Real-World Data

Rather than laboratory experiments with music clips, I use actual Spotify listening history. This captures how people really consume music in their daily lives.

### 3. Transparent Limitations

I'm upfront about the modest effect sizes and probabilistic nature of predictions. This isn't a personality test - it's an exploration of patterns.

### 4. Cultural Awareness

Drawing from my own experience listening to everything from Ghanaian Hilife to German classical to American soul, the system accounts for different cultural contexts and doesn't assume everyone shares Western musical categories. It recognizes that musical diversity might itself be a personality indicator.

## The Privacy Question

Here's something researchers often ignore: predicting personality from music data raises serious privacy concerns. Your playlist reveals more about you than you might think.

I've designed the system with privacy by design:

- Local processing options
- Clear data usage policies
- User control over data sharing
- Transparent about what's being inferred

## What This Project Contributes

### Technical Innovation

- **Multi-modal feature engineering** combining acoustic, behavioral, and temporal signals
- **Real-time personality inference** from streaming data
- **Explainable AI** that shows which musical patterns drive predictions
- **Cultural normalization** to account for global music diversity

### Research Contributions

- **Ecological validity** using real listening behavior vs. lab experiments
- **Temporal analysis** tracking how musical identity evolves
- **Privacy-preserving methods** for sensitive inference tasks
- **Cross-cultural validation** with diverse user populations

### Practical Applications

- **Music discovery** recommendations based on personality insights
- **Self-reflection tools** helping people understand their musical identity
- **Social connection** finding others with compatible musical personalities
- **Therapeutic applications** using music for mood regulation and well-being

## The Honest Assessment

Will Music & You perfectly predict your personality from your playlist? **No.**

Can it find interesting patterns and offer insights into the relationship between your musical choices and psychological traits? **Absolutely.**

The goal isn't to replace psychological assessment - it's to create a fun, educational tool that helps people explore the fascinating intersection of music and personality while being transparent about its limitations.

## Key Research Sources

- Rentfrow & Gosling (2003) - The foundational STOMP model
- Rentfrow et al. (2011) - The MUSIC framework
- Greenberg et al. (2015) - Cognitive styles and music
- Nave et al. (2018) - Large-scale Facebook study
- Spotify Research (2020) - Real-world listening behavior analysis
- Cross-cultural validation studies (2022) - Global personality-music patterns

_This research foundation informs every aspect of Music & You, from feature engineering to result interpretation._
