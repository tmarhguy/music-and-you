Below is a comprehensive, _publication‑style_ **Literature Review**, a **Concept / Research Map** for what you want to build (showing how each intended contribution sits relative to prior work), and a concise **MVP Build Plan** (adapted from the earlier spec, but tightened and explicitly linked to the literature gaps).
At the end you will find a **Raw URL Reference List** (full plain URLs as you requested, placed in a code block).

---

## 1. Introduction & Scope

Research over the last two decades has established that individual differences in musical taste relate—though modestly—to stable personality traits, cognitive styles, developmental stages, and psychosocial functioning, while new computational approaches exploit large‑scale listening logs for trait inference and personalized recommendation. ([gosling.psy.utexas.edu][1], [UC Press Online][2], [UC Press Online][2])
Despite substantial progress (structural models like STOMP and MUSIC, cross‑cultural replications, meta‑analytic syntheses), open problems remain around effect size limits, causal directionality, method heterogeneity, privacy, and ethical deployment of personality‑aware systems. ([gosling.psy.utexas.edu][1], [projects.ori.org][3], [Gwern][4], [ScienceDirect][5], [CiteSeerX][6])

## 2. Structural Models of Music Preference

Early work distilled surveys of self‑reported genre liking into latent dimensions (e.g., Reflective & Complex; Intense & Rebellious; Upbeat & Conventional; Energetic & Rhythmic) demonstrating internal reliability and short‑term temporal stability. ([gosling.psy.utexas.edu][1], [gosling.psy.utexas.edu][1])
The later MUSIC model (Mellow, Unpretentious, Sophisticated, Intense, Contemporary) shifted from genre labels toward perceptual/affective attributes of audio excerpts, emphasizing underlying acoustic–psychological properties rather than social genre identities. ([projects.ori.org][3], [PMC][7])
Replication and extension studies confirm the robustness of the MUSIC factor structure and suggest preference factors are attributable to combinations of auditory and psychological attributes across heterogeneous excerpt sets. ([PMC][7], [ResearchGate][8])

## 3. Measurement Instruments & Methodological Heterogeneity

Widely used instruments include STOMP (genre checklist) and excerpt‑based tasks; web resources provide standardized item formats, and alternate hosting extends accessibility, yet self‑report genres, excerpt ratings, and behavioral logs only partially overlap in extracted factor structures. ([gosling.psy.utexas.edu][9], [gosling.psy.utexas.edu][10], [Society for Judgment and Decision Making][11], [PMC][7])
Recent calls emphasize integrating multi‑method assessments (survey genre ratings, controlled excerpt evaluations, and ecologically valid streaming histories) to reduce construct divergence that constrains cross‑study comparability. ([PMC][7], [Gwern][4], [UC Press Online][2])

## 4. Personality Trait Associations (Big Five & Facets)

Core replicated findings: Openness relates to preference for complex/novel and sophisticated or intense forms; Extraversion associates with energetic, rhythmic, contemporary, and social genres; Agreeableness with mellow and lyrical content; Conscientiousness with conventional/unpretentious music; Neuroticism/Emotional Stability shows weaker, sometimes valence‑ or mood‑regulation‑related patterns. ([gosling.psy.utexas.edu][1], [gosling.psy.utexas.edu][1], [Gwern][4], [ScienceDirect][5])
Facet‑level and BFI‑2 based studies indicate finer granularity (e.g., Aesthetic Sensitivity within Openness) can improve explanatory power beyond broad domain scores for recommendation error reduction. ([SpringerOpen][12], [ScienceDirect][5])

## 5. Cognitive Style, Empathy, and Systemizing

Empathizing–Systemizing theory accounts for differential attraction to emotional/mellow vs. complex/intense musical attributes, enriching explanatory mechanisms beyond broad traits, and linking to autism‑spectrum relevant processing styles and music therapy considerations. ([David M. Greenberg][13], [Autism Research Centre][14], [eMusicology][15])

## 6. Developmental & Lifespan Dynamics

