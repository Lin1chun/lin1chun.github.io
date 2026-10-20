+++
author = ["Lin1chun"]
title = "Authoring Stage Taxonomy for Digital Garden"
date = "2025-07-28"
type = "post"
draft = false
coffee = 1
tags = ["authoring", "taxonomy"]
categories = ["authoring"]
stage = "evergreen"
history = [
  {date = "2025-07-26", stage="seedling"},
  {date = "2025-07-27", stage="budding"},
  {date = "2025-07-28", stage="evergreen"},
]
+++

This theme supports custom taxonomy and growth stage indicators.
By default `seedling`, `budding` and `evergreen` will have predefined indicator.
<!--more-->
But fist, it must be manually set up as follows:

1. Register the taxonomy in your `config.toml`:

```toml
[taxonomies]
    stage = "stage"
```

2. Create taxonomy folder and it's terms `_index.md`:

```
mysite/
    ├── ...
    ├── content/
    │   └── stage/
    │       ├─ seedling/
    │       │   └─ _index.md
    │       ├─ budding/
    │       │   └─ _index.md
    │       └─ evergreen/
    │           └─ _index.md
    └── ...
```

3. Within  `_index.md`, Set the stage `title` and `translationKey` if site is multilingual,
 you can also override custom `indicator` or `emoji`:

```yaml
---
title: 'Stage of me being Godzilla'
translationKey: godzilla
emoji: '🦖'
# indicator: 'https://example.com/indicator.svg'
---

You can write the introduction or blah blah blah here
```

4. Add the stage parameter into your post `index.md`:

```yaml
---
title: 'My Post'
stage: 'seedling'
---
```
