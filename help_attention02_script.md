# Attention02 voiceover script (the math)

Total: 2280 frames at 30fps = 76 seconds.
Record one clip per scene, matching the time budget. On screen text is
minimal on purpose: CapCut auto captions will carry the words.

## 1. Bridge, 0 to 4s (frames 0 to 120)

Let us go into the mathematical implementation.

## 2. TokenizeScene, 4 to 12s (frames 120 to 360)

Text becomes tokens with IDs. We follow three tiny ones: the, cat, sat.

## 3. VectorScene, 12 to 22s (frames 360 to 660)

Each token becomes a vector: a column of numbers. Lay the three
columns down as rows, and you get matrix X, the input to attention.

## 4. QKVScene, 22 to 34s (frames 660 to 1020)

Now three small learned grids transform X. Same input, three roles. Q
holds what each token asks. K holds what each token offers. V holds
what each token carries.

## 5. ScoresScene, 34 to 48s (frames 1020 to 1440)

Flip K on its side. Now every question meets every offer. Q row one
dots K column two: one, plus four, plus nine. Fourteen. The full grid
lands, then everything is divided by root three.

## 6. SoftmaxScene, 48 to 58s (frames 1440 to 1740)

Scores become shares. Exponentiate row one, add them up, divide each by
the total. Fifteen, eighty four, one percent. Every row now sums to one.

## 7. OutputScene, 58 to 68s (frames 1740 to 2040)

Now mix the values. Row one takes fifteen percent of the first, eighty
four of the second, a touch of the third. That mix is the enriched token.

## 8. PipelineScene, 68 to 76s (frames 2040 to 2280)

Tokens to vectors to Q K V to scores to weights to output. Every token
enriched by every other. That is attention.