Adolescence marks a crystallization phase in which broad exploratory listening narrows into more stable, identity‑linked preferences; longitudinal and cross‑sectional age studies show systematic shifts (declines in Intense/Contemporary, increases in Unpretentious/Sophisticated) tracking psychosocial and perceptual maturation. ([ResearchGate][16], [ResearchGate][17], [gosling.psy.utexas.edu][1])
Environmental quasi‑experiments (geographic relocation) reveal limited exogenous impact on established adult taste, highlighting path dependence and early consolidation of “musical identity.” ([arXiv][18])

## 7. Social Identity, Peer Processes, and Behavior

Adolescent music preference clusters facilitate peer selection, influencing externalizing behaviors and friendship formation, while genre‑affiliated crowds mediate behavioral norms. ([PMC][19], [Utrecht University][20])

## 8. Mood Regulation, Mental Health, and Well‑Being

Music is used strategically for emotion modulation; studies of clinical and subclinical populations suggest higher utilization for affect regulation rather than direct genre–health causal links, with systematic reviews indicating stable and transient traits jointly shape well‑being effects of everyday listening. ([PMC][21], [Frontiers][22], [PMC][23])

## 9. Linguistic / Lyric Content & Moral / Value Inference

Personality and moral/value constructs can be predicted from linguistic markers and audio properties of preferred songs, expanding inference targets beyond Big Five to moral foundations and ethical orientations. ([ScienceDirect][24], [PsyPost - Psychology News][25])

## 10. Cross‑Cultural Generalizability

Large multi‑country datasets (spanning >50 nations) show partially invariant correlations (especially Extraversion and Openness patterns), while underscoring the need for culturally adaptive genre/property taxonomies and non‑Western musical enculturation considerations. ([Gwern][4], [University of Cambridge][26], [SAGE Journals][27])
Cultural cognition research demonstrates early enculturation effects on meter and emotional recognition, reinforcing that preference expression embeds culturally specific perceptual biases. ([Wikipedia][28])

## 11. Computational & Personality Computing Approaches

Recent work leverages naturalistic streaming logs, sequential behaviors, and higher‑level embeddings to compute personality predictions, sometimes outperforming excerpt‑based lab paradigms and enabling integration in recommender architectures. ([UC Press Online][2], [UC Press Online][2], [ACM Digital Library][29])
Hybrid or personality‑aware recommenders (including comparative analyses and user modeling frameworks) demonstrate diversity or accuracy gains when personality signals are incorporated alongside conventional collaborative filtering. ([CEUR-WS][30], [ResearchGate][31], [phenicx.upf.edu][32])

## 12. Meta‑Analytic and Critical Evaluations

Meta‑analysis indicates personality accounts for only a modest portion of inter‑individual variance in music preference, suggesting diminishing returns for purely trait‑based predictive models and highlighting the potential importance of functional/motivational music uses. ([ScienceDirect][33], [ScienceDirect][5])
Popular science and lay summaries echo limited effect sizes, urging caution in over‑interpreting playlist data as determinative of personality. ([CiteSeerX][6])

## 13. Ethical, Privacy, and Profiling Considerations

Scholarly and industry reflections point to the feasibility of inferring sensitive psychological attributes from passive listening but raise concerns around profiling, autonomy, and transparency; preliminary privacy sensitivity analyses indicate limited adoption barriers yet underscore need for governance frameworks. ([CiteSeerX][6], [UC Press Online][2], [CiteSeerX][6])
Emergent systems also increasingly integrate gamification and personal values, raising novel engagement vs. manipulation trade‑offs. ([SpringerLink][34])

## 14. State of the Field Summary

Collectively, the field has converged on robust but moderate personality–preference correlations, rich multidimensional preference structures, expanding computational inference targets (moral values, cognitive styles), and recognized ethical imperatives around privacy and interpretability, yet lacks unified multi‑method models, causal clarity, standardized cross‑cultural taxonomies, and privacy‑preserving deployment best practices. ([gosling.psy.utexas.edu][1], [projects.ori.org][3], [Gwern][4], [ScienceDirect][5], [UC Press Online][2])

---

## 15. Gap → Contribution Mapping (Concept Map Narrative)

