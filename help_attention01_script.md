# Attention01 voiceover script (the intuition)

Total: 2430 frames at 30fps = 81 seconds.
Record one clip per scene, matching the time budget. On screen text is
minimal on purpose: CapCut auto captions will carry the words.

## 1. TitleScene, 0 to 5s (frames 0 to 150)

What is attention? The one idea behind modern AI, explained in ninety
seconds.

## 2. ProblemScene, 5 to 15s (frames 150 to 450)

You read this sentence and instantly know who it is. The animal. You
used grammar without thinking. But how does the model know?

## 3. TokenScene, 15 to 23s (frames 450 to 690)

First, the model chops your text into pieces called tokens. Now it has
pieces it can point at.

## 4. CompareScene, 23 to 38s (frames 690 to 1140)

Each token now checks the others. The word it asks, how much do you
matter to me? Most words barely matter. But animal scores zero point
four. And when tired asks, the answer is different.

## 5. HeadScene, 38 to 50s (frames 1140 to 1500)

But it depends on the question. Who is it? Attention lands on animal.
What could not be crossed? It lands on street. One question, one
pattern. That is a head.

## 6. MultiHeadScene, 50 to 65s (frames 1500 to 1950)

A real model asks many questions at once. Who did it. Where it
happened. Who is tired. Then it pools every answer into one meaning
per word. That is multi-head attention.

## 7. MeaningScene, 65 to 73s (frames 1950 to 2190)

Why does this matter? The word bank has no fixed meaning. Near river,
a riverbank. Near money, a money bank.

## 8. DefinitionScene, 73 to 81s (frames 2190 to 2430)

Formally, self-attention lets every token pull context from all
others, weighted by relevance. Next: the math and the code.
