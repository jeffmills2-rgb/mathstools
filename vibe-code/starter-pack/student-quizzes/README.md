# Student Quizzes

Self-marking practice a student does on a device.

## The pattern

Every quiz page in this template has three parts:

1. **`makeQuestion()`** — returns `{prompt, answer}`. Usually the only function you
   rewrite to make a different quiz.
2. **`checkAnswer()`** — compares, gives feedback, records the attempt.
3. **The loop** — runs N questions, then shows a score and a review list.

See `stage-4/number/example-integers-quiz/index.html`, and
`stage-4/statistics/example-dot-plot/index.html`, whose teacher panel can fire every
misconception rule at the correct answer and tell you if any of them go off.

## Rules for this section

- **Nothing is stored or transmitted.** Scores live in a variable and disappear when
  the tab closes. No accounts, no database, no analytics. If you ever want results,
  the honest low-tech answer is "the student shows you the final screen".
- **Instructions on the page, in student language.** You will not be standing next to
  every device.
- **It must survive a wrong keystroke.** Empty box, a letter typed into a number
  field, Enter pressed twice — none of it should break the quiz.
- **Feedback says what the right answer was**, not just "incorrect".
- **Check the generator by hand** before a class sees it. Twenty questions, marked
  yourself. Every time.

## Folder convention

```
student-quizzes/<stage>/<topic>/<quiz-name>/index.html
```

Lowercase, hyphens, no spaces.