| Gap / Open Issue                                         | Supporting Evidence                                                                            | Proposed Project Component (Contribution)                                                                                                                                             |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Modest variance explained by traits alone                | Meta‑analysis: limited incremental variance. ([ScienceDirect][5])                              | Integrate _multi‑modal feature set_ (acoustic + temporal behavior + lyric semantics + exploration metrics) to test incremental R² over pure trait models.                             |
| Measurement heterogeneity (genres vs. excerpts vs. logs) | Structural replication & method divergence. ([PMC][7], [gosling.psy.utexas.edu][10])           | Unified feature schema combining _behavioral logs + derived MUSIC factor projections_ (by training a mapping from track features to factor loadings).                                 |
| Limited facet / cognitive style integration              | Facet BFI‑2 effects; empathy–systemizing links. ([SpringerOpen][12], [David M. Greenberg][13]) | Collect brief facet + empathy/systemizing scales; concept bottleneck layer predicting interpretable psycho‑musical factors before traits.                                             |
| Causality vs. correlation (directionality)               | Stability & relocation minimal change. ([arXiv][18])                                           | Temporal sequencing design: restrict training features to _pre‑survey_ window; exploratory difference‑in‑differences with users who experience major context shifts (optional later). |
| Cross‑cultural taxonomy & enculturation                  | Multi‑country invariance + cultural cognition. ([Gwern][4], [Wikipedia][28])                   | Country‑specific normalization (genre ontology mapping + cultural diversity indices) and hierarchical mixed‑effects modeling.                                                         |
| Privacy & profiling risk                                 | Sensitivity / personality inference feasibility. ([CiteSeerX][6], [UC Press Online][2])        | Federated or local inference prototype + differential privacy noise on aggregated feature vectors; model card transparency.                                                           |
| Moral/value & lyric inferences emerging                  | Moral values prediction from lyrics. ([PsyPost - Psychology News][25])                         | Secondary exploratory module: moral value latent embedding (optional post‑MVP).                                                                                                       |
| Adolescent crystallization & developmental shifts        | Age trend & stability studies. ([ResearchGate][17], [gosling.psy.utexas.edu][1])               | Age‑stratified analysis of feature–trait effect moderation; visualize developmental effect sizes.                                                                                     |
| Mood regulation mediation (traits ↔ outcomes)            | Regulation & well‑being review. ([PMC][23], [Frontiers][22])                                   | Log self‑reported mood snapshots to separate _state_ vs. _trait_ contributions via mixed models.                                                                                      |

---

## 16. Formal Aims & Hypotheses (Aligned to Gaps)

**Aim 1:** Improve trait inference accuracy via multi‑modal psycho‑musical feature representation beyond genre counts.
_H1:_ Adding lyric lexical/emotion and temporal exploration features increases cross‑validated Openness & Extraversion prediction R² over acoustic baseline (ΔR² > 0.05). ([gosling.psy.utexas.edu][1], [ScienceDirect][24])

**Aim 2:** Integrate empathy–systemizing and BFI‑2 facets using a concept bottleneck architecture to produce transparent intermediate psycho‑musical concepts (e.g., “complexity seeking,” “lyric emotional density”).
_H2:_ Concept bottleneck model retains ≥95% of direct model predictive performance while yielding human‑interpretable concept attributions. ([David M. Greenberg][13], [Autism Research Centre][14])

**Aim 3:** Evaluate cultural moderation of key trait–feature links.
_H3:_ Openness–genre diversity slope varies by a cultural enculturation diversity index (random slope variance significant, p<0.05). ([Gwern][4], [Wikipedia][28])

**Aim 4:** Assess incremental ethical/privacy feasibility.
_H4:_ Federated personality model trained on local feature summaries shows <10% degradation in Pearson r vs. central model for Openness & Extraversion. ([CiteSeerX][6], [UC Press Online][2])

**Aim 5 (Exploratory):** Distinguish state mood regulation features from trait-linked baseline patterns.
_H5:_ Inclusion of short‑term mood self‑reports reduces residual Neuroticism variance by capturing valence variance features’ state component. ([PMC][21], [PMC][23])

---

## 17. MVP Build Plan (Research‑Informed)

| Layer                         | MVP Action                                                                                                                                              | Linked Literature Rationale                                                                                                                          |                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Data Ingestion                | Spotify OAuth + 6‑month play history + audio features                                                                                                   | Naturalistic logs needed for ecological validity. ([UC Press Online][2])                                                                             |                                                      |
| Survey Module                 | TIPI (10 items) + optional brief Empathy–Systemizing short form (phase 2)                                                                               | Capture baseline trait & cognitive style anchors. ([David M. Greenberg][13])                                                                         |                                                      |
| Feature Engineering           | Acoustic means/variances, genre entropy, exploration ratio, session structure, energy–valence correlation, lyric lexical richness & emotion proportions | Each aligns with documented trait links (complexity, energy, affect regulation). ([gosling.psy.utexas.edu][1], [ScienceDirect][24], [Frontiers][22]) |                                                      |
| Model Baselines               | Ridge & Random Forest multi‑target regressors                                                                                                           | Interpretable + non‑linear baselines before deep sequence models. ([CEUR-WS][30])                                                                    |                                                      |
| Evaluation                    | 5‑fold CV; metrics: Pearson r, RMSE; bootstrap CIs; ablation removing each feature cluster                                                              | Needed due to modest effect sizes & to show incremental value. ([ScienceDirect][5])                                                                  |                                                      |
| Explainability                | SHAP + feature→plain language mapping; later concept bottleneck                                                                                         | Supports ethical transparency, mitigates profiling opacity. ([CiteSeerX][6])                                                                         |                                                      |
| Privacy (Phase 2)             | Local feature extraction + simulated federated averaging experiment                                                                                     | Addresses sensitivity findings & ethics discourse. ([CiteSeerX][6])                                                                                  |                                                      |
| Cultural Extension (Phase 2+) | Country code normalization & mixed‑effects model (trait \~ feature + (feature                                                                           | country))                                                                                                                                            | Tests invariance vs. moderation claims. ([Gwern][4]) |
| Developmental Slice (If ages) | Age‑stratified effect size report, compare adolescent vs. adult subsamples                                                                              | Addresses consolidation/crystallization dynamics. ([ResearchGate][17])                                                                               |                                                      |
| Mood State Capture (Optional) | Lightweight mood check (valence/arousal sliders) before sessions                                                                                        | Disentangle state regulation from stable preference. ([PMC][21])                                                                                     |                                                      |

**Success Thresholds (Phase 1):** r ≥ 0.20 for Openness or Extraversion; calibrated uncertainty intervals; model card with limitations referencing modest meta‑analytic effect sizes. ([ScienceDirect][5])

---

## 18. Methodological Notes

**Sampling & Power:** For expected correlations \~0.25 (Openness) you need \~125–150 users for 80% power (standard correlation power approximation); oversample to 200 to handle data attrition. (Inference grounded in documented moderate effect sizes.) ([ScienceDirect][5])

**Feature Validity Checks:** Ensure distribution sanity (0–1 bounds for Spotify normalized metrics) and test–retest reliability over a short recrawl window for preference stability. ([gosling.psy.utexas.edu][1])

**Cross‑Validation Strategy:** User‑level splits (no leakage across folds) respecting temporal cutoff (plays strictly pre‑survey to support directional inference). ([arXiv][18])

**Ethics/Consent Copy:** Emphasize: correlations are probabilistic, limited variance explained, not diagnostic of mental health or moral values; offer deletion and local data processing options. ([CiteSeerX][6], [PsyPost - Psychology News][25])

---

## 19. Planned Extensions Beyond MVP

| Extension                                      | Trigger Criterion                          | Literature Anchor                                                                               |
| ---------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| Sequence Transformer (temporal dynamics)       | ≥300 users + adequate sequence length      | Naturalistic sequential inference advances. ([UC Press Online][2])                              |
| Concept Bottleneck (psycho‑musical constructs) | Stable baseline + defined concept taxonomy | Empathy/systemizing & perceptual attribute frameworks. ([Autism Research Centre][14], [PMC][7]) |
| Federated + DP                                 | Privacy interest from users or partnership | Profiling sensitivity analyses. ([CiteSeerX][6])                                                |
| Moral Value Prediction                         | Lyric embedding pipeline validated         | Moral value inference from songs. ([PsyPost - Psychology News][25])                             |
| Mixed‑Effects Cultural Model                   | ≥5 countries with n≥25 each                | Cross‑cultural invariance / moderation. ([Gwern][4])                                            |

---

## 20. Risk & Mitigation (Research Focused)

| Risk                                      | Impact                   | Mitigation                                                                                                  |
| ----------------------------------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Low predictive uplift vs. literature      | Weak value proposition   | Multi‑modal features; report calibration & interpretability rather than just accuracy. ([ScienceDirect][5]) |
| Construct drift (api or listening change) | Model decay              | Periodic retrain & population stability index monitoring. ([UC Press Online][2])                            |
| Over‑interpretation by users              | Ethical concern          | Confidence intervals + explicit limitation warnings. ([CiteSeerX][6])                                       |
| Cultural bias in genre taxonomy           | Reduced generalizability | Map tracks to acoustic attribute space + locale normalization. ([Wikipedia][28])                            |
| Privacy backlash                          | Attrition                | Offer local-only mode & federated prototype path. ([CiteSeerX][6])                                          |

---

## 21. Reporting & Dissemination Structure

**Paper Outline:**

1. Abstract
2. Introduction (context, modest effect sizes, need for integrative model) ([ScienceDirect][5])
3. Related Work (structure models, trait links, cognitive style, cross‑cultural, computational, privacy) ([gosling.psy.utexas.edu][1], [projects.ori.org][3], [Gwern][4], [David M. Greenberg][13], [UC Press Online][2])
4. Methods (participants, data collection timeline, surveys, features, modeling, ethics) ([gosling.psy.utexas.edu][1], [UC Press Online][2])
5. Results (predictive performance, ablations, cultural moderation, interpretability) ([SpringerOpen][12], [Gwern][4])
6. Discussion (interpret effect magnitudes, limitations, privacy) ([ScienceDirect][5], [CiteSeerX][6])
7. Future Work (sequence models, concept bottlenecks, DP/federated) ([CiteSeerX][6], [UC Press Online][2])
8. Ethical Statement (limitations, non-diagnostic) ([PMC][23])
9. References (URLs listed)

---

## 22. Immediate Action Checklist (Next 7 Days)

1. Finalize consent + limitation language referencing modest variance and privacy concerns. ([ScienceDirect][5], [CiteSeerX][6])
2. Implement ingestion + survey capture; lock temporal cutoff logic. ([arXiv][18])
3. Engineer initial feature set (acoustic, diversity, exploration, lyric lexical metrics). ([gosling.psy.utexas.edu][1], [ScienceDirect][24])
4. Baseline modeling & bootstrap uncertainty; create model card referencing meta-analysis effect sizes. ([ScienceDirect][5])
5. SHAP explanation layer + human-readable feature glossary (linking constructs like exploration → Openness). ([gosling.psy.utexas.edu][1])
6. Draft Results template with placeholders for R, RMSE, ΔR² and cultural subgroup analysis sections. ([Gwern][4])

---

## 23. Raw URL Reference List (Primary & Key Supplementary Sources)

> **Note:** Some entries (popular press / Wikipedia) are contextual or translational; prioritize peer‑reviewed sources for scholarly citation.

```
1. Rentfrow & Gosling (2003) The Do Re Mi's of Everyday Life (PDF) https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JPSP03musicdimensions.pdf  :contentReference[oaicite:76]{index=76}
2. Rentfrow et al. (2011) Structure of Musical Preferences (MUSIC model) https://projects.ori.org/lrg/PDFs_papers/RentfrowEtal2011StrucMusicPrefsJPSP.pdf  :contentReference[oaicite:77]{index=77}
3. STOMP scale description (Gosling Lab) https://gosling.psy.utexas.edu/scales-weve-developed/short-test-of-music-preferences-stomp/  :contentReference[oaicite:78]{index=78}
4. STOMP interactive (scale format) https://gosling.psy.utexas.edu/scales-weve-developed/short-test-of-music-preferences-stomp/stomp/  :contentReference[oaicite:79]{index=79}
5. Alternative STOMP hosting https://sjdm.org/dmidi/Short_Test_Of_Music_Preferences.html  :contentReference[oaicite:80]{index=80}
6. Cognitive styles & music (Greenberg et al. 2015) https://www.davidmgreenberg.com/wp-content/uploads/2018/11/greenberg-et-al-2015-musical-preferences-are-linked-to-cognitive-styles.pdf  :contentReference[oaicite:81]{index=81}
7. Empathy/systemizing & music (Concept review) https://docs.autismresearchcentre.com/papers/2015_Greenberg%2CRentfrow%2CBaron-Cohen_Can_Music_Increase_Emapthy.pdf  :contentReference[oaicite:82]{index=82}
8. Empathy & attribute preferences (music/emotion) https://emusicology.org/index.php/EMR/article/view/4572/4174  :contentReference[oaicite:83]{index=83}
9. Cross-cultural 53 countries Greenberg et al. (PDF) https://gwern.net/doc/psychology/personality/2022-greenberg.pdf  :contentReference[oaicite:84]{index=84}
10. Cambridge summary cross-cultural study https://www.cam.ac.uk/stories/musical-preferences-unite-personalities-worldwide  :contentReference[oaicite:85]{index=85}
11. Recent cross-cultural relationship article https://journals.sagepub.com/doi/10.1177/10298649241287072  :contentReference[oaicite:86]{index=86}
12. Meta-analysis personality & musical style https://www.sciencedirect.com/science/article/pii/S0191886917303215  :contentReference[oaicite:87]{index=87}
13. Meta-analysis abstract (alt link) https://www.sciencedirect.com/science/article/abs/pii/S0191886917303215  :contentReference[oaicite:88]{index=88}
14. Personality computing naturalistic behavior (Collabra) https://online.ucpress.edu/collabra/article/9/1/75214/196347/Personality-Computing-With-Naturalistic-Music  :contentReference[oaicite:89]{index=89}
15. Spotify ML personality overview https://research.atspotify.com/just-the-way-you-are-music-listening-and-personality  :contentReference[oaicite:90]{index=90}
16. Duplicate canonical Spotify article (archival) https://research.atspotify.com/2020/12/just-the-way-you-are-music-listening-and-personality/  :contentReference[oaicite:91]{index=91}
17. Personality-based recommender enhancement (UMAP) https://phenicx.upf.edu/system/files/publications/UMAP.pdf  :contentReference[oaicite:92]{index=92}
18. Comparative personality-based RS study (CEUR) https://ceur-ws.org/Vol-1680/paper8.pdf  :contentReference[oaicite:93]{index=93}
19. User modeling for music RS (ResearchGate) https://www.researchgate.net/publication/307587234_Personality-Based_User_Modeling_for_Music_Recommender_Systems  :contentReference[oaicite:94]{index=94}
20. BFI-2 facets & recommendation error https://asmp-eurasipjournals.springeropen.com/articles/10.1186/s13636-022-00269-0  :contentReference[oaicite:95]{index=95}
21. Lyric words & personality https://www.sciencedirect.com/science/article/abs/pii/S0092656618303659  :contentReference[oaicite:96]{index=96}
22. Moral values & music preferences (PsyPost summary) https://www.psypost.org/music-preferences-and-moral-values-new-study-uncovers-surprising-connections/  :contentReference[oaicite:97]{index=97}
23. Mood regulation & mental health (PMC article) https://pmc.ncbi.nlm.nih.gov/articles/PMC4508630/  :contentReference[oaicite:98]{index=98}
24. Youth depression regulation pathways (Frontiers) https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01199/full  :contentReference[oaicite:99]{index=99}
25. Systematic review personality, music, well-being https://pmc.ncbi.nlm.nih.gov/articles/PMC11064775/  :contentReference[oaicite:100]{index=100}
26. Adolescent crystallization review https://www.researchgate.net/publication/276086511_Music_Preferences_and_the_Adolescent_Brain_A_Review_of_Literature  :contentReference[oaicite:101]{index=101}
27. Age trends music engagement & preferences https://www.researchgate.net/publication/253337104_Music_Through_the_Ages_Trends_in_Musical_Engagement_and_Preferences_From_Adolescence_Through_Middle_Adulthood  :contentReference[oaicite:102]{index=102}
28. Longitudinal stability (test-retest & dimensions) https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JPSP03musicdimensions.pdf  :contentReference[oaicite:103]{index=103}
29. Relocation & musical identity (arXiv) https://arxiv.org/abs/1904.04948  :contentReference[oaicite:104]{index=104}
30. Peer processes & externalizing (PMC) https://pmc.ncbi.nlm.nih.gov/articles/PMC5491604/  :contentReference[oaicite:105]{index=105}
31. Friendship formation & early adolescence (thesis) https://research-portal.uu.nl/files/2119270/mulder.pdf  :contentReference[oaicite:106]{index=106}
32. Classical developmental preference stability (JSTOR) https://www.jstor.org/stable/2489308  :contentReference[oaicite:107]{index=107}
33. Cultural cognition & enculturation (overview) https://en.wikipedia.org/wiki/Culture_in_music_cognition  :contentReference[oaicite:108]{index=108}
34. Psychology of music preference (overview) https://en.wikipedia.org/wiki/Psychology_of_music_preference  :contentReference[oaicite:109]{index=109}
35. Privacy sensitivity user profile info RS https://citeseerx.ist.psu.edu/document?doi=30db2b0c2dadfe4fbccec78351adae6084663ffb&repid=rep1&type=pdf  :contentReference[oaicite:110]{index=110}
36. Gamified values-based recommender https://link.springer.com/article/10.1007/s11042-024-20588-y  :contentReference[oaicite:111]{index=111}
37. Predicting personality from listening behavior (academic article) https://journals.sagepub.com/doi/pdf/10.1177/03057356221135346  :contentReference[oaicite:112]{index=112}
38. Inferring traits from listening history (ACM) https://dl.acm.org/doi/10.1145/2390848.2390856  :contentReference[oaicite:113]{index=113}
```

[1]: https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JPSP03musicdimensions.pdf?utm_source=chatgpt.com "[PDF] The Structure and Personality Correlates of Music Preferences"
[2]: https://online.ucpress.edu/collabra/article/9/1/75214/196347/Personality-Computing-With-Naturalistic-Music?utm_source=chatgpt.com "Personality Computing With Naturalistic Music Listening Behavior"
[3]: https://projects.ori.org/lrg/PDFs_papers/RentfrowEtal2011StrucMusicPrefsJPSP.pdf?utm_source=chatgpt.com "[PDF] The Structure of Musical Preferences: A Five-Factor Model"
[4]: https://gwern.net/doc/psychology/personality/2022-greenberg.pdf?utm_source=chatgpt.com "[PDF] A study of preferential reactions to Western music in 53 countries"
[5]: https://www.sciencedirect.com/science/article/abs/pii/S0191886917303215?utm_source=chatgpt.com "Can personality traits predict musical style preferences? A meta ..."
[6]: https://citeseerx.ist.psu.edu/document?doi=30db2b0c2dadfe4fbccec78351adae6084663ffb&repid=rep1&type=pdf&utm_source=chatgpt.com "[PDF] The Sensitivities of User Profile Information in Music Recommender ..."
[7]: https://pmc.ncbi.nlm.nih.gov/articles/PMC4016970/?utm_source=chatgpt.com "A Replication and Extension of the MUSIC Model - PubMed Central"
[8]: https://www.researchgate.net/figure/Mean-Mellow-Unpretentious-Sophisticated-Intense-and-Contemporary-preference-scores-by_fig1_253337104?utm_source=chatgpt.com "Figure 1. Mean Mellow, Unpretentious, Sophisticated, Intense, and..."
[9]: https://gosling.psy.utexas.edu/scales-weve-developed/short-test-of-music-preferences-stomp/?utm_source=chatgpt.com "Short Test Of Music Preferences (STOMP) - Gosling Lab"
[10]: https://gosling.psy.utexas.edu/scales-weve-developed/short-test-of-music-preferences-stomp/stomp/?utm_source=chatgpt.com "STOMP - Gosling Lab"
[11]: https://sjdm.org/dmidi/Short_Test_Of_Music_Preferences.html?utm_source=chatgpt.com "Short Test Of Music Preferences"
[12]: https://asmp-eurasipjournals.springeropen.com/articles/10.1186/s13636-022-00269-0?utm_source=chatgpt.com "Beyond the Big Five personality traits for music recommendation ..."
[13]: https://www.davidmgreenberg.com/wp-content/uploads/2018/11/greenberg-et-al-2015-musical-preferences-are-linked-to-cognitive-styles.pdf?utm_source=chatgpt.com "[PDF] musical preferences are linked to cognitive styles"
[14]: https://docs.autismresearchcentre.com/papers/2015_Greenberg%2CRentfrow%2CBaron-Cohen_Can_Music_Increase_Emapthy.pdf?utm_source=chatgpt.com "[PDF] Can Music Increase Empathy? Interpreting Musical Experience ..."
[15]: https://emusicology.org/index.php/EMR/article/view/4572/4174?utm_source=chatgpt.com "How, Rather Than What Type of, Music Increases Empathy"
[16]: https://www.researchgate.net/publication/276086511_Music_Preferences_and_the_Adolescent_Brain_A_Review_of_Literature?utm_source=chatgpt.com "Music Preferences and the Adolescent Brain: A Review of Literature"
[17]: https://www.researchgate.net/publication/253337104_Music_Through_the_Ages_Trends_in_Musical_Engagement_and_Preferences_From_Adolescence_Through_Middle_Adulthood?utm_source=chatgpt.com "(PDF) Music Through the Ages: Trends in Musical Engagement and ..."
[18]: https://arxiv.org/abs/1904.04948?utm_source=chatgpt.com "Environmental Changes and the Dynamics of Musical Identity"
[19]: https://pmc.ncbi.nlm.nih.gov/articles/PMC5491604/?utm_source=chatgpt.com "Music Preferences, Friendship, and Externalizing Behavior in Early ..."
[20]: https://research-portal.uu.nl/files/2119270/mulder.pdf?utm_source=chatgpt.com "[PDF] Music preferences and uses related to psychosocial functioning ..."
[21]: https://pmc.ncbi.nlm.nih.gov/articles/PMC4508630/?utm_source=chatgpt.com "The Change of Music Preferences Following the Onset of a Mental ..."
[22]: https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2019.01199/full?utm_source=chatgpt.com "Music Use for Mood Regulation: Self-Awareness and Conscious ..."
[23]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11064775/?utm_source=chatgpt.com "Personality characteristics, music listening, and psychological well ..."
[24]: https://www.sciencedirect.com/science/article/abs/pii/S0092656618303659?utm_source=chatgpt.com "Personality predicts words in favorite songs - ScienceDirect.com"
[25]: https://www.psypost.org/music-preferences-and-moral-values-new-study-uncovers-surprising-connections/?utm_source=chatgpt.com "Music preferences and moral values: New study uncovers surprising ..."
[26]: https://www.cam.ac.uk/stories/musical-preferences-unite-personalities-worldwide?utm_source=chatgpt.com "Musical preferences unite personalities across the globe"
[27]: https://journals.sagepub.com/doi/10.1177/10298649241287072?icid=int.sj-full-text.citing-articles.1&utm_source=chatgpt.com "Relationship between personality and music preference"
[28]: https://en.wikipedia.org/wiki/Culture_in_music_cognition?utm_source=chatgpt.com "Culture in music cognition"
[29]: https://dl.acm.org/doi/10.1145/2390848.2390856?utm_source=chatgpt.com "Inferring personal traits from music listening history"
[30]: https://ceur-ws.org/Vol-1680/paper8.pdf?utm_source=chatgpt.com "[PDF] A Comparative Analysis of Personality-Based Music Recommender ..."
[31]: https://www.researchgate.net/publication/307587234_Personality-Based_User_Modeling_for_Music_Recommender_Systems?utm_source=chatgpt.com "Personality-Based User Modeling for Music Recommender Systems"
[32]: https://phenicx.upf.edu/system/files/publications/UMAP.pdf?utm_source=chatgpt.com "[PDF] Enhancing Music Recommender Systems with Personality ..."
[33]: https://www.sciencedirect.com/science/article/pii/S0191886917303215?utm_source=chatgpt.com "Can personality traits predict musical style preferences? A meta ..."
[34]: https://link.springer.com/article/10.1007/s11042-024-20588-y?utm_source=chatgpt.com "Gamispotify: a gamified social music recommendation system based ..."
